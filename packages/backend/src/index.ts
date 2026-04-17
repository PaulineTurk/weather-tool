import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import fieldRoutes from './routes/fieldRoutes';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
