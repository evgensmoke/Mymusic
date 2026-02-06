import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Настраиваем наше хранилище под названием 'music-rating'
  const store = getStore("music-rating");
  const url = new URL(req.url);
  const songId = url.searchParams.get("id"); // Получаем название песни из ссылки
  const action = url.searchParams.get("action"); // 'like' или 'dislike'

  if (!songId) return new Response("Missing song ID", { status: 400 });

  // 1. Читаем текущее количество лайков (если нет — будет 0)
  let currentData = await store.get(songId, { type: "json" }) || { likes: 0 };

  // 2. Меняем цифру
  if (action === "like") {
    currentData.likes += 1;
  } else if (action === "dislike") {
    currentData.likes = Math.max(0, currentData.likes - 1);
  }

  // 3. Записываем обратно в Blobs
  await store.setJSON(songId, currentData);

  return new Response(JSON.stringify(currentData), {
    headers: { "Content-Type": "application/json" }
  });
};
