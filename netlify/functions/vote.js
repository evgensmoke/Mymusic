import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Инициализируем стор без лишних параметров, 
  // Netlify сам подставит нужные ключи в облаке
  const store = getStore("music-likes");

  const url = new URL(req.url);
  const songId = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  if (!songId) return new Response("No ID", { status: 400 });

  // Чистим ключ от спецсимволов и кириллицы
  const safeKey = Buffer.from(songId).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

  try {
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
  } catch (err) {
    // Выводим ошибку в лог, чтобы ты её увидел в панели
    console.error("Blob Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
