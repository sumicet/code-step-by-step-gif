import { forwardRef, useState } from "react";
import Editor, { EditorProps, loader, OnMount } from "@monaco-editor/react";
import "./index.css";
import { EditorRef } from "./types";

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

export const CodeEditor = forwardRef<EditorRef | null, EditorProps>(
    (props, ref) => {
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

        return (
            <Editor
                {...props}
                theme="myTheme"
                height="500px"
                defaultLanguage="javascript"
                defaultValue={value}
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
    }
);
