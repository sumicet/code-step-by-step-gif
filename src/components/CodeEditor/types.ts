import { OnMount } from "@monaco-editor/react";

export interface Range {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

export type EditorRef = Parameters<OnMount>[0];
