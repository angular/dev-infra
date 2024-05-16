export const log = (...messages: any[]) => {
  // Don't show the log output in tests.
  if (process.argv.includes('--config=jasmine.json')) {
    return;
  }
  console.log(...messages);
};
