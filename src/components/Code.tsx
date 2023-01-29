import { OnChange } from "@monaco-editor/react";
import { forwardRef } from "react";
import { CodeEditor } from ".";
import { EditorRef } from "./CodeEditor/types";

export const Code = forwardRef<
    HTMLDivElement,
    {
        max: number;
        disableSelection?: boolean;
        tab: number;
        activeTab: number;
        onChange: (index: number) => void;
        handleChange?: (ev: Parameters<OnChange>[1], index: number) => void;
        handleMount?: (editor: EditorRef, index: number) => void;
    } & Omit<
        React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >,
        "onChange"
    >
>(
    (
        {
            tab,
            activeTab,
            onChange,
            handleChange,
            handleMount,
            max,
            disableSelection,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                key={tab + 1}
                {...rest}
                ref={ref}
                className={`flex flex-col space-y-10 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-16 ${
                    rest?.className ?? ""
                }`}
            >
                <div className="flex justify-around">
                    {[...Array(max)].map((_, i) => (
                        <div
                            key={i + 1}
                            className={`flex h-[30px] min-h-[30px] w-[30px] min-w-[30px] items-center justify-center rounded-[50%] bg-white ${
                                i <= tab ? "" : "opacity-50"
                            }`}
                            role="button"
                            onClick={() => onChange(i)}
                        />
                    ))}
                </div>

                <div className="flex h-full w-full flex-col space-y-5 rounded-lg bg-slate-800 p-4">
                    <CodeEditor
                        onMount={(editor) => handleMount?.(editor, tab)}
                        onChange={(_, ev) => {
                            handleChange?.(ev, tab);
                        }}
                    />
                </div>
            </div>
        );
    }
);
