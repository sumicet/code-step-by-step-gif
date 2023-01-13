import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export const TabContext = createContext<{
    selected: number;
    setSelected: React.Dispatch<React.SetStateAction<number>>;
}>({ selected: 0, setSelected: () => null });

export function Tabs({ children }: { children: ReactNode }) {
    const [selected, setSelected] = useState(0);

    const memoValue = useMemo(() => ({ selected, setSelected }), [selected]);

    return (
        <TabContext.Provider value={memoValue}>{children}</TabContext.Provider>
    );
}
