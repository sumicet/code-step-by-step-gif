import ffmpeg from "ffmpeg.js";

// https://github.com/Kagami/ffmpeg.js/issues/18#issuecomment-238810515

export function imagesToVideo(blobs: Array<ArrayBuffer | undefined>) {
    const result = ffmpeg({
        // @ts-ignore
        MEMFS: blobs.map((data, i) => ({
            name: `${i + 1}.jpg`,
            data: data as ArrayBuffer,
        })),
        // https://ffmpeg.org/ffmpeg.html
        arguments: [
            // -framerate 1/n => each image will have a duration of n seconds
            "-framerate",
            "1",
            // the input file, where %d searches for all files
            "-i",
            "%d.jpg",

            // "-c:v",
            // "libx264",

            // video output frame rate
            "-vframes",
            "60",

            "-pix_fmt",
            "yuv420p",

            // "-crf",
            // "10",

            "out.webm",
        ],
    });

    if (!result?.MEMFS?.[0]?.data) return { videoBlob: null, videoUrl: null };

    // const videoUint8Array = new Uint8Array(result.MEMFS[0].data);
    // const decoder = new TextDecoder("utf8");
    // const videoBase64 = decoder.decode(videoUint8Array);

    const videoBlob = new Blob([result.MEMFS[0].data]);
    const videoUrl = URL.createObjectURL(videoBlob);

    return { videoBlob, videoUrl };
}
