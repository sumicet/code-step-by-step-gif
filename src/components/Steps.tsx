export function Steps({ value, max }: { value: number; max: number }) {
    return (
        <div className="flex space-x-1">
            {[...Array(max)].map((_, index) => (
                <div
                    key={index + 1}
                    className={`h-1 w-full ${
                        index + 1 <= value ? `bg-slate-300` : `bg-slate-600`
                    } rounded-md`}
                />
            ))}
        </div>
    );
}
