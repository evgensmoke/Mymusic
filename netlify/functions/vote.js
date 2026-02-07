import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    const store = getStore("music-rating");
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("Missing ID", { status: 400 });

    // Создаем безопасный ключ для базы (Base64), чтобы кириллица не ломала логику
    const safeKey = Buffer.from(songId).toString('base64');

    let currentData = await store.get(safeKey, { type: "json" }) || { likes: 0 };

    if (action === "like") {
        currentData.likes += 1;
    } else if (action === "dislike") {
        currentData.likes = Math.max(0, currentData.likes - 1);
    }

    await store.setJSON(safeKey, currentData);

    return new Response(JSON.stringify(currentData), {
        headers: { "Content-Type": "application/json" }
    });
};
