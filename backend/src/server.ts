import app from './app';

const PORT = 3000;

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Backend ejecutándose en http://localhost:${PORT}`);
});