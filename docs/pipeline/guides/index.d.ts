// This definition file is a temporary workaround until the toolchain is able to read d.mts definition files
// TODO: delete this file when the toolchains supports .d.mts files
declare module 'shiki' {
  function createHighlighter(params: {themes: any; langs: string[]}): unknown;
  function createCssVariablesTheme(args: {
    name: string;
    variablePrefix: string;
    variableDefaults: {};
    fontStyle: boolean;
  }): unknown;

  type HighlighterGeneric<BundledLangKeys, BundledThemeKeys> = any;
}
