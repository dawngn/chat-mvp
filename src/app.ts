import express from 'express';
import {createServer} from "http";
import {Server} from "socket.io";
import cors from 'cors';
import config from 'config';
import logger from './utils/logger';
import {version} from '../package.json';

import socket from './socket';

const port = config.get<number>("port");
const host = config.get<string>("host");
const corsOrigin = config.get<string>("corsOrigin");

const app = express();

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
});

server.listen(port, host, () => {
  logger.info(`Server version ${version} is running on http://${host}:${port}`);
  socket({ io });
});