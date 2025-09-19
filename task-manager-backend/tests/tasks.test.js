const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('./setup.js');

let token;

beforeEach(async () => {
    const user = await User.create({
        username: 'biswajit',
        email: 'biswajit@example.com',
        passwordHash: await bcrypt.hash('securepass', 10)
    });

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
});

describe('Task API', () => {
    it('should create a task', async () => {
        const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
            title: 'Test Task',
            description: 'This is a test',
            priority: 'High',
            status: 'To Do'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Test Task');
    });

    it('should fetch tasks', async () => {
        await Task.create({
            userId: jwt.decode(token).userId,
            title: 'Sample Task',
            priority: 'Medium',
            status: 'In Progress'
        });

        const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('should update a task', async () => {
        const task = await Task.create({
            userId: jwt.decode(token).userId,
            title: 'Old Title',
            status: 'To Do'
        });

        const res = await request(app).put(`/api/tasks/${task._id}`).set('Authorization', `Bearer ${token}`).send({ title: 'Updated Title' });

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Updated Title');
    });

    it('should delete a task', async () => {
        const task = await Task.create({
            userId: jwt.decode(token).userId,
            title: 'Delete Me'
        });

        const res = await request(app).delete(`/api/tasks/${task._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Task deleted');
    });
});
