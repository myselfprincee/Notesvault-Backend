import connectToMongo from './db.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import indexRoutes from './routes/index.js';
import helmet from 'helmet';
import cluster from 'node:cluster';
import os from 'node:os';
import { availableParallelism } from 'node:os';
import process from 'node:process';

connectToMongo();

const app = express();
const port = process.env.PORT || 1337;
app.use(cors());
app.disable("x-powered-by");
app.use(express.json());
app.use(helmet());
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/api', indexRoutes);

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {
  app.listen(port,'0.0.0.0', () => {
  console.log(`NotesVault Backend listening on port ${port}`);
  console.log(`Worker ${process.pid} started`);
});

}


console.log(os.cpus().length);