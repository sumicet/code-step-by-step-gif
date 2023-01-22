import { Range } from "./types";

export const rangeIntersectsPosition = (
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
 * Check if a range is contained inside another range
 */
export const rangeContainsRange = (rangeA: Range, rangeB: Range) => {
    return (
        (rangeA.startLineNumber < rangeB.startLineNumber ||
            (rangeA.startLineNumber === rangeB.startLineNumber &&
                rangeA.startColumn <= rangeB.startColumn)) &&
        (rangeA.endLineNumber > rangeB.endLineNumber ||
            (rangeA.endLineNumber === rangeB.endLineNumber &&
                rangeA.endColumn >= rangeB.endColumn))
    );
};

export const rangeIntersectsRange = (rangeA: Range, rangeB: Range) => {
    const result = {
        // Contains range
        contains: rangeContainsRange(rangeB, rangeA),
        // Is contained inside range
        contained: rangeContainsRange(rangeA, rangeB),
        // Starts before range and intersects it
        before: rangeIntersectsPosition(rangeA, {
            column: rangeB.startColumn,
            lineNumber: rangeB.startLineNumber,
        }),
        // Ends after range and intersects it
        after: rangeIntersectsPosition(rangeA, {
            column: rangeB.endColumn,
            lineNumber: rangeB.endLineNumber,
        }),
    };

    return Object.entries(result).reduce<{
        value: boolean;
        position: keyof typeof result | null;
    }>(
        (prev, [key, value]) => ({
            value: value || prev.value,
            position: value ? (key as keyof typeof result) : prev.position,
        }),
        {
            value: false,
            position: null,
        }
    );
};

export const isEnter = (text: string) =>
    text.startsWith("\n") &&
    // The newline could contain spaces due to indentation
    text.replaceAll("\n", "").replaceAll(" ", "").length === 0;
