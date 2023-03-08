import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression'; // compresses requests
import * as http from 'http';
import defaultRoute from '@/routes/default';
import {
  CreateUser,
  DeleteByIds,
  FindUserByEmail,
  UpdateManyUsersById,
  UpdateUserById,
  findUsersPerState,
} from '@/routes/users';

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const allowedOrigins = ['http://localhost'];

app.use(helmet());
app.use(compression());
app.use(express.json({limit: '50mb'}));
app.use(
  cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

app.use(express.json());
app.disable('x-powered-by');
app.get('/', defaultRoute);

//users
app.post('/users', CreateUser);
app.get('/users/email/:email', FindUserByEmail);
app.delete('/users', DeleteByIds);
app.put('/users', UpdateUserById);
app.put('/users/update', UpdateManyUsersById);
app.get('/findUsersPerState', findUsersPerState);

const server = http.createServer(app);

server.listen(port as number, host, () =>
  console.log(`
🚀 Server ready at: http://${host}:${port}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);

export default server;
