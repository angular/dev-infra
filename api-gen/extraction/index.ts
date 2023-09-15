import {writeFileSync} from 'fs';
// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {NgtscProgram, CompilerOptions, createCompilerHost} from '@angular/compiler-cli';

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  const compilerOptions: CompilerOptions = {};
  const compilerHost = createCompilerHost({options: compilerOptions});
  const program: NgtscProgram = new NgtscProgram(srcs.split(','), compilerOptions, compilerHost);
  console.log(`NgtscProgram successfully created: ${!!program}`);

  // TODO: call the real API when it is published to npm.
  //     When tested with a locally built @angular/compiler-cli, it works!
  // const output = JSON.stringify(program.getApiDocumentation());
  const output = JSON.stringify({entries: []});

  writeFileSync(outputFilenameExecRootRelativePath, output, {encoding: 'utf8'});
}

main();
