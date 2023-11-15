import {CodeToken} from '.';
import {regionParser} from '../regions/region-parser';
import {FileType} from '../sanitizers/eslint';

export function extractRegions(token: CodeToken) {
  const fileType: FileType | undefined = token.path?.split('.').pop() as FileType;
  const parsedRegions = regionParser(token.code, fileType);
  token.code = parsedRegions.contents;
  if (token.visibleRegion) {
    const region = parsedRegions.regionMap[token.visibleRegion];
    if (!region) {
      throw new Error(`Cannot find ${token.visibleRegion} in ${token.path}!`);
    }
    token.visibleLines = `[${region.ranges.map(
      (range) => `[${range.from}, ${range.to ?? parsedRegions.totalLinesCount + 1}]`,
    )}]`;
  }
}
