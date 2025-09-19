// src/services/api.js
// Centralized API service for auth and task endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function register({ username, email, password }) {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export async function login({ email, password }) {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export async function getTasks(token) {
    try {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export async function createTask(task, token) {
    try {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export async function updateTask(id, updates, token) {
    try {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export async function deleteTask(id, token) {
    try {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    } catch (err) {
        return { message: 'Network error: Unable to reach server' };
    }
}

export function reminderEventSource(token) {
    return new EventSource(`${API_BASE_URL}/tasks/reminders?token=${token}`);
}
