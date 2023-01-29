import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export async function imagesToVideo(blobs: Blob[]) {
    const ffmpeg = createFFmpeg({
        log: true,
    });

    await ffmpeg.load();
    blobs.forEach(async (blob, index) => {
        ffmpeg.FS("writeFile", `image${index}.jpg`, await fetchFile(blob));
    });
    await ffmpeg.run(
        "-framerate",
        "1",
        "-i",
        "image%d.jpg",
        "-vb",
        "10M",
        "-crf",
        "10",
        "-r",
        "60",
        "-c:v",
        "libx264",
        "-c:a",
        "copy",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "slow",
        "-vf",
        "unsharp=3:3:1.5",
        "video.mp4"
    );

    const result = ffmpeg.FS("readFile", "video.mp4");

    if (!result) return { videoBlob: null, videoUrl: null };

    const videoBlob = new Blob([result], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);

    return { videoBlob, videoUrl };
}
