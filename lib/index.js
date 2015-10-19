const isIPv6 = require('net').isIPv6;
const isIPv4 = require('net').isIPv4;

// TODO: hostname needs to only accept valid hosts / ipv4 / [ipv6] , YOLO
const URLPattern =  /^(?:(([a-zA-Z\-\.\+]+:)(?:\/\/)?|(?:\/\/))(?:([^:]+)?(?:[:]([^@]*))?@)?([^:\/\?\#]+)?(?:[:](\d+)(?=[\/?#]|$))?)?([^?#]*)?([?][^#]*)?([#][\s\S]*)?$/;

function stringifyURL(
    protocol, auth, host, port, pathname, search, hash
) {
  let ret = '';
  // complex parts cannot be strings
  if (auth instanceof URLAuth === false) throw TypeError('Expected a URLAuth');
  if (pathname instanceof URLPathname === false) throw TypeError('Expected a URLPathname');
  if (search instanceof URLSearch === false) throw TypeError('Expected a URLSearch');
  if (protocol !== undefined) ret += `${protocol}//`; 
  // protocol relative URL
  else if (auth.empty() === false
      || host !== undefined
      || port !== undefined) {
    ret += '//';
  }
  ret += auth; 
  if (host !== undefined) ret += host; 
  if (port !== undefined) ret += `:${port}`; 
  if (!pathname.empty()) ret += pathname.raw(); 
  ret += search; 
  if (hash !== undefined) ret += hash; 
  return ret;
}

const EMPTY_URL = new Array(9);
export class ComposableURL {
  constructor(str) {
    let parts = str === undefined ? EMPTY_URL : URLPattern.exec(str);
    let [, specified_protocol, protocol, user, secret, hostname, port, pathname, search, hash] =
      parts;
    if (user !== undefined) {
      user = decodeURIComponent(user);
    }
    if (secret !== undefined) {
      secret = decodeURIComponent(secret);
    }
    if (pathname !== undefined) {
      pathname = decodeURIComponent(pathname);
    }
    if (search !== undefined) {
      search = decodeURIComponent(search);
    }
    if (hash !== undefined) {
      hash = decodeURIComponent(hash);
    }
    if (hostname !== undefined) {
      if (hostname[0] === '[') {
        if (hostname[hostname.length - 1] !== ']') {
          throw new Error('unmatched [');
        }
        if (isIPv6(hostname.slice(1, -1) === false)) {
          throw new Error('expected IPv6 address inside [...]');
        }
      }
    }
    this.protocol = protocol;

    this.auth = new URLAuth(user, secret);
    this.hostname = hostname;
    this.port = port === undefined ? undefined : parseInt(port, 10);
    this.pathname = new URLPathname(pathname);
    this.search = new URLSearch(search);
    this.hash = hash;

    this.isProtocolRelative = Boolean(protocol === undefined && specified_protocol === '//');
  }
  resolve(str) {
    let url;
    if (typeof str === 'string') url = new ComposableURL(str); 
    else url = str;
    
    let ret = this;
    if (url.protocol !== undefined) {
      if (this.isProtocolRelative) {
        if (url.protocol !== undefined) {
          ret = ret.withProtocol(url.protocol);
        }
      }
      else if (this.protocol === undefined) {
        if (url.protocol !== undefined) {
          throw new Error('Cannot resolve a scheme-less URL with a schemed URL');
        }
        // neither have protocols, ignore
      }
      else {
        ret = ret.withProtocol(url.protocol);
      }
    }
    if (url.auth.empty() === false) {
      ret = ret.withAuth(url.auth);
    }
    if (url.hostname !== undefined) {
      ret = ret.withHostname(url.hostname);
    }
    if (url.port !== undefined) {
      ret = ret.withPort(url.port);
    }
    if (url.pathname !== undefined && url.pathname.empty() === false) {
      const raw = url.pathname.raw();
      // absolute path
      if (raw.length > 0 && raw[0] === '/') {
        ret = ret.withPathname(url.pathname);
      }
      else {
        if ((ret.isProtocolRelative
            || ret.protocol !== undefined) 
            && ret.pathname.empty()) {
          ret = ret.withPathname(ret.pathname.concat('', raw));
        }
        else {
          ret = ret.withPathname(ret.pathname.concat(raw));
        }
      }
    }
    if (url.search.empty() === false) {
      ret = ret.withSearch(url.search);
    }
    if (url.hash !== undefined) {
      ret = ret.withHash(url.hash);
    }
    return ret;
  }
  withProtocol(protocol) {
    return new ComposableURL(stringifyURL(
        protocol,
        this.auth,
        this.hostname,
        this.port,
        this.pathname,
        this.search,
        this.hash
    ));
  }
  withAuth(auth) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        auth,
        this.hostname,
        this.port,
        this.pathname,
        this.search,
        this.hash
    ));
  }
  withHostname(hostname) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        this.auth,
        hostname,
        this.port,
        this.pathname,
        this.search,
        this.hash
    ));
  }
  withPort(port) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        this.auth,
        this.hostname,
        port,
        this.pathname,
        this.search,
        this.hash
    ));
  }
  withPathname(pathname) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        this.auth,
        this.hostname,
        this.port,
        typeof pathname === 'string' ? new URLPathname(pathname) : pathname,
        this.search,
        this.hash
    ));
  }
  withSearch(search) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        this.auth,
        this.hostname,
        this.port,
        this.pathname,
        typeof search === 'string' ? new URLSearch(search) : search,
        this.hash
    ));
  }
  withHash(hash) {
    return new ComposableURL(stringifyURL(
        this.protocol,
        this.auth,
        this.hostname,
        this.port,
        this.pathname,
        this.search,
        '#' + hash
    ));
  }
  toString(see_auth) {
    return stringifyURL(
        this.protocol,
        see_auth === true ? this.auth : new URLAuth(),
        this.hostname,
        this.port,
        this.pathname,
        this.search,
        this.hash
    );
  }
}

