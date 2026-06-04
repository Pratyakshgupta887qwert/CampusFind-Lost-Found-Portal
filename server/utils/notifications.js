import { Notification } from '../models/Notification.js';

let ioRef = null;

export const setSocketServer = (io) => {
  ioRef = io;
};

export const createNotification = async ({ message, audience = 'all', tone = 'info' }) => {
  const notification = await Notification.create({ message, audience, tone });
  if (ioRef) {
    if (audience === 'all') {
      ioRef.emit('notification:new', notification);
    } else {
      ioRef.to(audience).emit('notification:new', notification);
    }
  }
  return notification;
};

export const emitPostEvent = (eventName, post) => {
  if (ioRef) {
    ioRef.emit(eventName, post);
  }
};
