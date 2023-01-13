import { DetailedHTMLProps, ReactNode, useContext } from "react";
import { TabContext } from "./Tabs";

export function TabPanel({
    tabIndex,
    ...rest
}: {
    tabIndex?: number;
} & DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    const { selected } = useContext(TabContext);
    return <div {...rest} hidden={selected !== tabIndex} />;
}
