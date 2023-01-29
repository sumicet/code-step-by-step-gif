import { useCallback, useRef, useState } from "react";
import { Code } from "./components";
import { imagesToVideo, uploadToImgur } from "./utils";
import html2canvas from "html2canvas";
import { useTabs } from "./hooks/useTabs";
import { useCode } from "./hooks";
import { OnChange } from "@monaco-editor/react";

const isBlobArray = (blobs: any[]): blobs is Blob[] => {
    return !blobs.some((blob) => !blob);
};

const max = 5;

function App() {
    const ref = useRef<Array<HTMLDivElement | null>>([]);

    const [video, setVideo] = useState<string | null>(null);

    const convert = async () => {
        const images = await Promise.all(
            [...Array(max)].map(async (_, index) => {
                const node = ref.current[index];
                if (!node) return null;

                const canvas = await html2canvas(node, {
                    backgroundColor: "transparent",
                    onclone: (_, element) => {
                        element.style.opacity = "1";
                        element.style.margin = "0px";
                    },
                    scale: 1,
                    allowTaint: true,
                });
                const dataUrl = canvas.toDataURL("image/jpeg", 1);
                return dataUrl;
            })
        );

        const blobs = await Promise.all(
            images.map(async (image) => {
                if (!image) return;
                return await (await fetch(image)).blob();
            })
        );

        if (!blobs.length || !isBlobArray(blobs)) return;

        const { videoBlob, videoUrl } = await imagesToVideo(blobs);
        if (!videoBlob) return;
        setVideo(videoUrl);
        uploadToImgur(videoBlob);
    };

    const { activeTab, onChange } = useTabs();
    const {
        editors: editorsVisible,
        handleChange: handleChangeVisible,
        handleMount: handleMountVisible,
    } = useCode({ max });
    const { editors: editorsHidden, handleMount: handleMountHidden } = useCode({
        max,
    });

    const handleChangeVisibleWrapper = useCallback(
        (ev: Parameters<OnChange>[1], index: number) => {
            handleChangeVisible(ev, index);

            editorsHidden.current[index]?.setModel(
                editorsVisible.current[index]?.getModel() ?? null
            );
        },
        [editorsHidden, editorsVisible, handleChangeVisible]
    );

    return (
        <div className="flex h-full w-full max-w-[100vw] justify-center overflow-hidden bg-slate-900">
            <div className="flex w-full flex-col items-center justify-center space-y-10 p-5">
                <div className="flex w-full justify-between">
                    <p className="text-3xl font-bold text-slate-300">
                        Code step-by-step gif
                    </p>
                    <button
                        onClick={convert}
                        className="rounded-lg bg-white bg-gradient-to-r px-3 py-2 font-bold text-slate-700"
                    >
                        Generate
                    </button>
                </div>

                {video && (
                    <video
                        src={video}
                        autoPlay
                        loop
                        className="h-[700px] w-[500px] object-contain"
                    />
                )}

                {[...Array(max)].map((_, index) => (
                    <Code
                        key={index}
                        tab={index}
                        activeTab={activeTab}
                        onChange={onChange}
                        max={max}
                        className={`h-full max-h-[700px] min-h-[500px] w-full ${
                            index === activeTab ? "" : "hidden"
                        }`}
                        handleChange={(editor) =>
                            handleChangeVisibleWrapper(editor, index)
                        }
                        handleMount={(editor) =>
                            handleMountVisible(editor, index)
                        }
                    />
                ))}
            </div>
            {[...Array(max)].map((_, index) => (
                <Code
                    key={index}
                    ref={(node) => (ref.current[index] = node)}
                    tab={index}
                    activeTab={activeTab}
                    onChange={onChange}
                    max={max}
                    className="pointer-events-none absolute h-[1000px] w-[1000px] opacity-0"
                    handleMount={(editor) => handleMountHidden(editor, index)}
                    options={{
                        fontSize: 30,
                    }}
                />
            ))}
        </div>
    );
}

export default App;
