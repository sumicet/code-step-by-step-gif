import { forwardRef, useCallback, useRef, useState } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "./index.css";
import { isEnter, rangeIntersectsRange } from "./utils";
import { Range } from "./types";

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
    // const allDecorations = useRef<editor.IModelDecoration[]>([]);
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

        // allDecorations.current = model.current?.getAllDecorations() ?? [];
    };

    const handleChangeEditor = useCallback(
        (
            newValue: string | undefined,
            ev: editor.IModelContentChangedEvent
        ) => {
            // Range length is the number of deleted characters
            const { range, rangeOffset, rangeLength, text } = ev.changes[0];

            console.log(ev);

            // editor.current?.trigger will always fire a onChange event
            // Ignore it when this happens
            if (undoProgramaticallyOffset.current === rangeOffset) {
                undoProgramaticallyOffset.current = null;
                return null;
            }

            const readOnlyDecorations = model.current
                ?.getAllDecorations()
                .filter(
                    (dec) => dec.options.inlineClassName === "previous-step"
                );

            // THIS WORKS FOR INTERSECTING OMG
            const intersectsReadOnlyRange = readOnlyDecorations
                ?.map((decorator) => ({
                    ...rangeIntersectsRange(range, decorator.range),
                    decorator: decorator,
                }))
                .find(({ value }) => value);

            // Prevent the user from deleting code inside a readonly range
            if (intersectsReadOnlyRange?.value && rangeLength) {
                console.log("INTERSECTS");
                // onChange will fire again after undoing programatically
                editor.current?.trigger(null, "undo", null);
                undoProgramaticallyOffset.current = rangeOffset;
                updateReadonlyCode();

                return null;
            }

            // Writing inside the readonly range
            if (intersectsReadOnlyRange?.value) {
                // Pasting a text will mess up the range
                const realRangeLength = text.length;
                const end = model.current?.getPositionAt(
                    rangeOffset + realRangeLength
                );
                if (!end) return null;

                const realRange = {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: end.lineNumber,
                    endColumn: end.column,
                };

                if (intersectsReadOnlyRange.position === "contains") {
                    const left = {
                        startLineNumber:
                            intersectsReadOnlyRange.decorator.range
                                .startLineNumber,
                        startColumn:
                            intersectsReadOnlyRange.decorator.range.startColumn,
                        endLineNumber: realRange.startLineNumber,
                        endColumn: realRange.startColumn,
                    };
                    const right = {
                        startLineNumber: realRange.endLineNumber,
                        startColumn: realRange.endColumn,
                        endLineNumber:
                            intersectsReadOnlyRange.decorator.range
                                .endLineNumber,
                        endColumn:
                            intersectsReadOnlyRange.decorator.range.endColumn,
                    };

                    decorators.current =
                        model.current?.deltaDecorations(decorators.current, [
                            ...(readOnlyDecorations?.filter(
                                (dec) =>
                                    dec.id !==
                                    intersectsReadOnlyRange.decorator.id
                            ) ?? []),
                            {
                                range: left,
                                options: {
                                    inlineClassName: "previous-step",
                                },
                            },
                            {
                                range: right,
                                options: {
                                    inlineClassName: "previous-step",
                                },
                            },
                        ]) ?? [];
                }
            }

            // TODO delete or add on the same line? adjust decorators

            const lineDiff =
                range.endLineNumber - range.startLineNumber ||
                (isEnter(text) ? 1 : 0);
            // Need to move all decorations by the number of lines that were added
            // if (lineDiff) {
            //     decorators.current =
            //         model.current?.deltaDecorations(
            //             decorators.current,
            //             model.current?.getAllDecorations()?.map((dec) => {
            //                 if (
            //                     dec.options.inlineClassName ===
            //                         "previous-step" &&
            //                     dec.range.startLineNumber >=
            //                         range.startLineNumber
            //                 ) {
            //                     console.log("YES", dec.range);
            //                     return {
            //                         ...dec,
            //                         range: {
            //                             startLineNumber:
            //                                 dec.range.startLineNumber +
            //                                 lineDiff,
            //                             startColumn: dec.range.startColumn,
            //                             endLineNumber:
            //                                 dec.range.endLineNumber + lineDiff,
            //                             endColumn: dec.range.endColumn,
            //                         },
            //                     };
            //                 }

            //                 return dec;
            //             }) ?? []
            //         ) ?? [];

            //     return;
            // }

            // MAKE SURE YOU UPDATE DECORATORS WHEN YOU UPDATE THE VALUE

            // updateReadonlyCode();

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
        []
    );

    function handleEditorDidMount(
        ed: Parameters<OnMount>[0],
        monaco: Parameters<OnMount>[1]
    ) {
        editor.current = ed;
        model.current = ed.getModel();
        const fullRange = model.current?.getFullModelRange();
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
