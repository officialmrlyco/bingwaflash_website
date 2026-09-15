import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const page = fs.readFileSync(new URL('../404.html', import.meta.url), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];

// Execute the actual GitHub Pages fallback script against a pathname so the
// public dotted URL contract stays covered without a browser or deployment.
function redirectFor(pathname) {
  let destination = '';
  vm.runInNewContext(script, {
    window: {
      location: {
        pathname,
        replace: value => { destination = value; }
      }
    },
    encodeURIComponent
  });
  return destination;
}

test('fallback forwards valid dotted, underscored, and legacy hyphen usernames', () => {
  assert.equal(redirectFor('/j.o.s.e.e'), '/order/?u=j.o.s.e.e');
  assert.equal(redirectFor('/j_o_s_e_e'), '/order/?u=j_o_s_e_e');
  assert.equal(redirectFor('/old-agent'), '/order/?u=old-agent');
  assert.equal(redirectFor('/clients/j.o.s.e.e'), '/clients/?u=j.o.s.e.e');
});

// A fallback route is not a database lookup. It must still refuse path-like
// values and edge punctuation instead of forwarding a changed account key.
test('fallback refuses unsafe or malformed username route segments', () => {
  assert.equal(redirectFor('/.josee'), '/');
  assert.equal(redirectFor('/josee.'), '/');
  assert.equal(redirectFor('/josee/other'), '/');
});
