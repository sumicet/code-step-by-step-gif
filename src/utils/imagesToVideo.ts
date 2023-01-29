import ffmpeg from "ffmpeg.js/ffmpeg-mp4";

// https://github.com/Kagami/ffmpeg.js/issues/18#issuecomment-238810515

export async function imagesToVideo(blobs: Blob[]) {
    // blobs to Uint8Array
    const arrayBuffers = await Promise.all(
        blobs.map(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        })
    );

    const result = ffmpeg({
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

            "-c:v",
            "libx264",

            // video output frame rate
            "-vframes",
            "30",

            // "-preset",
            // "",

            "-pix_fmt",
            "yuv420p",

            "-vb",
            "20M",

            "out.mp4",
        ],
    });

    if (!result?.MEMFS?.[0]?.data) return { videoBlob: null, videoUrl: null };

    const videoBlob = new Blob([result.MEMFS[0].data]);
    const videoUrl = URL.createObjectURL(videoBlob);

    return { videoBlob, videoUrl };
}
