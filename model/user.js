const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  socketId: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
