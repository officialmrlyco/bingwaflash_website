// Protect the public app-update manifest from drifting away from the verified v42 APK metadata.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('version.json identifies the verified v43 installer and integrity metadata', async () => {
  const version = JSON.parse(await readFile(new URL('../version.json', import.meta.url), 'utf8'));

  assert.equal(version.versionCode, 43);
  assert.equal(version.versionName, '1.4.3');
  assert.equal(version.apkUrl, 'https://github.com/officialmrlyco/BingwaFlashApp/releases/download/v43/BingwaFlash_v1.4.3.apk?build=232636d7b9c10b93');
  assert.equal(version.apkSha256, '232636d7b9c10b93092e325e2101da8fe29e77eeb0abd5dc1bf26cb3973b7b8f');
  assert.equal(version.apkSizeBytes, 17791870);
});
