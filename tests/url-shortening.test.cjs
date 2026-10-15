const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

// Exercise the actual inline application script without adding browser dependencies.
const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const context = vm.createContext({
    URL,
    URLSearchParams,
    document: { getElementById: () => ({ addEventListener() {} }) }
});
vm.runInContext(script, context);
const crush = value => context.stripBase64FromJSON(value, 8, '[A-Za-z0-9+/=]{20,}', 100, 20);

test('preserves URL domains and long paths that match the base64 pattern', () => {
    const url = 'https://example.com/abcdefghijklmnopqrst?x=1';
    assert.equal(crush(url), url);
    const longHost = 'https://abcdefghijklmnopqrst.example.com/path?x=1';
    assert.equal(crush(longHost), longHost);
});

test('shortens URL parameters and fragments using the URL limit', () => {
    const result = new URL(crush('https://example.com/api?token=abcdefghijklmnopqrstuvwxyz#abcdefghijklmnopqrstuvwxyz'));
    assert.equal(result.hostname, 'example.com');
    assert.equal(result.pathname, '/api');
    assert.equal(result.searchParams.get('token'), 'abcdefghijklmnopqrst...');
    assert.equal(result.hash, '#abcdefghijklmnopqrst...');
});

test('preserves repeated query values and their order while shortening each value', () => {
    const result = new URL(crush('https://x.test/?tag=11111-22222-33333-44444&other=yes&tag=short&tag=55555-66666-77777-88888'));
    assert.deepEqual([...result.searchParams], [
        ['tag', '11111-22222-33333-44...'],
        ['other', 'yes'],
        ['tag', 'short'],
        ['tag', '55555-66666-77777-88...']
    ]);
});

test('preserves a short first duplicate when a later value is shortened', () => {
    const result = new URL(crush('https://x.test/?tag=short&tag=11111-22222-33333-44444&empty='));
    assert.deepEqual([...result.searchParams], [
        ['tag', 'short'], ['tag', '11111-22222-33333-44...'], ['empty', '']
    ]);
});

test('applies URL handling inside arrays, objects, and JSON strings', () => {
    const url = 'https://example.com/abcdefghijklmnopqrst?x=1';
    const input = { items: [url], encoded: JSON.stringify({ url }) };
    assert.equal(JSON.stringify(crush(input)), JSON.stringify(input));
});

test('retains base64 and normal text shortening outside URLs', () => {
    assert.equal(crush('data:image/png;base64,abcdefghijklmnopqrstuvwxyz'), 'data:image/png;base64,abcdefgh...');
    assert.equal(crush('abcdefghijklmnopqrstuvwxyz'), 'base64:abcdefgh...');
    assert.equal(crush('word '.repeat(25)), 'word '.repeat(20) + '...');
});

test('retains ordinary prose containing a URL and embedded base64 behavior', () => {
    const prose = 'See https://example.com/a?x=1 for details.';
    assert.equal(crush(prose), prose);
    assert.equal(crush('Payload: abcdefghijklmnopqrstuvwxyz'), 'Payload: base64:abcdefgh...');
});

test('honors distinct custom URL and base64 preservation lengths', () => {
    const customCrush = value => context.stripBase64FromJSON(value, 3, '[A-Za-z0-9+/=]{20,}', 100, 5);
    const result = new URL(customCrush('https://example.com/abcdefghijklmnopqrst?token=abcdefghijklmnopqrstuvwxyz#abcdefghij'));
    assert.equal(result.pathname, '/abcdefghijklmnopqrst');
    assert.equal(result.searchParams.get('token'), 'abcde...');
    assert.equal(result.hash, '#abcde...');
    assert.equal(customCrush('abcdefghijklmnopqrstuvwxyz'), 'base64:abc...');
});
