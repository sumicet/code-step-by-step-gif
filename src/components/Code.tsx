import { OnChange } from "@monaco-editor/react";
import { Dispatch, SetStateAction, useRef } from "react";
import { CodeEditor, Tab, TabList, TabPanel, TabPanels, Tabs } from ".";
import { EditorRef } from "./CodeEditor/types";

export function Code({
    step,
    setStep,
    max,
    setImages,
}: {
    step: number;
    setStep: (step: number) => void;
    max: number;
    setImages: Dispatch<SetStateAction<string[]>>;
}) {
    const editors = useRef<Array<EditorRef | null>>(
        [...Array(max)].map(() => null)
    );

    const handleMount = (editor: EditorRef, index: number) => {
        editors.current[index] = editor;
    };

    /**
     * When the user changes the value of an editor, update all other editors to
     * have the same value.
     * For previous editors, make newly added text transparent.
     */
    const handleChange = (ev: Parameters<OnChange>[1], index: number) => {
        const editor = editors.current[index];

        // Range = range that got replaced
        // @ts-ignore
        const { rangeOffset, text, range, forceMoveMarkers } = ev.changes[0];

        // Not the best solution, but executeEdits will trigger onChange, so we need to prevent that
        if (forceMoveMarkers) return;

        const newRangeLength = text.length;
        const end = editor
            ?.getModel()
            ?.getPositionAt(rangeOffset + newRangeLength);
        if (!end) return;

        const newRange = {
            ...range,
            endLineNumber: end?.lineNumber,
            endColumn: end?.column,
        };

        editors.current.forEach((ed, i) => {
            if (i === index) return;
            // Using ed.setValue will delete all decorations
            ed?.executeEdits("", [
                { ...ev.changes[0], forceMoveMarkers: true },
            ]);

            if (i > index) return;

            // For previous editors, make newly added text transparent
            ed?.getModel()?.deltaDecorations(
                [],
                [
                    {
                        range: newRange,
                        options: {
                            inlineClassName: "transparent",
                        },
                    },
                ]
            );
        });
    };

    return (
        <div className="max-h-[700px min-h-[500px] w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-16">
            <div className="flex h-full w-full flex-col space-y-5 rounded-lg bg-slate-800 p-4">
                <Tabs onChange={setStep}>
                    <TabList className="flex space-x-1">
                        {[...Array(max)].map((_, index) => (
                            <Tab
                                key={index + 1}
                                className={`h-3 w-full ${
                                    index <= step
                                        ? `bg-slate-300`
                                        : `bg-slate-600`
                                } rounded-md`}
                            />
                        ))}
                    </TabList>
                    <TabPanels>
                        {[...Array(max)].map((_, index) => (
                            <TabPanel key={index + 1}>
                                <CodeEditor
                                    onMount={(editor) =>
                                        handleMount(editor, index)
                                    }
                                    onChange={(_, ev) => {
                                        handleChange(ev, index);
                                    }}
                                />
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    );
}
