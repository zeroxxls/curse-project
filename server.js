const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

class EventServer {
    constructor() {
        this.app = express();
        this.port = 8000;
        this.events = [];
        this.currentId = 1;

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        this.app.get('/events', (req, res) => this.getAllEvents(req, res));
        this.app.get('/events/:id', (req, res) => this.getEventById(req, res));
        this.app.post('/events', (req, res) => this.createEvent(req, res));
        this.app.put('/events/:id', (req, res) => this.updateEvent(req, res));
        this.app.delete('/events/:id', (req, res) => this.deleteEvent(req, res));
        this.app.get('*', (req, res) => this.serveIndex(req, res));
    }

    getAllEvents(req, res) {
        res.json(this.events);
    }

    getEventById(req, res) {
        const event = this.events.find(e => e.id === parseInt(req.params.id));
        if (!event) {
            res.status(404).send('Event not found');
        } else {
            res.json(event);
        }
    }

    createEvent(req, res) {
        const event = { id: this.currentId++, ...req.body };
        this.events.push(event);
        res.status(201).json(event);
    }

    updateEvent(req, res) {
        const eventIndex = this.events.findIndex(e => e.id === parseInt(req.params.id));
        if (eventIndex === -1) {
            res.status(404).send('Event not found');
        } else {
            this.events[eventIndex] = { id: parseInt(req.params.id), ...req.body };
            res.json(this.events[eventIndex]);
        }
    }

    deleteEvent(req, res) {
        const eventIndex = this.events.findIndex(e => e.id === parseInt(req.params.id));
        if (eventIndex === -1) {
            res.status(404).send('Event not found');
        } else {
            this.events.splice(eventIndex, 1);
            res.status(204).send();
        }
    }

    serveIndex(req, res) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Сервер работает. Используйте http://localhost:${this.port} для работы с событиями.`);
        });
    }
}

const server = new EventServer();
server.start();