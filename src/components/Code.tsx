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
        options?: Parameters<typeof CodeEditor>[0]["options"];
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
            options,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                key={tab + 1}
                {...rest}
                ref={ref}
                className={`flex flex-col space-y-5 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-5 ${
                    rest?.className ?? ""
                }`}
            >
                <div className="flex h-full w-full flex-col space-y-5 overflow-hidden rounded-lg bg-slate-800">
                    <div className="flex justify-around space-x-1 pl-4 pr-4 pt-4">
                        {[...Array(max)].map((_, i) => (
                            <div
                                key={i + 1}
                                className={`flex h-[5px] min-h-[5px] w-full items-center justify-center rounded-sm bg-white ${
                                    i <= tab ? "" : "opacity-50"
                                }`}
                                role="button"
                                onClick={() => onChange(i)}
                            />
                        ))}
                    </div>
                    <CodeEditor
                        onMount={(editor) => handleMount?.(editor, tab)}
                        onChange={(_, ev) => {
                            handleChange?.(ev, tab);
                        }}
                        options={options}
                    />
                </div>
            </div>
        );
    }
);
