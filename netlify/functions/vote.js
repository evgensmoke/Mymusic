import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // Важно: имя стора должно быть простым
    const store = getStore("ratings");
    
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("No ID", { status: 400 });

    const safeKey = btoa(encodeURIComponent(songId)).replace(/[^a-zA-Z0-9]/g, "");

    try {
        let data = await store.get(safeKey, { type: "json" }) || { likes: 0 };

        if (action === "like") data.likes++;
        if (action === "dislike") data.likes = Math.max(0, data.likes - 1);

        if (action !== "get") {
            // Вот тут создается динамический блоб, если его нет
            await store.setJSON(safeKey, data);
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error("DEBUG_BLOB:", e.message);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
