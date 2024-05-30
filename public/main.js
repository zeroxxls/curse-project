document.addEventListener('DOMContentLoaded', function() {
    const upcomingEventsBtn = document.getElementById('upcoming-events-btn');
    const scheduledEventsBtn = document.getElementById('scheduled-events-btn');
    const calendarBtn = document.getElementById('calendar-btn');

    const sections = document.querySelectorAll('.section');

    const upcomingEventsList = document.getElementById('upcoming-events-list');
    const scheduledEventsList = document.getElementById('scheduled-events-list');

    const eventForm = document.getElementById('event-form');
    const editPanel = document.getElementById('edit-panel');
    const editForm = document.getElementById('edit-form');
    let currentEditId = null;

    // Получение и сортировка событий
    function fetchEvents() {
        fetch('http://localhost:8000/events')
            .then(response => response.json())
            .then(data => {
                const now = new Date();
                const oneWeekLater = new Date();
                oneWeekLater.setDate(now.getDate() + 7);

                upcomingEventsList.innerHTML = '';
                scheduledEventsList.innerHTML = '';

                data.forEach(event => {
                    const eventDate = new Date(event.date);
                    const eventElement = document.createElement('div');
                    eventElement.innerHTML = `
                        <p>${event.title} at ${event.location} on ${event.date}</p>
                        <button class="edit-btn" data-id="${event.id}">Изменить</button>
                        <button class="delete-btn" data-id="${event.id}">Удалить</button>
                    `;

                    if (eventDate <= oneWeekLater) {
                        upcomingEventsList.appendChild(eventElement);
                    } else {
                        scheduledEventsList.appendChild(eventElement);
                    }
                });

                // Присоединить обработчики событий для кнопок редактирования
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        editEvent(id);
                    });
                });

                // Присоединить обработчики событий для кнопок удаления
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        deleteEvent(id);
                    });
                });
            })
            .catch(error => console.error('Ошибка при получении событий:', error));
    }

    // Добавление события
    function addEvent(event) {
        event.preventDefault();
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const duration = document.getElementById('event-duration').value;
        const location = document.getElementById('event-location').value;

        console.log('Добавление события:', { title, date, time, duration, location });

        fetch('http://localhost:8000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, date, time, duration, location })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Событие добавлено:', data);
            fetchEvents();
            eventForm.reset();
        })
        .catch(error => console.error('Ошибка при добавлении события:', error));
    }

    // Открытие панели редактирования
    function openEditPanel(event) {
        editPanel.classList.add('open');
        document.getElementById('edit-event-title').value = event.title;
        document.getElementById('edit-event-date').value = event.date;
        document.getElementById('edit-event-time').value = event.time;
        document.getElementById('edit-event-duration').value = event.duration;
        document.getElementById('edit-event-location').value = event.location;
    }

    // Редактирование события
    function editEvent(id) {
        currentEditId = id; // Установим текущий ID для редактируемого события
        fetch(`http://localhost:8000/events/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(event => {
                openEditPanel(event);
            })
            .catch(error => console.error('Ошибка при получении события:', error));
    }

    // Обновление события
    function updateEvent(event) {
        event.preventDefault();
        const title = document.getElementById('edit-event-title').value;
        const date = document.getElementById('edit-event-date').value;
        const time = document.getElementById('edit-event-time').value;
        const duration = document.getElementById('edit-event-duration').value;
        const location = document.getElementById('edit-event-location').value;

        fetch(`http://localhost:8000/events/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, date, time, duration, location })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Событие обновлено:', data);
            fetchEvents();
            editPanel.classList.remove('open');
        })
        .catch(error => console.error('Ошибка при обновлении события:', error));
    }

    // Удаление события
    function deleteEvent(id) {
        fetch(`http://localhost:8000/events/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Событие удалено');
            fetchEvents();
        })
        .catch(error => console.error('Ошибка при удалении события:', error));
    }

    // Закрытие панели редактирования
    function closeEditPanel() {
        editPanel.classList.remove('open');
    }

    // Логика переключения разделов
    function switchSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Слушатели событий для навигации
    upcomingEventsBtn.addEventListener('click', () => {
        switchSection('upcoming-events');
        fetchEvents();
    });

    scheduledEventsBtn.addEventListener('click', () => {
        switchSection('scheduled-events');
        fetchEvents();
    });

    calendarBtn.addEventListener('click', () => {
        switchSection('calendar');
    });

    // Присоединить слушатель событий к форме
    eventForm.addEventListener('submit', addEvent);
    editForm.addEventListener('submit', updateEvent);

    // Слушатель для кнопки закрытия панели редактирования
    document.getElementById('close-edit-panel').addEventListener('click', closeEditPanel);

    // Первоначальное получение событий
    switchSection('upcoming-events');
    fetchEvents();
});
