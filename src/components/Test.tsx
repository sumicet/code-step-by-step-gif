import { useCallback, useEffect, useState } from "react";

export function Test() {
    const [value, setValue] = useState(0);
    const [isPositive, setIsPositive] = useState(true);

    const toggleValue = useCallback(() => {
        if (isPositive) return 1;
        return -1;
    }, [isPositive]);

    useEffect(() => {
        setValue(toggleValue);
    }, [toggleValue]);

    return (
        <button
            className="h-10 bg-slate-50 p-3 text-gray-700"
            onClick={() => setIsPositive(false)}
        >
            Bruh {value}
        </button>
    );
}
