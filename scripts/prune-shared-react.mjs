import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

for (const pkg of ['react', 'react-dom']) {
  rmSync(join(root, 'packages/shared/node_modules', pkg), { recursive: true, force: true });
}
