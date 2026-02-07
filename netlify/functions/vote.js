export default async (req, context) => {
  try {
    // Импортируем библиотеку только внутри функции
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("music_ratings");
    
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("No ID", { status: 400 });

    let data = await store.get(songId, { type: "json" }) || { likes: 0 };

    if (action === "like") {
      data.likes++;
      await store.setJSON(songId, data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    // Если база всё еще заблокирована, ты увидишь текст ошибки на экране!
    return new Response(JSON.stringify({ 
      error: "База не отвечает", 
      details: err.message 
    }), { status: 200 });
  }
};
