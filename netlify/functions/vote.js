export default async (req, context) => {
  const url = new URL(req.url);
  const songId = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  if (action === "like") {
    try {
      // Отправляем «скрытую» форму на сервер Netlify
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "likes-form",
          "songId": songId
        }).toString(),
      });

      return new Response(JSON.stringify({ status: "success", message: "Лайк учтен!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // Если просто запрашиваем данные (get)
  return new Response(JSON.stringify({ likes: "Смотри в панели Forms" }), { status: 200 });
};
