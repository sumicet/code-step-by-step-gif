import { forwardRef, useRef, useState } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "./index.css";

const ENTER = "\r\n";
const DELETE = "";

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
    function handleEditorDidMount(
        editor: Parameters<OnMount>[0],
        monaco: Parameters<OnMount>[1]
    ) {
        const range = new monaco.Range(1, 1, 1, 18);
        const model = editor.getModel();
        // @ts-ignore
        editorRef.current = editor;
        decorationsRef.current.ids =
            model?.deltaDecorations(decorationsRef.current.ids, [
                {
                    range,
                    options: {
                        inlineClassName: "previous-step",
                    },
                },
            ]) ?? [];
        decorationsRef.current.data = model?.getAllDecorations() ?? [];
    }

    const [value, setValue] = useState<string | undefined>(
        "console.log('hello world!');"
    );
    const editorRef = useRef<Parameters<OnMount>[0]>(null);
    const decorationsRef = useRef<{
        data: Array<{
            range: {
                startLineNumber: number;
                startColumn: number;
                endLineNumber: number;
                endColumn: number;
            };
            options: any;
        }>;
        ids: string[];
    }>({ data: [], ids: [] });

    const handleChangeEditor = (
        val: string | undefined,
        ev: editor.IModelContentChangedEvent
    ) => {
        const model = editorRef?.current?.getModel();

        const allDecorations = model?.getAllDecorations();
        const previousStepDecorators = allDecorations
            ?.filter((dec) => dec.options.inlineClassName === "previous-step")
            .map((dec) => ({
                range: dec.range,
                id: dec.id,
            }));

        const editedRange = ev.changes[0].range;
        const editedText = ev.changes[0].text;

        /**
         * The range that intersects the edited range.
         */
        const conflictingRange = previousStepDecorators?.filter((dec) => {
            return dec.range.intersectRanges(editedRange);
        })?.[0];
        console.log({ conflictingRange });

        if (conflictingRange) {
            // If the user deleted something
            if (editedText === DELETE) {
                editorRef?.current?.setValue(value ?? "");

                model?.deltaDecorations(
                    decorationsRef.current.ids,
                    decorationsRef.current.data
                );

                return;
            }
            console.log({ editedRange });

            let left;
            let right;
            let removeCustomRange: {
                range: Range;
                id: string;
            };

            const length = model?.getLineContent(
                editedRange.startLineNumber
            ).length;
            const nextLength = model?.getLineContent(
                editedRange.startLineNumber + 1
            ).length;
            console.log("here", previousStepDecorators);
            const nextLineStartWithDecoration = previousStepDecorators?.filter(
                (dec) => {
                    return (
                        dec.range.startColumn === 1 &&
                        dec.range.startLineNumber ===
                            editedRange.startLineNumber + 1
                    );
                }
            )?.[0];

            console.log({ nextLineStartWithDecoration });

            if (editedText === ENTER && !length) {
                // Created an empty line by pressing enter on it
                right = {
                    startLineNumber: conflictingRange.range.startLineNumber + 1,
                    startColumn: conflictingRange.range.startColumn,
                    endLineNumber: conflictingRange.range.endLineNumber,
                    endColumn: conflictingRange.range.endColumn,
                };
            } else if (
                editedText === ENTER &&
                length &&
                !nextLength &&
                nextLineStartWithDecoration
            ) {
                console.log("CREATED FROM PREV");
                // Created an empty line by pressing enter on the previous line,
                // at the end of the line
                right = {
                    startLineNumber: conflictingRange.range.startLineNumber + 2,
                    startColumn: conflictingRange.range.startColumn,
                    endLineNumber: conflictingRange.range.endLineNumber + 1,
                    endColumn: nextLineStartWithDecoration.range.endColumn,
                };
                removeCustomRange = nextLineStartWithDecoration; // Don't remove because it'll conflict with the previous line, which should stay
            } else {
                left = {
                    startLineNumber: conflictingRange.range.startLineNumber,
                    startColumn: conflictingRange.range.startColumn,
                    endLineNumber: editedRange.startLineNumber,
                    endColumn: editedRange.startColumn,
                };

                if (editedText === ENTER) {
                    right = {
                        startLineNumber: editedRange.endLineNumber + 1,
                        startColumn: 1,
                        endLineNumber: conflictingRange.range.endLineNumber,
                        endColumn: conflictingRange.range.endColumn,
                    };
                } else {
                    right = {
                        startLineNumber: editedRange.endLineNumber,
                        startColumn: editedRange.endColumn + 1,
                        endLineNumber: conflictingRange.range.endLineNumber,
                        endColumn: conflictingRange.range.endColumn,
                    };
                }
            }

            const otherCustomDecorators =
                allDecorations
                    ?.filter((dec) =>
                        removeCustomRange
                            ? dec.id !== removeCustomRange.id
                            : dec.id !== conflictingRange.id
                    )
                    .map((dec) => ({
                        range: dec.range,
                        options: dec.options,
                    })) ?? [];

            const newDecorators =
                [
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
                ].filter((dec) => !!dec.range) ?? [];

            // @ts-ignore
            decorationsRef.current.ids = model?.deltaDecorations(
                decorationsRef.current.ids,
                // @ts-ignore
                [...newDecorators, ...otherCustomDecorators]
            );
            // @ts-ignore
            decorationsRef.current.data =
                [...newDecorators, ...otherCustomDecorators] ?? [];

            console.log({ left, right });
        }

        setValue(val);
    };

    return (
        <Editor
            theme="myTheme"
            height="500px"
            defaultLanguage="javascript"
            defaultValue={value}
            onMount={handleEditorDidMount}
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
            onChange={handleChangeEditor}
        />
    );
});
