import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Называем стор по-новому, чтобы сбросить все старые глюки
  const store = getStore("music_v3");
  
  const url = new URL(req.url);
  const songId = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  if (!songId) return new Response("No ID", { status: 400 });

  try {
    // Читаем (если данных нет, берем 0)
    let data = await store.get(songId, { type: "json" }) || { likes: 0 };

    if (action === "like") {
      data.likes++;
      // ЗАПИСЫВАЕМ (вот здесь происходит магия создания стора в панели)
      await store.setJSON(songId, data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    // Если упадет, мы увидим причину прямо в ответе вместо 502
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
