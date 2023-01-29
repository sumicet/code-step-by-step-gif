import { OnChange } from "@monaco-editor/react";
import { useRef } from "react";
import { EditorRef } from "../components/CodeEditor/types";

export function useCode({ max }: { max: number }) {
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

    return {
        handleMount,
        handleChange,
        editors,
    };
}
