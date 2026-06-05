import { createApp } from './index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Compute web dist path relative to this file (works in ncc ESM output)
const cliDir = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(cliDir, '../../../web/dist');

const PORT = parseInt(process.env.PORT || '35688', 10);
const app = createApp(webDist);

app.listen(PORT, () => {
  console.log(`[Portfolio] running at http://localhost:${PORT}`);
});
