import { useState } from "react";

export function useTabs() {
    const [activeTab, setActiveTab] = useState(0);

    const onChange = (index: number) => {
        setActiveTab(index);
    };

    return {
        activeTab,
        onChange,
    };
}
