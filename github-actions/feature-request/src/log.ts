export const log = (...messages: any[]) => {
  if (process.argv.includes('--config=jasmine.json')) {
    return;
  }
  console.log(...messages);
};
