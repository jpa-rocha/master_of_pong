import { Request, Response } from 'express'
import * as express from 'express';
import * as cors from 'cors';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = require('http').createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'https://localhost:3000',
  },
});

const PORT = 4000;

let users: { userName: string; socketID: string }[] = [];

io.on('connection', (socket: Socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('message', (data:any) => {
    io.emit('messageResponse', data);
  });

  socket.on('newUser', (data:any) => {
    users.push(data);
    io.emit('newUserResponse', users);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    users = users.filter((user) => user.socketID !== socket.id);
    io.emit('newUserResponse', users);
    socket.disconnect();
  });
});

app.use(cors());

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hello world',
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
