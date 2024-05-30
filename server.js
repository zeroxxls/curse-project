const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8000;

app.use(bodyParser.json());

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

let events = [];
let currentId = 1;

// Получение всех событий
app.get('/events', (req, res) => {
    res.json(events);
});

// Получение события по ID
app.get('/events/:id', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (!event) {
        res.status(404).send('Event not found');
    } else {
        res.json(event);
    }
});

// Создание нового события
app.post('/events', (req, res) => {
    const event = { id: currentId++, ...req.body };
    events.push(event);
    res.status(201).json(event);
});

// Обновление события
app.put('/events/:id', (req, res) => {
    const eventIndex = events.findIndex(e => e.id === parseInt(req.params.id));
    if (eventIndex === -1) {
        res.status(404).send('Event not found');
    } else {
        events[eventIndex] = { id: parseInt(req.params.id), ...req.body };
        res.json(events[eventIndex]);
    }
});

// Удаление события
app.delete('/events/:id', (req, res) => {
    const eventIndex = events.findIndex(e => e.id === parseInt(req.params.id));
    if (eventIndex === -1) {
        res.status(404).send('Event not found');
    } else {
        events.splice(eventIndex, 1);
        res.status(204).send(); // Успешное удаление, без содержимого в ответе
    }
});

// Обслуживание index.html для всех остальных маршрутов
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает. Используйте http://localhost:${port} для работы с событиями.`);
});
