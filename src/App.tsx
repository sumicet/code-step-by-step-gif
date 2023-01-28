import { useRef, useState } from "react";
import { Code } from "./components";
import { toJpeg, toBlob } from "html-to-image";
import ffmpeg from "ffmpeg.js";

function App() {
    const [step, setStep] = useState(0);

    const tabPanelRef = useRef<Array<HTMLElement | null>>([]);

    const [url, setUrl] = useState("");

    const htmlToPng = async () => {
        const images = await Promise.all(
            [...Array(2)].map(async (_, index) => {
                const node = tabPanelRef.current[index];
                if (!node) return null;

                return await toJpeg(node, {
                    quality: 1,
                });
                // return base64.replace(/^data:image\/png;base64,/, "");
            })
        );

        const blobs = await Promise.all(
            images.map(async (image) => {
                if (!image) return;
                const r = await fetch(image);
                const b = await r.blob();
                return await b.arrayBuffer();
            })
        );

        if (!blobs.length) return;

        console.log({ blobs });

        // https://github.com/Kagami/ffmpeg.js/issues/18#issuecomment-238810515
        const result = ffmpeg({
            MEMFS: blobs.map((data, i) => ({
                name: `${i + 1}.jpg`,
                data: data as ArrayBuffer,
            })),
            // "-i", "%d.jpg" is the input file, where %d searches for all files
            // from 1.png to n.png
            // "-r", "60" is the frame rate
            // "out.webm" is the output file
            arguments: [
                // each image will have a duration of 2 seconds (the inverse of 1/2 frames per second)
                "-framerate",
                "1/2",
                // the input file, where %d searches for all files
                "-i",
                "%d.jpg",

                // "-c:v",
                // "libx264",

                "-r",
                "60",

                "-t",
                "4",

                "-pix_fmt",
                "yuv420p",

                "out.webm",
            ],
        });

        // console.log({ result });
        console.log(result.MEMFS[0].data); // Uint8Array
        const videoUint8Array = new Uint8Array(result.MEMFS[0].data);
        const decoder = new TextDecoder("utf8");
        const videoBase64 = decoder.decode(videoUint8Array);

        console.log({ videoBase64 });
        const videoBlob = new Blob([result.MEMFS[0].data]);
        const videoUrl = URL.createObjectURL(videoBlob);

        setUrl(videoUrl);

        if (!videoUrl) return;

        const data = new FormData();
        data.append("video", videoBlob);

        try {
            const response = await fetch("https://api.imgur.com/3/upload", {
                method: "POST",
                body: data,
                headers: {
                    Authorization: `Client-ID ${
                        import.meta.env.VITE_CLIENT_ID as string
                    }`,
                },
            });

            const json = await response.json();

            if (!response.ok) throw new Error(json.data.error);

            window.open(json.data.link, "_blank");
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <div className="flex h-full w-full justify-center bg-slate-900">
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
                <video autoPlay loop playsInline>
                    <source src={url} type="video/webm" />
                </video>
                <Code step={step} setStep={setStep} max={2} ref={tabPanelRef} />
            </div>
        </div>
    );
}

export default App;
