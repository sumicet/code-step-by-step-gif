import Editor, { EditorProps, loader } from "@monaco-editor/react";
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

export function CodeEditor(props: EditorProps) {
    return (
        <Editor
            {...props}
            theme="myTheme"
            defaultLanguage="javascript"
            defaultValue={`<Editor
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
/>`}
            options={{
                ...props?.options,
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
                renderLineHighlight: "none",
                guides: {
                    indentation: false,
                },
            }}
        />
    );
}
