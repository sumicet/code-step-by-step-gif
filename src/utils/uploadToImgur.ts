export async function uploadToImgur(videoBlob: Blob) {
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

        const link = (json.data.link as string).endsWith(".")
            ? json.data.link.slice(0, -1)
            : json.data.link;

        window.open(link, "_blank");
    } catch (error: any) {
        console.error(error);
    }
}
