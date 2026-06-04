import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { config } from './config.js';
import { connectDb } from './db.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import { setSocketServer } from './utils/notifications.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

setSocketServer(io);

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'CampusFind API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

io.on('connection', (socket) => {
  const email = socket.handshake.auth?.email;
  if (email) socket.join(String(email).toLowerCase());
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

await connectDb();

server.listen(config.port, () => {
  console.log(`CampusFind API running on http://127.0.0.1:${config.port}`);
});
