import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // Используем уникальное имя, чтобы не пересекаться с файловыми блобами
    const store = getStore({
        name: "live-ratings",
        // Это связывает функцию с динамическим хранилищем сайта
        siteID: process.env.SITE_ID, 
        token: process.env.NETLIFY_PURGE_API_TOKEN || context.token 
    });

    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("Missing ID", { status: 400 });

    const safeKey = Buffer.from(songId).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

    try {
        let data = await store.get(safeKey, { type: "json" }) || { likes: 0 };

        if (action === "like") data.likes++;
        if (action === "dislike") data.likes = Math.max(0, data.likes - 1);

        if (action !== "get") {
            // Вот здесь происходит магия записи
            await store.setJSON(safeKey, data);
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        // Если ты увидишь этот текст в алерте — значит, проблема в правах доступа (Scopes)
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
