/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const pkgDir = join(import.meta.dirname, 'pkg_manual_chunks');

describe('angular_package_format with manual_chunks', () => {
  it('should create separate chunks and bundle files correctly', () => {
    expect(existsSync(pkgDir)).withContext(`Package directory ${pkgDir} does not exist`).toBeTrue();
    const fesmDir = join(pkgDir, 'fesm2022');
    const typesDir = join(pkgDir, 'types');

    expect(existsSync(fesmDir)).withContext('fesm2022 directory does not exist').toBeTrue();
    expect(existsSync(typesDir)).withContext('types directory does not exist').toBeTrue();

    // Check FESM files
    const fesmFiles = readdirSync(fesmDir);

    // Check that the chunk files exist
    expect(fesmFiles).toEqual(
      jasmine.arrayContaining(['manual_chunks.mjs', '_other_chunk-chunk.mjs']),
    );

    // Check content of manual_chunks.mjs to make sure it imports from the separate chunk
    const manualChunksFesmContent = readFileSync(join(fesmDir, 'manual_chunks.mjs'), 'utf-8');
    expect(manualChunksFesmContent).toContain('_other_chunk-chunk.mjs');

    // Check content of _other_chunk-chunk.mjs to make sure it contains 'fine' constant
    const otherChunkFesmContent = readFileSync(join(fesmDir, '_other_chunk-chunk.mjs'), 'utf-8');
    expect(otherChunkFesmContent).toContain('fine');

    // Check types files
    const typesFiles = readdirSync(typesDir);
    expect(typesFiles).toEqual(
      jasmine.arrayContaining(['manual_chunks.d.ts', '_other_chunk-chunk.d.ts']),
    );

    const manualChunksTypesContent = readFileSync(join(typesDir, 'manual_chunks.d.ts'), 'utf-8');
    expect(manualChunksTypesContent).toContain('_other_chunk-chunk');
  });
});
