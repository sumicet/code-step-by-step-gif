import { DetailedHTMLProps, forwardRef, useContext } from "react";
import { TabContext } from "./Tabs";

export const TabPanel = forwardRef<
    HTMLDivElement,
    {
        tabIndex?: number;
    } & DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ tabIndex, ...rest }, ref) => {
    const { selected } = useContext(TabContext);

    return (
        <div
            {...rest}
            id={`tab-panel-${tabIndex ?? 0}`}
            ref={ref}
            className={`${rest.className ?? ""} ${
                selected !== tabIndex
                    ? // The monaco editor won't load its width and height unless it's
                      // displayed on the screen, meaning display none won't work here
                      "absolute top-0 left-0 z-[-1] h-full w-full"
                    : ""
            }`}
        />
    );
});
