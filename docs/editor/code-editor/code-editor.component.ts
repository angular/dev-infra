/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgFor, NgIf} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {debounceTime, map} from 'rxjs';

import {TerminalType} from '../services/terminal-handler.service';
import {EmbeddedTutorialManager} from '../services/embedded-tutorial-manager.service';

import {CodeMirrorEditor} from './services/code-mirror-editor.service';
import {DiagnosticWithLocation, DiagnosticsState} from './services/diagnostics-state.service';
import {DownloadManager} from '../services/download-manager.service';
import {IconComponent} from '../../components/icon/icon.component';

export const REQUIRED_FILES = new Set(['src/main.ts', 'src/index.html']);

@Component({
  selector: 'docs-tutorial-code-editor',
  standalone: true,
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, MatTabsModule, IconComponent],
})
export class CodeEditor implements AfterViewInit, OnDestroy {
  @ViewChild('codeEditorWrapper') private codeEditorWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild(MatTabGroup) private matTabGroup!: MatTabGroup;

  private createFileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('createFileInput') protected set setFileInputRef(
    element: ElementRef<HTMLInputElement>,
  ) {
    if (element) {
      element.nativeElement.focus();
      this.createFileInputRef = element;
    }
  }

  private readonly destroyRef = inject(DestroyRef);

  private readonly codeMirrorEditor = inject(CodeMirrorEditor);
  private readonly diagnosticsState = inject(DiagnosticsState);
  private readonly downloadManager = inject(DownloadManager);
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);

  private readonly errors$ = this.diagnosticsState.diagnostics$.pipe(
    // Display errors one second after code update
    debounceTime(1000),
    map((diagnosticsItem) =>
      diagnosticsItem
        .filter((item) => item.severity === 'error')
        .sort((a, b) =>
          a.lineNumber != b.lineNumber
            ? a.lineNumber - b.lineNumber
            : a.characterPosition - b.characterPosition,
        ),
    ),
    takeUntilDestroyed(this.destroyRef),
  );

  readonly TerminalType = TerminalType;

  readonly displayErrorsBox = signal<boolean>(false);
  readonly errors = signal<DiagnosticWithLocation[]>([]);
  readonly files = this.codeMirrorEditor.openFiles;
  readonly isCreatingFile = signal<boolean>(false);

  ngAfterViewInit() {
    this.codeMirrorEditor.init(this.codeEditorWrapperRef.nativeElement);
    this.listenToDiagnosticsChange();

    this.listenToTabChange();
    this.setSelectedTabOnTutorialChange();
  }

  ngOnDestroy(): void {
    this.codeMirrorEditor.disable();
  }

  async downloadCurrentCodeEditorState(): Promise<void> {
    const name = this.embeddedTutorialManager.tutorialId();
    await this.downloadManager.downloadCurrentStateOfTheSolution(name);
  }

  closeErrorsBox(): void {
    this.displayErrorsBox.set(false);
  }

  canDeleteFile(filename: string) {
    return !REQUIRED_FILES.has(filename);
  }

  async deleteFile(filename: string) {
    await this.codeMirrorEditor.deleteFile(filename);
    this.matTabGroup.selectedIndex = 0;
  }

  onAddButtonClick() {
    this.isCreatingFile.set(true);
    this.matTabGroup.selectedIndex = this.files().length;
  }

  async createFile(event: SubmitEvent) {
    if (!this.createFileInputRef) return;

    event.preventDefault();

    const newFileInputValue = this.createFileInputRef.nativeElement.value;

    if (newFileInputValue) {
      if (newFileInputValue.includes('..')) {
        alert('File name can not contain ".."');
        return;
      }

      // src is hidden from users, here we manually add it to the new filename
      const newFile = 'src/' + newFileInputValue;

      if (this.files().find(({filename}) => filename.includes(newFile))) {
        alert('File already exists');
        return;
      }

      await this.codeMirrorEditor.createFile(newFile);
    }

    this.isCreatingFile.set(false);
  }

  private listenToDiagnosticsChange(): void {
    this.errors$.subscribe((diagnostics) => {
      this.errors.set(diagnostics);
      this.displayErrorsBox.set(diagnostics.length > 0);
    });
  }

  private setSelectedTabOnTutorialChange() {
    this.embeddedTutorialManager.tutorialChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // selected file on project change is always the first
        this.matTabGroup.selectedIndex = 0;
      });
  }

  private listenToTabChange() {
    this.matTabGroup.selectedIndexChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        const selectedFile = this.files()[index];

        if (selectedFile) {
          this.codeMirrorEditor.changeCurrentFile(selectedFile.filename);
        }
      });
  }
}
