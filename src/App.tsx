import { useRef, useState } from "react";
import { Code } from "./components";
import { imagesToVideo, uploadToImgur } from "./utils";
import html2canvas from "html2canvas";

function App() {
    const [step, setStep] = useState(0);

    const ref = useRef<Array<HTMLDivElement | null>>([]);

    const [images, setImages] = useState<string[]>([]);

    const htmlToPng = async () => {
        const images = await Promise.all(
            [...Array(2)].map(async (_, index) => {
                const node = ref.current[index];
                if (!node) return null;

                const canvas = await html2canvas(node, {
                    backgroundColor: "transparent",
                    onclone: (_, element) => {
                        element.style.opacity = "1";
                    },
                    scale: 1,
                });
                const dataUrl = canvas.toDataURL("image/jpeg", 1);
                return dataUrl;
            })
        );

        // console.log({ images });

        // // @ts-ignore
        // setImages(images);

        const blobs = await Promise.all(
            images.map(async (image) => {
                if (!image) return;
                const r = await fetch(image);
                const b = await r.blob();
                return await b.arrayBuffer();
            })
        );

        if (!blobs.length) return;

        const { videoBlob } = imagesToVideo(blobs);
        if (!videoBlob) return;
        uploadToImgur(videoBlob);
    };

    return (
        <div className="flex h-full w-full max-w-[100vw] justify-center overflow-hidden bg-slate-900">
            <div className="flex w-full flex-col items-center justify-center space-y-10 p-5">
                <div className="flex w-full justify-between">
                    <p className="text-3xl font-bold text-slate-300">
                        Code step-by-step gif
                    </p>
                    <button
                        onClick={htmlToPng}
                        className="rounded-lg bg-white bg-gradient-to-r px-3 py-2 font-bold text-slate-700"
                    >
                        Generate
                    </button>
                </div>
                {images.map((image) => (
                    <img key={image} src={image} />
                ))}
                {/* <video autoPlay loop playsInline>
                    <source src={url} type="video/webm" />
                </video> */}

                <Code
                    step={step}
                    setStep={setStep}
                    max={2}
                    className="h-full max-h-[700px] min-h-[500px] w-full"
                />
            </div>
            {[...Array(2)].map((_, index) => (
                <Code
                    key={index + 1}
                    step={index}
                    setStep={setStep}
                    max={2}
                    className="pointer-events-none absolute h-[700px] w-[1000px] opacity-0"
                    ref={(node) => (ref.current[index] = node)}
                />
            ))}
        </div>
    );
}

export default App;