export class URLAuth {
  constructor(user, secret) {
    this.user = user;
    this.secret = secret;
  }
  empty() {
    if (this.user === undefined && this.secret === undefined) return true;
    return false;
  }
  toString() {
    if (this.empty()) return '';
    const user = this.user === undefined ? '' : encodeURIComponent(this.user);
    if (this.secret !== undefined) {
      const secret = encodeURIComponent(this.secret);
      return `${user}:${secret}@`;
    }
    else {
      return `${user}@`;
    }
  }
  inspect() {
    if (this.user === undefined && this.secret === undefined) return '';
    const user = this.user === undefined ? '' : encodeURIComponent(this.user);
    if (this.secret !== undefined) {
      const secret = encodeURIComponent(this.secret);
      return `${user}:${secret}@`
    }
    else {
      return `${user}@`;
    }
  }
}

export class URLSearch {
  constructor(str) {
    this._entries = [];
    if (str === undefined) {
      return;
    }
    if (str[0] === '?') {
      str = str.slice(1);
    }
    if (str.length === 0) return;
    const parts = str.split('&');
    for (const pair of parts) {
      if (pair === '') continue;
      const eq = pair.indexOf('=');
      if (eq === -1) {
        this._entries[this._entries.length] = {
          key: decodeURIComponent(pair),
          value: ''
        }
      }
      else {
        this._entries[this._entries.length] = {
          key: decodeURIComponent(pair.slice(0, eq)),
          value: decodeURIComponent(pair.slice(eq + 1))
        }
      }
    }
  }
  empty() {
    return this._entries.length === 0;
  }
  *entries(key) {
    for (const entry of this._entries) {
      yield entry;
    }
  }
  concat({key, value}) {
    return new URLSearch([...this.entries, {key,value}]);
  }
  toString() {
    const entries = this.entries();
    const {done,value} = entries.next();
    if (done) return '';
    else {
      let ret = '?';
      ret += `${encodeURIComponent(value.key)}=${encodeURIComponent(value.value)}`;
      for (const {key, value} of entries) {
        ret += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      return ret; 
    }
  }
  inspect() {
    return this.toString();
  }
}

export class URLPathname {
  constructor(str_or_arr) {
    let parts;
    if (typeof str_or_arr === 'undefined') {
      parts = []; 
    }
    else if (typeof str_or_arr === 'string') {
      parts = str_or_arr.split('/');
    }
    else if (Array.isArray(str_or_arr)) {
      parts = str_or_arr;
    }
    else {
      throw TypeError('Expected a String or Array');
    }
    for (const item of parts) {
      if (typeof item !== 'string') {
        throw TypeError('Expected a String');
      }
    }
    this._items = [...parts];
    this._notSplit = true;
    this._parts = null;
    this._notNormalized = true;
    this._normal = null;
  }
  empty() {
    if (this._notSplit) return this._items.length === 0;
    return this._parts.length === 0;
  }
  concat(...str) {
    const parts = this._notSplit ? this._items : this._parts;
    const ret = [...parts];
    for (const path of str) {
      if (typeof path !== 'string') throw new Error('Expected a String');
      if (path[0] === '/') {
        ret.length = 0;
      }
      ret[ret.length] = path;
    }
    const new_url = new URLPathname(ret);
    return new_url;
  }
  *entries() {
    if (this._notSplit) {
      if (this._items.length > 0) {
        this._parts = this._items.join('/').split('/');
      }
      else {
        this._parts = [];
      }
      this._notSplit = false;
      this._items = null;
    }
    for (const item of this._parts) {
      yield item;
    }
  }
  raw() {
    const entries = this.entries();
    let {done,value} = entries.next();
    if (done) {
      return '';
    }
    else {
      const ret = [value];
      for (const item of entries) {
        ret[ret.length] = item;
      }
      return ret.join('/');
    }
  }
  normalize() {
    if (this._notNormalized) {
      const entries = this.entries();
      let {done,value} = entries.next();
      if (done) {
        this._normal = '';
      }
      else {
        const ret = [value];
        for (const item of entries) {
          const prev = ret[ret.length - 1];
          if (item == '' || item == '.') {
            continue;
          }
          else if (item == '..' && ret.length > 0 && prev !== '..') {
            if (prev === '.') {
              ret[ret.length - 1] = '..';
            }
            else {
              ret.length -= 1;
            }
          }
          else {
            ret[ret.length] = item;
          }
        }
        this._normal = ret.join('/');
        if (this._normal === '') this._normal = '/';
      }
      this._notNormalized = false;
    }
    return this._normal;
  }
  // convert this path to a base path
  // this will remove *relative* pathing
  base() {
    return this.raw().replace(/^\/?(?:\.\.?(?:\/|$))+|^\//, '');
  }
  safer() {
    return new URLPathname(this.normalize()).base(); 
  }
  toString() {
    return this.raw();
  }
  inspect() {
    return this.raw();
  }
}
