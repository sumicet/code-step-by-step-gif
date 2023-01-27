import { Range } from "./types";

/**
 * range A starts before range B and they intersect
 */
export const rangeStartsBeforeRange = (rangeA: Range, rangeB: Range) =>
    rangeA.endLineNumber < rangeB.startLineNumber ||
    (rangeA.endLineNumber === rangeB.startLineNumber &&
        rangeA.endColumn <= rangeB.startColumn);

/**
 * range A starts after range B and they intersect
 */
export const rangeStartsAfterRange = (rangeA: Range, rangeB: Range) =>
    rangeA.startLineNumber > rangeB.endLineNumber ||
    (rangeA.startLineNumber === rangeB.endLineNumber &&
        rangeA.startColumn >= rangeB.endColumn);

const rangeIntersectsPosition = (
    range: Range,
    { column, lineNumber }: { lineNumber: number; column: number }
) => {
    return (
        // Offset is between the start and end of the range
        (range.startLineNumber < lineNumber &&
            range.endLineNumber > lineNumber) ||
        // Offset is on the same line as the start
        (range.startLineNumber === lineNumber && range.startColumn <= column) ||
        // Offset is on the same line as the end
        (range.endLineNumber === lineNumber && range.endColumn > column)
    );
};

/**
 * range A starts before range B and they intersect
 */
export const rangeIntersectsStartOfRange = (rangeA: Range, rangeB: Range) =>
    rangeIntersectsPosition(rangeA, {
        column: rangeB.startColumn,
        lineNumber: rangeB.startLineNumber,
    });

/**
 * range A starts after range B and they intersect
 */
export const rangeIntersectsEndOfRange = (rangeA: Range, rangeB: Range) =>
    rangeIntersectsPosition(rangeA, {
        column: rangeB.endColumn,
        lineNumber: rangeB.endLineNumber,
    });

/**
 * range A contains range B
 */
export const rangeContainsRange = (rangeA: Range, rangeB: Range) =>
    rangeIntersectsStartOfRange(rangeA, rangeB) &&
    rangeIntersectsEndOfRange(rangeA, rangeB);

export const rangeIntersectsRange = (rangeA: Range, rangeB: Range) => {
    if (rangeContainsRange(rangeA, rangeB)) return "contains";
    if (rangeContainsRange(rangeB, rangeA)) return "contained";
    if (rangeIntersectsStartOfRange(rangeA, rangeB)) return "before";
    if (rangeIntersectsEndOfRange(rangeA, rangeB)) return "after";
    return false;
};

export const moveRangeByRange = (
    rangeA: Range,
    rangeB: Range,
    name?: string
) => {
    if (rangeStartsBeforeRange(rangeA, rangeB)) return rangeA;

    const newLines = rangeB.endLineNumber - rangeB.startLineNumber;

    const result = {
        startLineNumber: rangeA.startLineNumber + newLines,
        startColumn: rangeA.startColumn,
        endLineNumber: rangeA.endLineNumber + newLines,
        endColumn: rangeA.endColumn,
    };

    // There is a case where rangeA is so long it reaches the start of rangeB
    // Consider pasting rangeA in a writable range
    // Because rangeA is so long, add the new lines before checking for
    // intersections

    // Not interested in modifying rangeA when they intersect because rangeA
    // should actually split into 2 ranges, which should be handled separately
    console.log(
        name,
        "rangeIntersectsRange(result, rangeB)",
        rangeIntersectsRange(result, rangeB)
    );
    if (rangeIntersectsRange(result, rangeB)) return rangeA;

    // They're not on the same line
    if (rangeA.startLineNumber !== rangeB.endLineNumber) {
        return result;
    } else {
        // They're on the same line
        return {
            startLineNumber: result.startLineNumber,
            startColumn: result.startColumn + rangeB.endColumn,
            endLineNumber: result.endLineNumber,
            endColumn: result.endColumn,
        };
    }
};

export const isEnter = (text: string) =>
    text.startsWith("\n") &&
    // The newline could contain spaces due to indentation
    text.replaceAll("\n", "").replaceAll(" ", "").length === 0;
