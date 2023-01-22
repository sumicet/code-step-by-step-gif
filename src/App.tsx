import { useState } from "react";
import { Code } from "./components";
import { Test } from "./components/Test";

function App() {
    const [step, setStep] = useState(0);
    const [images, setImages] = useState<string[]>([]);

    return (
        <div className="flex h-full w-full justify-center bg-slate-900">
            {/* <Test /> */}
            <div className="flex w-full max-w-screen-lg flex-col items-center justify-center space-y-10 p-5">
                <div className="flex w-full justify-between">
                    <p className="text-3xl font-bold text-slate-300">
                        Code step-by-step gif
                    </p>
                    <button className="rounded-lg bg-white bg-gradient-to-r px-3 py-2 font-bold text-slate-700">
                        Generate
                    </button>
                </div>
                <div className="relative flex h-fit">
                    <img
                        src={images?.[1] ?? ""}
                        // className="absolute top-0 left-0"
                        className="w-1/2 object-contain"
                    />
                    <img
                        src={images?.[0] ?? ""}
                        className="w-1/2 object-contain"
                    />
                </div>
                <Code
                    step={step}
                    setStep={setStep}
                    max={2}
                    setImages={setImages}
                />
            </div>
        </div>
    );
}

export default App;
