import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    const store = getStore("music-rating");
    const url = new URL(req.url);
    const songId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!songId) return new Response("Missing ID", { status: 400 });

    // ВОТ ОНА, ВОЛШЕБНАЯ СТРОКА, КОТОРОЙ У ТЕБЯ НЕТ:
    // Превращаем "Весна" в "0JLQtdGB0L3QsA==" чтобы сервер не тупил
    const safeKey = Buffer.from(songId).toString('base64');

    // Читаем текущие данные
    let currentData = await store.get(safeKey, { type: "json" }) || { likes: 0 };

    // Меняем цифры
    if (action === "like") {
        currentData.likes += 1;
    } else if (action === "dislike") {
        currentData.likes = Math.max(0, currentData.likes - 1);
    }

    // Если это не просто просмотр, то сохраняем
    if (action !== "get") {
        await store.setJSON(safeKey, currentData);
    }

    // Отдаем ответ
    return new Response(JSON.stringify(currentData), {
        headers: { "Content-Type": "application/json" }
    });
};
