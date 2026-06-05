import { createApp } from './index.js';

const PORT = parseInt(process.env.PORT || '35688', 10);
const app = createApp();

app.listen(PORT, () => {
  console.log(`[Portfolio] running at http://localhost:${PORT}`);
});
