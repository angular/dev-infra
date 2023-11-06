import {DocEntry} from '@angular/compiler-cli';
import {HasModuleName} from '../entities/traits';

export function addModuleName<T extends DocEntry>(entry: T, moduleName: string): T & HasModuleName {
  return {
    ...entry,
    moduleName,
  };
}
