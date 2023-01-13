import { Children, cloneElement, DetailedHTMLProps, ReactElement } from "react";

export function TabList({
    children,
    ...rest
}: { children: ReactElement[] } & Omit<
    DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "children"
>) {
    const _children = Children.map(children, (child) =>
        cloneElement(child, {
            tabIndex: children.indexOf(child),
        })
    );

    return (
        <div {...rest} role="tablist" aria-orientation="horizontal">
            {_children}
        </div>
    );
}
