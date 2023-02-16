import {blaze} from './worker_protocol.cjs';
import {Writable} from 'stream';

export type WorkRequest = blaze.worker.WorkRequest & {
  signal: AbortSignal;
  output: Writable;
};
export type ImplementationFunc = (request: WorkRequest) => Promise<number>;

export declare function enterWorkerLoop(implementation: ImplementationFunc): Promise<void>;
export declare function isPersistentWorker(args: string[]): boolean;

declare const exports: {
  enterWorkerLoop: typeof enterWorkerLoop;
  isPersistentWorker: typeof isPersistentWorker;
};

export default exports;
