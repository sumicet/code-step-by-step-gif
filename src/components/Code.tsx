import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useCallback, useRef } from "react";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

export function Code() {
    const onChange = useCallback((value: any, viewUpdate: any) => {
        console.log("value:", value);
    }, []);

    const ref = useRef<ReactCodeMirrorRef>(null);

    console.log(ref?.current?.state);

    return (
        <CodeMirror
            value="console.log('hello world!');"
            ref={ref}
            height="200px"
            autoFocus
            basicSetup={{
                lineNumbers: false,
                highlightActiveLine: false,
                bracketMatching: true,
                foldGutter: false,
            }}
            theme={draculaInit({
                settings: {
                    background: "#1e293b",
                    foreground: "#cbd5e1",
                    caret: "white",
                    fontFamily: "Consolas",
                },
            })}
            extensions={[javascript({ jsx: true })]}
            onChange={onChange}
        />
    );
}
