import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("music_ratings");
  const url = new URL(req.url);
  const songId = url.searchParams.get("id") || "default";
  const action = url.searchParams.get("action");

  try {
    let data = await store.get(songId, { type: "json" }) || { likes: 0 };

    if (action === "like") {
      data.likes++;
      await store.setJSON(songId, data); // Теперь это должно сработать!
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    // Если вдруг запись всё же не пойдет, мы увидим это, но сайт не упадет
    return new Response(JSON.stringify({ likes: 0, error: e.message }), { status: 200 });
  }
};
