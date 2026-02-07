import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("No ID", { status: 400 });

    // Самый простой способ получить хранилище
    const store = getStore("music-rating");

    // Используем максимально простой ключ для базы
    const safeKey = Buffer.from(songId).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

    let data = await store.get(safeKey, { type: "json" }) || { likes: 0 };

    if (action === "like") data.likes++;
    if (action === "dislike") data.likes = Math.max(0, data.likes - 1);

    if (action !== "get") {
      await store.setJSON(safeKey, data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // ВНИМАНИЕ: Если всё упадет, мы увидим причину в тексте ответа
    return new Response(JSON.stringify({ 
      error: "Ошибка базы", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
