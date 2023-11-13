/**
 * The function used to generate ranges of highlighted or visible lines in code blocks
 */
export function parseRangeString(rangeString: string | undefined): number[] {
  if (rangeString === undefined) {
    return [];
  }
  const getAllValuesFromRange = (range: any[]) => {
    const [start, end] = range;
    for (let i = start; i <= end; i++) {
      result.push(i - 1);
    }
  };

  let result: number[] = [];
  try {
    const boundaryValueArray = JSON.parse(rangeString) as any;
    if (!Array.isArray(boundaryValueArray)) {
      throw new Error('Provided token has wrong format!\n' /* boundaryValueArray */);
    }
    // Flat Array
    if (
      boundaryValueArray.length === 2 &&
      !Array.isArray(boundaryValueArray[0]) &&
      !Array.isArray(boundaryValueArray[1])
    ) {
      getAllValuesFromRange(boundaryValueArray);
    } else {
      for (const range of boundaryValueArray) {
        if (Array.isArray(range) && range.length === 2) {
          getAllValuesFromRange(range);
        } else if (!Number.isNaN(range)) {
          result.push(Number(range - 1));
        } else {
          throw new Error('Input has wrong format!\n' /* range */);
        }
      }
    }

    return result;
  } catch {
    return [];
  }
}
