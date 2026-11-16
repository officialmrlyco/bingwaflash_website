// Protect the public app-update manifest from drifting away from the verified v44 APK metadata.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('version.json identifies the verified v44 installer and integrity metadata', async () => {
  const version = JSON.parse(await readFile(new URL('../version.json', import.meta.url), 'utf8'));

  assert.equal(version.versionCode, 44);
  assert.equal(version.versionName, '1.4.4');
  assert.equal(version.apkUrl, 'https://github.com/officialmrlyco/BingwaFlashApp/releases/download/v44/BingwaFlash_v1.4.4.apk?build=803ed539574c9dc7');
  assert.equal(version.apkSha256, '803ed539574c9dc71c8c7eaa02489f45430f96df0b511df4958f16dcc1be19ec');
  assert.equal(version.apkSizeBytes, 18168806);
});
