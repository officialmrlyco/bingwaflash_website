// Protect the public app-update manifest from drifting away from the verified v42 APK metadata.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('version.json identifies the verified v42 installer and integrity metadata', async () => {
  const version = JSON.parse(await readFile(new URL('../version.json', import.meta.url), 'utf8'));

  assert.equal(version.versionCode, 42);
  assert.equal(version.versionName, '1.4.2');
  assert.equal(version.apkUrl, 'https://github.com/officialmrlyco/BingwaFlashApp/releases/download/v42/BingwaFlash_v1.4.2.apk?build=cb486f2a5b2c0a42');
  assert.equal(version.apkSha256, 'cb486f2a5b2c0a42d0cb198705852b1367063f19b5043284e786a318e013c24d');
  assert.equal(version.apkSizeBytes, 16643996);
});
