const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: String,
        email: { type: String, unique: true },
        passwordHash: String
    },
    { timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
