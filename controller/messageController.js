// controllers/messageController.js

const Message = require('../model/message');
const User = require('../model/user');

exports.particularUserChat = async ({ recipient, message, widgetId }, socket, io, onlineUsers) => {
  try {
    const recipientUser = await User.findOne({ username: recipient });

    if (recipientUser) {
      if (onlineUsers.includes(recipient)) {
        io.to(recipientUser.socketId).emit('particular_user_chat_message', {
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
