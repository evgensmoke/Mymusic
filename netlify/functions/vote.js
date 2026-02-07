import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // В документации сказано: если мы в Netlify, данные подтянутся сами
    const store = getStore("music-rating");
    
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("Missing ID", { status: 400 });

    // Превращаем название песни (с пробелами и русскими буквами) 
    // в безопасный ключ для базы данных
    const safeKey = Buffer.from(songId).toString('base64')
                          .replace(/\+/g, '-')
                          .replace(/\//g, '_')
                          .replace(/=+$/, '');

    try {
        // Читаем текущие лайки
        let currentData = await store.get(safeKey, { type: "json" }) || { likes: 0 };

        if (action === "like") {
            currentData.likes += 1;
        } else if (action === "dislike") {
            currentData.likes = Math.max(0, currentData.likes - 1);
        }

        // Записываем обратно, если это не просто запрос "get"
        if (action !== "get") {
            await store.setJSON(safeKey, currentData);
        }

        return new Response(JSON.stringify(currentData), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });
    } catch (err) {
        // Если база недоступна, мы вернём ошибку, а не просто "0"
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
