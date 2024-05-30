document.addEventListener('DOMContentLoaded', function() {
    class EventManager {
        constructor() {
            this.upcomingEventsBtn = document.getElementById('upcoming-events-btn');
            this.scheduledEventsBtn = document.getElementById('scheduled-events-btn');
            this.calendarBtn = document.getElementById('calendar-btn');
            this.sections = document.querySelectorAll('.section');
            this.upcomingEventsList = document.getElementById('upcoming-events-list');
            this.scheduledEventsList = document.getElementById('scheduled-events-list');
            this.eventForm = document.getElementById('event-form');
            this.editPanel = document.getElementById('edit-panel');
            this.editForm = document.getElementById('edit-form');
            this.currentEditId = null;

            this.addEventListeners();
            this.switchSection('upcoming-events');
            this.fetchEvents();
        }

        addEventListeners() {
            this.upcomingEventsBtn.addEventListener('click', () => {
                this.switchSection('upcoming-events');
                this.fetchEvents();
            });

            this.scheduledEventsBtn.addEventListener('click', () => {
                this.switchSection('scheduled-events');
                this.fetchEvents();
            });

            this.calendarBtn.addEventListener('click', () => {
                this.switchSection('calendar');
            });

            this.eventForm.addEventListener('submit', (event) => this.addEvent(event));
            this.editForm.addEventListener('submit', (event) => this.updateEvent(event));
            document.getElementById('close-edit-panel').addEventListener('click', () => this.closeEditPanel());
        }

        switchSection(sectionId) {
            this.sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
        }

        fetchEvents() {
            fetch('http://localhost:8000/events')
                .then(response => response.json())
                .then(data => this.renderEvents(data))
                .catch(error => console.error('Ошибка при получении событий:', error));
        }

        renderEvents(events) {
            const now = new Date();
            const oneWeekLater = new Date();
            oneWeekLater.setDate(now.getDate() + 7);

            this.upcomingEventsList.innerHTML = '';
            this.scheduledEventsList.innerHTML = '';

            events.forEach(event => {
                const eventDate = new Date(event.date);
                const eventElement = this.createEventElement(event);

                if (eventDate <= oneWeekLater) {
                    this.upcomingEventsList.appendChild(eventElement);
                } else {
                    this.scheduledEventsList.appendChild(eventElement);
                }
            });
        }

        createEventElement(event) {
            const eventElement = document.createElement('div');
            eventElement.innerHTML = `
                <p>${event.title} at ${event.location} on ${event.date}</p>
                <button class="edit-btn" data-id="${event.id}">Изменить</button>
                <button class="delete-btn" data-id="${event.id}">Удалить</button>
            `;

            eventElement.querySelector('.edit-btn').addEventListener('click', () => this.editEvent(event.id));
            eventElement.querySelector('.delete-btn').addEventListener('click', () => this.deleteEvent(event.id));

            return eventElement;
        }

        addEvent(event) {
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
                this.fetchEvents();
                this.eventForm.reset();
            })
            .catch(error => console.error('Ошибка при добавлении события:', error));
        }

        openEditPanel(event) {
            this.editPanel.classList.add('open');
            document.getElementById('edit-event-title').value = event.title;
            document.getElementById('edit-event-date').value = event.date;
            document.getElementById('edit-event-time').value = event.time;
            document.getElementById('edit-event-duration').value = event.duration;
            document.getElementById('edit-event-location').value = event.location;
        }

        editEvent(id) {
            this.currentEditId = id;
            fetch(`http://localhost:8000/events/${id}`)
                .then(response => response.json())
                .then(event => this.openEditPanel(event))
                .catch(error => console.error('Ошибка при получении события:', error));
        }

        updateEvent(event) {
            event.preventDefault();
            const title = document.getElementById('edit-event-title').value;
            const date = document.getElementById('edit-event-date').value;
            const time = document.getElementById('edit-event-time').value;
            const duration = document.getElementById('edit-event-duration').value;
            const location = document.getElementById('edit-event-location').value;

            fetch(`http://localhost:8000/events/${this.currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, date, time, duration, location })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Событие обновлено:', data);
                this.fetchEvents();
                this.editPanel.classList.remove('open');
            })
            .catch(error => console.error('Ошибка при обновлении события:', error));
        }

        deleteEvent(id) {
            fetch(`http://localhost:8000/events/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log('Событие удалено');
                this.fetchEvents();
            })
            .catch(error => console.error('Ошибка при удалении события:', error));
        }

        closeEditPanel() {
            this.editPanel.classList.remove('open');
        }
    }

    new EventManager();
});