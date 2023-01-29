import ffmpeg from "ffmpeg.js";

// https://github.com/Kagami/ffmpeg.js/issues/18#issuecomment-238810515

export async function imagesToVideo(blobs: Blob[]) {
    const arrayBuffers = await Promise.all(
        blobs.map(async (blob) => await blob.arrayBuffer())
    );
    console.log(arrayBuffers);
    const result = ffmpeg({
        // @ts-ignore
        MEMFS: arrayBuffers.map((data, i) => ({
            name: `${i + 1}.jpg`,
            data,
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
