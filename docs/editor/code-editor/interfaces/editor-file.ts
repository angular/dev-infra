import {LRLanguage, LanguageSupport} from '@codemirror/language';

export interface EditorFile {
  filename: string;
  content: string;
  language: LanguageSupport | LRLanguage;
}
