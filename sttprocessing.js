import connectToMongo from './db.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import indexRoutes from './routes/index.js';
import helmet from 'helmet';

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


app.listen(port,'0.0.0.0', () => {
  console.log(`NotesVault Backend listening on port ${port}`);
});