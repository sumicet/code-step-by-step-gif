import { forwardRef, useRef, useState } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "./index.css";

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
        const range = new monaco.Range(1, 1, 1, 20);
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
        console.log("here", model?.getAllDecorations());
        decorationsRef.current.data = model?.getAllDecorations() ?? [];
    }

    const [value, setValue] = useState<string | undefined>(
        "console.log('hello world!');"
    );
    const editorRef = useRef<Parameters<OnMount>[0]>(null);
    const decorationsRef = useRef<{
        data: editor.IModelDecoration[];
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

        console.log(allDecorations, previousStepDecorators);

        /**
         * The range that intersects the edited range.
         */
        const conflictingRange = previousStepDecorators?.filter((dec) => {
            console.log(dec.range.intersectRanges(editedRange));
            return dec.range.intersectRanges(editedRange);
        })?.[0];

        console.log(ev.changes[0]);

        if (conflictingRange) {
            // If the user deleted something
            if (ev.changes[0].text === "") {
                editorRef?.current?.setValue(value ?? "");

                model?.deltaDecorations(
                    decorationsRef.current.ids,
                    decorationsRef.current.data
                );

                return;
            }

            const left = {
                startLineNumber: conflictingRange.range.startLineNumber,
                startColumn: conflictingRange.range.startColumn,
                endLineNumber: editedRange.startLineNumber,
                endColumn: editedRange.startColumn,
            };

            const right = {
                startLineNumber: editedRange.endLineNumber,
                startColumn: editedRange.endColumn + 1,
                endLineNumber: conflictingRange.range.endLineNumber,
                endColumn: conflictingRange.range.endColumn,
            };

            const otherCustomDecorators =
                allDecorations
                    ?.filter((dec) => dec.id !== conflictingRange.id)
                    .map((dec) => ({
                        range: dec.range,
                        options: dec.options,
                    })) ?? [];

            // @ts-ignore
            decorationsRef.current.ids = model?.deltaDecorations(
                decorationsRef.current.ids,
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
                    ...otherCustomDecorators,
                ]
            );
            decorationsRef.current.data = allDecorations ?? [];
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
