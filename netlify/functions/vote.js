async function vote(id) {
    const btn = document.getElementById(`l-${id}`);
    const countSpan = document.getElementById(`c-${id}`);
    
    // Определяем действие: если уже лайкнуто (активно), то дизлайк, иначе лайк
    const action = btn.classList.contains('active') ? 'dislike' : 'like';
    
    try {
        // Отправляем запрос и ждем JSON
        const res = await fetch(`/.netlify/functions/vote?id=${encodeURIComponent(id)}&action=${action}`);
        const data = await res.json();
        
        // Обновляем число и переключаем класс анимации
        if (data && typeof data.likes !== 'undefined') {
            countSpan.innerText = data.likes;
            btn.classList.toggle('active');
        }
    } catch (e) {
        console.error("Сервер лайков подавился:", e);
    }
}

async function updateLikes(id) {
    try {
        const res = await fetch(`/.netlify/functions/vote?id=${encodeURIComponent(id)}&action=get`);
        const data = await res.json();
        const countSpan = document.getElementById(`c-${id}`);
        if (countSpan && data && typeof data.likes !== 'undefined') {
            countSpan.innerText = data.likes;
        }
    } catch (e) {
        // Если база пуста, просто оставляем 0, без паники
    }
}
