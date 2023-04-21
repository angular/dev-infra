import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {MatMenuModule} from '@angular/material/menu';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BlockedUserFromFirestore, BlockService} from '../block.service.js';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {QueryDocumentSnapshot} from '@angular/fire/firestore';

@Component({
  selector: 'block-user',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'outline', floatLabel: 'always'},
    },
  ],
  templateUrl: './block-user.component.html',
  styleUrls: ['./block-user.component.scss'],
})
export class BlockUserComponent {
  dialogRef = inject(MatDialogRef<BlockUserComponent>);
  readonly providedData: {
    editMode?: boolean;
    user?: QueryDocumentSnapshot<BlockedUserFromFirestore>;
  } = inject(MAT_DIALOG_DATA) || {};
  readonly editMode = this.providedData.user !== undefined;
  private blockService = inject(BlockService);

  constructor() {
    this.blockUserForm.patchValue(this.providedData.user?.data() || {});
  }

  tomorrow = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  })();
  fiveYearsFromToday = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    return date;
  })();
  week = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  })();
  month = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  })();
  year = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  })();

  blockUserForm = new FormGroup({
    username: new FormControl<string>('', {nonNullable: true}),
    blockUntil: new FormControl<Date | false>(this.year, {nonNullable: true}),
    context: new FormControl<string>('', {nonNullable: true}),
    comments: new FormControl<string>('', {nonNullable: true}),
    blockedOn: new FormControl<Date>(new Date(), {nonNullable: true}),
    blockedBy: new FormControl<string>('', {nonNullable: true}),
  });

  async blockUser() {
    this.blockUserForm.disable();
    this.dialogRef.disableClose = true;

    this.blockService
      .block(this.blockUserForm.getRawValue())
      .then(() => {
        this.dialogRef.close();
      })
      .finally(() => {
        this.blockUserForm.enable();
        this.dialogRef.disableClose = false;
      });
  }

  async updateUser() {
    this.dialogRef.disableClose = true;
    this.blockService
      .update(this.providedData.user!, this.blockUserForm.value)
      .then(() => {
        this.dialogRef.close();
      }, console.error)
      .finally(() => {
        this.blockUserForm.enable();
        this.setEditFormEnabledAndDisabledFields();
      });
  }

  setEditFormEnabledAndDisabledFields() {
    this.blockUserForm.controls.username.disable();
    this.blockUserForm.controls.context.disable();
    this.blockUserForm.controls.blockedBy.disable();
    this.blockUserForm.controls.blockedOn.disable();
  }

  ngOnInit() {
    if (this.editMode) {
      this.setEditFormEnabledAndDisabledFields();
    }
  }

  setBlockUntilAsIndefinite() {
    this.blockUserForm.controls.blockUntil.setValue(false);
    this.blockUserForm.controls.blockUntil.setErrors(null);
  }
}
