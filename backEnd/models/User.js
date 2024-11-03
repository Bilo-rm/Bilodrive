// models/User.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        return result.rows[0];
    },

    async findByUsername(username) {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    async comparePasswords(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
};

module.exports = User;
