import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "./index.css";
import isEqual from "lodash/isEqual";

const ENTER = "\n";

loader.init().then((monaco) => {
    monaco.editor.defineTheme("myTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#1e293b",
        },
    });
});

interface Range {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

export const CodeEditor = forwardRef<any, any>((props, ref) => {
    const [value, setValue] = useState<string | undefined>(
        `<Editor
    theme="myTheme"
    height="500px"
    defaultLanguage="javascript"
    defaultValue={value}
    onMount={handleEditorDidMount}
    onChange={handleChangeEditor}
    options={{
        colorDecorators: true,
        inDiffEditor: true,
        minimap: {
            enabled: false,
        },
        lineNumbers: "off",
        scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
        },
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
    }}
    value={value}
/>`
    );

    /**
     * The highlighted ranges which are readonly
     */
    const ranges = useRef<Range[] | null>(null);
    const model = useRef<editor.ITextModel | null>(null);
    const editor = useRef<editor.IStandaloneCodeEditor | null>(null);
    const allDecorations = useRef<editor.IModelDecoration[]>([]);
    /**
     * The last offset where the action of delete was prevented (because it was
     * inside a readonly range)
     */
    const undoProgramaticallyOffset = useRef<number | null>(null);
    /**
     * Memorize the active decorator ids otherwise they will be removed
     */
    const decorators = useRef<string[]>([]);

    const updateReadonlyCode = () => {
        decorators.current =
            model.current?.deltaDecorations(
                decorators.current,
                ranges.current?.map((range) => ({
                    range,
                    options: {
                        inlineClassName: "previous-step",
                    },
                })) ?? []
            ) ?? [];

        allDecorations.current = model.current?.getAllDecorations() ?? [];
    };

    const getRangeAtPosition = (
        range: Range,
        { column, lineNumber }: { lineNumber: number; column: number }
    ) => {
        return (
            // Offset is between the start and end of the range
            (range.startLineNumber < lineNumber &&
                range.endLineNumber > lineNumber) ||
            // Offset is on the same line as the start
            (range.startLineNumber === lineNumber &&
                range.startColumn <= column) ||
            // Offset is on the same line as the end
            (range.endLineNumber === lineNumber && range.endColumn > column)
        );
    };

    const rangeContainsRange = (rangeA: Range, rangeB: Range) => {
        return (
            (rangeA.startLineNumber < rangeB.startLineNumber ||
                (rangeA.startLineNumber === rangeB.startLineNumber &&
                    rangeA.startColumn <= rangeB.startColumn)) &&
            (rangeA.endLineNumber > rangeB.endLineNumber ||
                (rangeA.endLineNumber === rangeB.endLineNumber &&
                    rangeA.endColumn >= rangeB.endColumn))
        );
    };

    const rangeIntersectsRange = useCallback((rangeA: Range, rangeB: Range) => {
        console.log(
            rangeA,
            rangeB,
            // Starts before range and intersects it
            getRangeAtPosition(rangeA, {
                column: rangeB.startColumn,
                lineNumber: rangeB.startLineNumber,
            }),
            // Ends after range and intersects it
            getRangeAtPosition(rangeA, {
                column: rangeB.endColumn,
                lineNumber: rangeB.endLineNumber,
            }),
            // Is contained inside range
            rangeContainsRange(rangeA, rangeB),
            // Contains range
            rangeContainsRange(rangeB, rangeA)
        );
        return (
            // Starts before range and intersects it
            getRangeAtPosition(rangeA, {
                column: rangeB.startColumn,
                lineNumber: rangeB.startLineNumber,
            }) ||
            // Ends after range and intersects it
            getRangeAtPosition(rangeA, {
                column: rangeB.endColumn,
                lineNumber: rangeB.endLineNumber,
            }) ||
            // Is contained inside range
            rangeContainsRange(rangeA, rangeB) ||
            // Contains range
            rangeContainsRange(rangeB, rangeA)
        );
    }, []);

    const handleChangeEditor = useCallback(
        (
            newValue: string | undefined,
            ev: editor.IModelContentChangedEvent
        ) => {
            // Range length is the number of deleted characters
            const { range, rangeOffset } = ev.changes[0];

            // editor.current?.trigger will always fire a onChange event
            // Ignore it when this happens
            if (undoProgramaticallyOffset.current === rangeOffset) {
                undoProgramaticallyOffset.current = null;
                return null;
            }

            // THIS WORKS FOR INTERSECTING OMG
            const intersectsReadOnlyRange = model.current
                ?.getAllDecorations()
                .filter(
                    (dec) => dec.options.inlineClassName === "previous-step"
                )
                ?.some(({ range: decoRange }) =>
                    rangeIntersectsRange(range, decoRange)
                );

            // MAKE SURE YOU UPDATE DECORATORS WHEN YOU UPDATE THE VALUE

            // Prevent the user from deleting code inside a readonly range
            if (intersectsReadOnlyRange) {
                // onChange will fire again after undoing programatically
                editor.current?.trigger(null, "undo", null);
                undoProgramaticallyOffset.current = rangeOffset;
                updateReadonlyCode();

                return null;
            }

            updateReadonlyCode();

            // if (
            //     text.startsWith(ENTER) &&
            //     // The editor will add spaces to indent the code
            //     text.replaceAll(ENTER, "").replaceAll(" ", "").length === 0
            // ) {
            //     // console.log("enter");
            //     updateReadonlyCode();
            //     setValue(newValue);
            //     return null;
            // }

            // // console.log("other");
            // setValue(newValue);
            // updateReadonlyCode();
        },
        [rangeIntersectsRange]
    );

    function handleEditorDidMount(
        ed: Parameters<OnMount>[0],
        monaco: Parameters<OnMount>[1]
    ) {
        editor.current = ed;
        model.current = ed.getModel();
        const fullRange = model.current?.getFullModelRange();
        console.log(fullRange);
        const initialRange: Range = {
            startColumn: fullRange?.startColumn ?? 1,
            startLineNumber: fullRange?.startLineNumber ?? 1,
            endColumn: fullRange?.endColumn ?? 1,
            endLineNumber: fullRange?.endLineNumber ?? 1,
        };
        ranges.current = [initialRange];

        // Testing

        updateReadonlyCode();

        ranges.current = [
            {
                startColumn: 1,
                startLineNumber: 1,
                endColumn: model.current?.getLineMaxColumn(10) ?? 10,
                endLineNumber: 10,
            },
            {
                startColumn: 1,
                startLineNumber: 15,
                endColumn: fullRange?.endColumn ?? 1,
                endLineNumber: fullRange?.endLineNumber ?? 1,
            },
        ];

        updateReadonlyCode();

        editor.current?.onDidChangeModelContent((ev) => {
            console.log("onDidChangeModelContent", ev);
        });
    }

    return (
        <Editor
            theme="myTheme"
            height="500px"
            defaultLanguage="javascript"
            defaultValue={value}
            onMount={handleEditorDidMount}
            onChange={handleChangeEditor}
            options={{
                colorDecorators: true,
                inDiffEditor: true,
                minimap: {
                    enabled: false,
                },
                lineNumbers: "off",
                scrollbar: {
                    vertical: "hidden",
                    horizontal: "hidden",
                },
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
            }}
            value={value}
        />
    );
});

// /**
//  * Return the index of the range that contains a position
//  */
// const getRangeAtPosition = (
//     range: Range,
//     { column, lineNumber }: { lineNumber: number; column: number }
// ) => {
//     return (
//         // Offset is between the start and end of the range
//         (range.startLineNumber < lineNumber &&
//             range.endLineNumber > lineNumber) ||
//         // Offset is on the same line as the start
//         (range.startLineNumber === lineNumber &&
//             range.startColumn <= column) ||
//         // Offset is on the same line as the end
//         (range.endLineNumber === lineNumber && range.endColumn > column)
//     );
// };

// const rangeContainsRange = (rangeA: Range, rangeB: Range) => {
//     return (
//         (rangeA.startLineNumber < rangeB.startLineNumber ||
//             (rangeA.startLineNumber === rangeB.startLineNumber &&
//                 rangeA.startColumn <= rangeB.startColumn)) &&
//         (rangeA.endLineNumber > rangeB.endLineNumber ||
//             (rangeA.endLineNumber === rangeB.endLineNumber &&
//                 rangeA.endColumn >= rangeB.endColumn))
//     );
// };

// /**
//  * Return the index of the range that contains [offset, offset + length]
//  */
// const getRangeAt = useCallback((offset: number, length: number) => {
//     const start = model.current?.getPositionAt(offset);

//     if (!start) return -1;

//     if (!length) {
//         return (
//             ranges.current?.findIndex((range) =>
//                 getRangeAtPosition(range, start)
//             ) ?? -1
//         );
//     }

//     const end = model.current?.getPositionAt(offset + length);

//     if (!end) return -1;

//     // console.log({ start, end, offset, length });

//     const newRange = {
//         startLineNumber: start.lineNumber,
//         startColumn: start.column,
//         endLineNumber: end.lineNumber,
//         endColumn: end.column,
//     };

//     return (
//         ranges.current?.findIndex((range) => {
//             // console.log(range, newRange, {
//             //     "getRangeAtPosition(range, start)": getRangeAtPosition(
//             //         range,
//             //         start
//             //     ),
//             //     "getRangeAtPosition(range, end)": getRangeAtPosition(
//             //         range,
//             //         end
//             //     ),
//             //     "rangeContainsRange(range, newRange)": rangeContainsRange(
//             //         range,
//             //         newRange
//             //     ),
//             //     "rangeContainsRange(newRange, range)": rangeContainsRange(
//             //         newRange,
//             //         range
//             //     ),
//             // });
//             return (
//                 // Starts before range and intersects it
//                 getRangeAtPosition(range, start) ||
//                 // Ends after range and intersects it
//                 (end && getRangeAtPosition(range, end)) ||
//                 // Is contained inside range
//                 (end && rangeContainsRange(range, newRange)) ||
//                 // Contains range
//                 (end && rangeContainsRange(newRange, range))
//             );
//         }) ?? -1
//     );
// }, []);
