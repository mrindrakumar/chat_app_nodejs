const socketIo = require('socket.io');
const {
  registerUser,
  loginUser,
  chatWithUser,
  handleCallUser,
  handleAnswer,
  handleIceCandidate,
  handleDisconnect
} = require('../sockets/socketHandlers');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    //------------------------------ Register User---------------------------------------

    socket.on('register', (data) => registerUser(socket, data));

    //--------------------------------- Login User ---------------------------------
    socket.on('login', (data) => loginUser(socket, data));

    //-------------------------- Chat with Particular User-------------------------------
    socket.on('particular_user_chat', (data) => chatWithUser(socket, data));

    // ---------------------- Handle Video Call------------------------------------

    socket.on('call_user', (data) => handleCallUser(socket, data));
    socket.on('make_answer', (data) => handleAnswer(socket, data));
    socket.on('ice_candidate', (data) => handleIceCandidate(socket, data));

    // ------------------------------------------- Handle Disconnection ----------------------------------------
    socket.on('disconnect', () => handleDisconnect(socket));
  });
};
