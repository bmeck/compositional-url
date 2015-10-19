import {ComposableURL,URLAuth,URLPathname,URLSearch} from './';
import * as assert from 'assert';

function check({
  url,
  protocol,
  auth,
  hostname,
  port,
  pathname,
  search,
  hash,
  isProtocolRelative,
  string,
  pathname_tests
}) {
  if (auth === undefined) {
    auth = new URLAuth();
  }
  if (pathname === undefined) {
    pathname = new URLPathname();
  }
  else {
    pathname = new URLPathname(pathname.raw());
  }
  if (search === undefined) {
    search = new URLSearch();
  }
  const fixture = {
    protocol,
    auth,
    hostname,
    port,
    pathname,
    search,
    hash,
    isProtocolRelative: Boolean(isProtocolRelative)
  };
  assert.deepEqual(url, fixture);
  const test_str = String(url);
  assert.equal(test_str, string);
  const auth_str = String(auth);
  if (auth_str) {
    const authed_str = url.toString(true);
    assert.notEqual(authed_str, test_str);
    assert.equal(url.toString(true).replace(auth_str, ''), test_str);
  }
  if (pathname_tests) {
    const {normalize, base, safer} = pathname_tests;
    if (base) assert.equal(base, url.pathname.base());
    if (normalize) assert.equal(normalize, url.pathname.normalize());
    if (safer) assert.equal(safer, url.pathname.safer());
  }
}
const checks = [
{
  url: new ComposableURL('http://google.com').resolve('/..'),
  protocol: 'http:',
  hostname: 'google.com',
  pathname: new URLPathname(['', '..']),
  string: 'http://google.com/..',
  pathname_tests: {
    normalize: '/',
    base: '',
    safer: ''
  }
},
{
  url: new ComposableURL('http://google.com/t').resolve('/..'),
  protocol: 'http:',
  hostname: 'google.com',
  pathname: new URLPathname(['/..']),
  string: 'http://google.com/..',
  pathname_tests: {
    normalize: '/',
    base: '',
    safer: ''
  }
},
{
  url: new ComposableURL('node_modules'),
  pathname: new URLPathname(['node_modules']),
  string:'node_modules',
  pathname_tests: {
    normalize: 'node_modules',
    base: 'node_modules',
    safer: 'node_modules'
  }
},
{
  url: new ComposableURL('node_modules/t'),
  pathname: new URLPathname(['node_modules','t']),
  string:'node_modules/t'
},
{
  url: new ComposableURL('./node_modules/t'),
  pathname: new URLPathname(['.', 'node_modules','t']),
  string:'./node_modules/t',
  pathname_tests: {
    normalize: './node_modules/t',
    base: 'node_modules/t',
    safer: 'node_modules/t'
  }
},
{
  url: new ComposableURL('./node_modules/../t'),
  pathname: new URLPathname(['.', 'node_modules', '..', 't']),
  string:'./node_modules/../t',
  pathname_tests: {
    normalize: './t',
    base: 'node_modules/../t',
    safer: 't'
  }
},
{
  url: new ComposableURL('//./node_modules/../t'),
  hostname: '.',
  pathname: new URLPathname(['', 'node_modules', '..', 't']),
  isProtocolRelative: true,
  string:'//./node_modules/../t',
  pathname_tests: {
    normalize: '/t',
    base: 'node_modules/../t',
    safer: 't'
  }
},
{
  url: new ComposableURL('//goog.ly'),
  hostname: 'goog.ly',
  isProtocolRelative: true,
  string:'//goog.ly'
},
{
  url: new ComposableURL('//goog.ly:1337'),
  hostname: 'goog.ly',
  port: 1337,
  isProtocolRelative: true,
  string:'//goog.ly:1337'
},
{
  url: new ComposableURL('//goog.ly:01337'),
  hostname: 'goog.ly',
  port: 1337,
  isProtocolRelative: true,
  string:'//goog.ly:1337'
},
{
  url: new ComposableURL('//:123@goog.ly'),
  auth: new URLAuth(undefined, '123'),
  hostname: 'goog.ly',
  isProtocolRelative: true,
  string:'//goog.ly'
},
{
  url: new ComposableURL('//bmeck:123@goog.ly'),
  auth: new URLAuth('bmeck', '123'),
  hostname: 'goog.ly',
  isProtocolRelative: true,
  string:'//goog.ly'
},
{
  url: new ComposableURL('//bmeck@goog.ly'),
  auth: new URLAuth('bmeck', undefined),
  hostname: 'goog.ly',
  isProtocolRelative: true,
  string:'//goog.ly'
}
];
for (const item of checks) {
  check(item);
}

assert.deepEqual(new ComposableURL('cat').resolve('dog'), new ComposableURL('cat/dog'));
assert.deepEqual(new ComposableURL('http:').resolve('//google.com'), new ComposableURL('http://google.com'));
assert.deepEqual(new ComposableURL('http:').resolve('google.com'), new ComposableURL('http:///google.com'));
assert.deepEqual(new ComposableURL('http:').resolve('google.com'), new ComposableURL('http:/google.com'));
;{
  let url = new ComposableURL('http://google.com/t').resolve('./..');
  url = url.withPathname(url.pathname.normalize());
  assert.deepEqual(url, new ComposableURL('http://google.com/'));
}
;{
  let url = new ComposableURL('http://google.com/t').resolve('./');
  url = url.withPathname(url.pathname.normalize());
  assert.deepEqual(url, new ComposableURL('http://google.com/t'));
}
;{
  let url = new ComposableURL('http://google.com/t').resolve('.');
  url = url.withPathname(url.pathname.normalize());
  assert.deepEqual(url, new ComposableURL('http://google.com/t'));
}
