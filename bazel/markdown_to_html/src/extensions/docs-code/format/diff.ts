import {diffLines, Change as DiffChange} from 'diff';

export interface DiffMetadata {
  code: string;
  linesAdded: number[];
  linesRemoved: number[];
}

export function calculateDiff(beforeCode: string, afterCode: string): DiffMetadata {
  const change = diffLines(afterCode, beforeCode);

  const getLinesRange = (start: number, count: number): number[] =>
    Array.from(Array(count).keys()).map((i) => i + start);

  let processedLines = 0;

  return change.reduce(
    (prev: DiffMetadata, part: DiffChange) => {
      const diff: DiffMetadata = {
        code: `${prev.code}${part.value}`,
        linesAdded: part.added
          ? [...prev.linesAdded, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesAdded,
        linesRemoved: part.removed
          ? [...prev.linesRemoved, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesRemoved,
      };
      processedLines += part.count ?? 0;
      return diff;
    },
    {
      code: '',
      linesAdded: [],
      linesRemoved: [],
    },
  );
}
