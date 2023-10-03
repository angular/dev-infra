import {writeFileSync} from 'fs';
// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {NgtscProgram, CompilerOptions, createCompilerHost} from '@angular/compiler-cli';

function main() {
  const [moduleName, entryPointExecRootRelativePath, srcs, outputFilenameExecRootRelativePath] =
    process.argv.slice(2);

  const compilerOptions: CompilerOptions = {};
  const compilerHost = createCompilerHost({options: compilerOptions});
  const program: NgtscProgram = new NgtscProgram(srcs.split(','), compilerOptions, compilerHost);

  const output = JSON.stringify({
    moduleName: moduleName,
    entries: program.getApiDocumentation(entryPointExecRootRelativePath),
  });

  writeFileSync(outputFilenameExecRootRelativePath, output, {encoding: 'utf8'});
}

main();
