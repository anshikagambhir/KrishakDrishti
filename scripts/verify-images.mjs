import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve('frontend/src');
const publicRoot = path.resolve('frontend/public');
let checked = 0;
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) { walk(absolute); continue; }
    if (!/\.(tsx?|jsx?)$/.test(item.name)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    for (const match of source.matchAll(/['"`]\/(images\/[^'"`$?\s]+)/g)) {
      checked++;
      const file = path.join(publicRoot, match[1]);
      assert.ok(fs.existsSync(file), `Missing asset ${match[1]} in ${path.relative(root, absolute)}`);
    }
  }
}
walk(root);
console.log(`Verified ${checked} local /images asset references.`);
