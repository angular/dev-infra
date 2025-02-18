import {basename, join} from 'node:path';
import {cwd} from 'node:process';

join(basename(cwd()), 'test.txt');
