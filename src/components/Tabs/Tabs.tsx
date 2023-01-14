import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export const TabContext = createContext<{
    selected: number;
    setSelected: (index: number) => void;
}>({ selected: 0, setSelected: () => null });

export function Tabs({
    children,
    onChange,
}: {
    children: ReactNode;
    onChange?: (index: number) => void;
}) {
    const [selected, setSelected] = useState(0);

    const memoValue = useMemo(
        () => ({
            selected,
            setSelected: (index: number) => {
                setSelected(index);
                onChange?.(index);
            },
        }),
        [selected]
    );

    return (
        <TabContext.Provider value={memoValue}>{children}</TabContext.Provider>
    );
}
