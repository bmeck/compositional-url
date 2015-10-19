A URL library written to abstract protocol and non-protocol (base) URLs in a generic manner.

Resolution table

|Start URL Type|Resolution URL Type|Result Type|
|---|---|---|
|Protocol|Protocol Relative|Protocol|
|Protocol Relative|Protocol|Protocol|
|Base|Protocol|ERROR|
|Base|Protocol Relative|ERROR|
|Protocol Relative|Base|Protocol Relative|
|Protocol|Base|Protocol|
|Protocol|Protocol|Protocol|
|Protocol Relative|Protocol Relative|Protocol Relative|
|Base|Base|Base|

## Usecase: reduce pathname to safer form

```
// create a new url
// first normalize the url (combine . and .. parts)
// second remove . and .. prefixes 
// shorthand for url.withPathname(url.pathname.normalize().base());
url.withPathname(url.pathname.safer());
```

# ComposableURL

Container type for all the parts of a URL. It has a lossless `.toString` function which is used for safe combinations of URLs via `.resolve(otherURL)`. The properties of this type are compatible with `url.parse` from node's standard library. By default the `.toString` will not include the auth information to help avoid leaks, use `.toString(true)` to show the auth information as well.

Has the properties:

```
String   .protocol
URLAuth  .auth
String   .hostname
Number   .port
URLPath  .pathname
URLQuery .search
String   .hash
Boolean  .isProtocolRelative // computed from other properties
```

Has the methods:

```
ComposableURL .withProtocol(String protocol);
ComposableURL .withAuth(URLAuth auth);
ComposableURL .withHostname(String hostname);
ComposableURL .withPort(Number port);
ComposableURL .withPathname(Number port);
ComposableURL .withPathname([String,URLPathname] path);
ComposableURL .withSearch([String,URLSearch] search);
ComposableURL .withHash(String hash);
String        .toString(Boolean showAuth);
```

Example:

```javascript
const URL= require('compositional-url').URL;
const url = new URL('google.com');
// change the protocol since it is protocol relative
require('https').request(url.resolve('https:'));
require('http').request(url.resolve('http:'));
```

# URLAuth

Simple container for user and secret parts of a URL. `.toString` *will* show the values of this if called against this type directly.

```javascript
const URL= require('compositional-url').URL;
const URLAuth = require('compositional-url').URLAuth;
const url = new URL('google.com');
require('https').request(url.withAuth(new URLAuth('user','secret')));
``` 

Has the properties: 

```
String .user
String .secret
```

Has the methods:

```
Boolean .empty();
```

# URLPathname

Simple structure to lazily construct url paths as needed. This will attempt to put off combining path components as much as possible. It also will not normalize by default so `.` and `..` will stay preserved unless normalization is explicitly requested.

```javascript
const URL= require('compositional-url').URL;
const URLPathname = require('compositional-url').URLPathname;
const url = new URL('google.com');
require('https').request(url.withPathname(new URLPathname('.','..','..','f')));
``` 

Has the methods:

```
Boolean     .empty();
URLPathname .concat(String... components);
*String     .entries();
String      .raw();

// combines `.` and `..`s as possible while keeping the pathname
// base, relative, or absolute
String .normalize();

// removes any relative prefixing (`.`s and/or `..`s) from
// beginning of the pathname.
String .base();
```

# URLSearch

Structure to allow lossless url search parameters. This allows for duplicate keys etc.

```javascript
const URL= require('compositional-url').URL;
const URLSearch = require('compositional-url').URLSearch;
const url = new URL('google.com');
require('https').request(url.withSearch(new URLSearch('?a=b&a=c')));
``` 

Has the methods:

```
Boolean                     .empty();
URLSearch                   .concat({String key,String value} entry);
*{String key, String value} .entries();
```
