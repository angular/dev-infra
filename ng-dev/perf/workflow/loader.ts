import {readFile} from 'fs/promises';
import {parse} from 'yaml';

export interface Workflow {
  name: string;
  workflow: string[];
  prepare?: string[];
  cleanup?: string[];
}

export async function loadWorkflows(src: string) {
  const rawWorkflows = await readFile(src, {encoding: 'utf-8'});
  return parse(rawWorkflows).workflows as Workflow[];
}
