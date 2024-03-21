import {
  FileAndContentRecord,
  PackageJson,
  TutorialConfig,
  TutorialMetadata,
} from '../../interfaces';

/** Generate the metadata.json content for a provided tutorial config. */
export async function generateMetadata(
  config: TutorialConfig,
  files: FileAndContentRecord,
): Promise<TutorialMetadata> {
  const tutorialFiles: FileAndContentRecord = {};
  const {dependencies, devDependencies} = JSON.parse(<string>files['package.json']) as PackageJson;

  config.openFiles?.forEach((file) => (tutorialFiles[file] = files[file]));

  return {
    type: config.type,
    openFiles: config.openFiles || [],
    allFiles: Object.keys(files),
    tutorialFiles: tutorialFiles,
    hiddenFiles: [],
    dependencies: {
      ...dependencies,
      ...devDependencies,
    },
  };
}
