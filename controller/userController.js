// controllers/userController.js

const User = require('../model/user');

exports.registerUser = async (data, socket, io, onlineUsers) => {
  const { username, mobileNumber } = data;
  try {
    console.log('---------->', username);
    const existingUser = await User.findOne({ username: username, mobileNumber: mobileNumber });
    console.log('----------------->', existingUser);
    if (existingUser) {
      socket.emit('register_response', { status: 'success', message: 'User Already Exists' });
    } else {
      const existingMobile = await User.findOne({ mobileNumber: mobileNumber });
      if (existingMobile) {
        socket.emit('register_response', { status: 'success', message: 'User Mobile Number Already Exists' });
      } else {
        const user = new User({ username, socketId: socket.id, mobileNumber: mobileNumber });
        await user.save();
        socket.emit('register_response', { status: 'success', message: 'User registered successfully' });
      }
    }
    if (!onlineUsers.includes(username)) {
      onlineUsers.push(username);
    }
    io.emit('user_online', onlineUsers);
    console.log(`User registered: ${username} with socket ID: ${socket.id}`);
  } catch (err) {
    console.error('Error registering user:', err);
    socket.emit('register_response', { status: 'error', message: 'Error registering user' });
  }
};

exports.loginUser = async (data, socket, io, onlineUsers) => {
  const { username, mobileNumber } = data;
  try {
    const existingUser = await User.findOne({ username: username, mobileNumber: mobileNumber });
    if (existingUser) {
      existingUser.socketId = socket.id;
      await existingUser.save();
      socket.emit('login_response', { status: 'success', message: 'User Login successfully', data: existingUser });
      if (!onlineUsers.includes(username)) {
        onlineUsers.push(username);
      }
      io.emit('user_online', onlineUsers);
      console.log(`User logged in: ${username}`);
    } else {
      console.log(`User not found: ${username}`);
      socket.emit('login_response', { status: 'success', message: 'User Not Found', });
    }
  } catch (err) {
    console.error('Error logging in user:', err);
  }
};
