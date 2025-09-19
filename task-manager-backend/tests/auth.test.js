const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

require('./setup.js');

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'biswajit',
            email: 'biswajit@example.com',
            password: 'securepass'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User registered');
    });

    it('should login with correct credentials', async () => {
        const user = await User.create({
            username: 'biswajit',
            email: 'biswajit@example.com',
            passwordHash: await require('bcryptjs').hash('securepass', 10)
        });

        const res = await request(app).post('/api/auth/login').send({
            email: 'biswajit@example.com',
            password: 'securepass'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'biswajit@example.com',
            password: 'wrongpass'
        });

        expect(res.statusCode).toBe(401);
    });
});
