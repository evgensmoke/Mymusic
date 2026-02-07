export default async (req, context) => {
  // Мы ВООБЩЕ убираем импорт Blobs, чтобы проверить, 
  // оживет ли кнопка лайка без обращения к базе.
  return new Response(JSON.stringify({ 
    likes: 999, 
    message: "База пока отключена, но функция работает!" 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
