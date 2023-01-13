import { DetailedHTMLProps, ReactNode, useContext } from "react";
import { TabContext } from "./Tabs";

export function Tab({
    tabIndex,
    ...rest
}: {
    tabIndex?: number;
} & DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>) {
    const { selected, setSelected } = useContext(TabContext);
    const { onClick } = rest;

    return (
        <button
            {...rest}
            type="button"
            role="tab"
            aria-selected={selected === tabIndex}
            data-index={tabIndex}
            onClick={(event) => {
                setSelected(tabIndex || 0);
                onClick?.(event);
            }}
        />
    );
}
