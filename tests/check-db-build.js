// tests/check-db-build.js - Verifies chained npm run build:db is 100% lossless & reproducible
'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'earthlingo-dbcheck-'));

try {
  fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'data'), { recursive: true });

  for (const name of fs.readdirSync(path.join(ROOT, 'scripts'))) {
    const src = path.join(ROOT, 'scripts', name);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(tmp, 'scripts', name));
    }
  }
  fs.copyFileSync(
    path.join(ROOT, 'data', 'world_countries.geojson'),
    path.join(tmp, 'data', 'world_countries.geojson')
  );

  cp.execFileSync(process.execPath, [path.join(tmp, 'scripts', 'build_full_database.js')], {
    cwd: tmp,
    stdio: 'pipe'
  });

  const builtJson = JSON.parse(fs.readFileSync(path.join(tmp, 'data', 'languages.json'), 'utf8'));
  const headJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'languages.json'), 'utf8'));

  const builtKeys = Object.keys(builtJson).sort();
  const headKeys = Object.keys(headJson).sort();
  assert.deepStrictEqual(builtKeys, headKeys, 'Rebuilt languages.json keys diverge from committed data/languages.json');

  const diffs = [];
  for (const k of headKeys) {
    if (JSON.stringify(builtJson[k]) !== JSON.stringify(headJson[k])) {
      diffs.push(k);
    }
  }
  assert.strictEqual(diffs.length, 0, `Rebuilt data/languages.json differs from committed file on keys: ${diffs.slice(0, 10).join(', ')}`);

  const builtJs = fs.readFileSync(path.join(tmp, 'data', 'languages.js'), 'utf8');
  const headJs = fs.readFileSync(path.join(ROOT, 'data', 'languages.js'), 'utf8');
  assert.strictEqual(builtJs, headJs, 'Rebuilt data/languages.js differs from committed data/languages.js');

  console.log(`PASS  Reproducible DB build verified (${headKeys.length} keys, 0 byte drift across JSON & JS bundles)`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

