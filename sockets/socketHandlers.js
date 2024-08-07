const User = require('../model/user');
const Message = require('../model/message');

let onlineUsers = [];

const registerUser = async (socket, data) => {
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
    socket.broadcast.emit('user_online', onlineUsers);
    console.log(`User registered: ${username} with socket ID: ${socket.id}`);
  } catch (err) {
    console.error('Error registering user:', err);
    socket.emit('register_response', { status: 'error', message: 'Error registering user' });
  }
};

const loginUser = async (socket, data) => {
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
      socket.broadcast.emit('user_online', onlineUsers);
      console.log(`User logged in: ${username}`);
    } else {
      console.log(`User not found: ${username}`);
      socket.emit('login_response', { status: 'success', message: 'User Not Found' });
    }
  } catch (err) {
    console.error('Error logging in user:', err);
    socket.emit('login_response', { status: 'error', message: 'Error logging in user' });
  }
};

const chatWithUser = async (socket, { recipient, message, widgetId }) => {
  try {
    const recipientUser = await User.findOne({ username: recipient });

    if (recipientUser) {
      if (onlineUsers.includes(recipient)) {
        socket.to(recipientUser.socketId).emit('particular_user_chat_message', {
          sender: socket.id, message, username: recipientUser.username, senderId: widgetId
        });
        const messageDoc = new Message({ sender: socket.id, recipient, message });
        await messageDoc.save();
      } else {
        const messageDoc = new Message({ sender: socket.id, recipient, message });
        await messageDoc.save();
        console.log(`Message saved for offline user: ${recipient}`);
      }
    } else {
      console.log(`User not found: ${recipient}`);
    }
  } catch (err) {
    console.error('Error sending particular user chat message:', err);
  }
};

const handleCallUser = (socket, { recipientSocketId, offer }) => {
  console.log(`Call to ${recipientSocketId} from ${socket.id}`);
  socket.to(recipientSocketId).emit('call_made', {
    offer,
    socketId: socket.id,
  });
};

const handleAnswer = (socket, { recipientSocketId, answer }) => {
  console.log(`Answer to ${recipientSocketId} from ${socket.id}`);
  socket.to(recipientSocketId).emit('answer_made', {
    answer,
    socketId: socket.id,
  });
};

const handleIceCandidate = (socket, { recipientSocketId, candidate }) => {
  console.log(`ICE Candidate to ${recipientSocketId} from ${socket.id}`);
  socket.to(recipientSocketId).emit('ice_candidate', {
    candidate,
    socketId: socket.id,
  });
};

const handleDisconnect = (socket) => {
  console.log('User disconnected:', socket.id);
  onlineUsers = onlineUsers.filter(user => user !== socket.id);
  socket.broadcast.emit('user_offline', socket.id);
};

module.exports = {
  registerUser,
  loginUser,
  chatWithUser,
  handleCallUser,
  handleAnswer,
  handleIceCandidate,
  handleDisconnect,
};
