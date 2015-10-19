const URL = require('.').ComposableURL;
const URLAuth = require('.').URLAuth;
const URLPathname = require('.').URLPathname;
console.log();
const prel_url = new URL('//');
const http_url = new URL('http:');
const https_url = new URL('http:');
{
  const protocol_url = new URL('//google.com:777');
  // change the protocol since it is protocol relative
  console.log(`protocol relative urls can resolve against protocols`);
  console.log(`${protocol_url} resolves ${http_url} to`);
  console.log(protocol_url.resolve(http_url).toString());
  console.log(`${protocol_url} resolves ${https_url} to`);
  console.log(protocol_url.resolve(https_url).toString());
  console.log(`${http_url} resolves ${protocol_url} to`);
  console.log(http_url.resolve(protocol_url).toString());
  console.log(`${https_url} resolves ${protocol_url} to`);
  console.log(https_url.resolve(protocol_url).toString());
  
  // anything with a auth, hostname, or port is protocol relative if
  // no protocol is specified
  const blank = new URL();
  console.log(`urls become protocol relative once auth, hostname, or port are specified (since they are part of protocol specifics)`);
  console.log('blank url after given a username')
  console.log(blank.withAuth(new URLAuth('bmeck',undefined)).toString(true))
  console.log('blank url after given a password')
  console.log(blank.withAuth(new URLAuth(undefined,'taco')).toString(true))
  console.log('blank url after given a username and password')
  console.log(blank.withAuth(new URLAuth('bmeck','taco')).toString(true))
  console.log('blank url after given a hostname')
  console.log(blank.withHostname('google.com').toString(true))
  console.log('blank url after given a port')
  console.log(blank.withPort(80).toString(true))
}
{
  // cannot force protocol onto non-protocol urls
  // assumption is the protocol was explicitly left off
  const host_url = new URL('google.com');
  console.log(`${host_url} cannot be given a protocol since it is not protocol relative`);
  try {
    host_url.resolve('http:');
    process.exit(1);
  }
  catch (e) {
  }
  // can do the inverse
  console.log(`However, you can use a protocol url and resolve against that`);
  console.log(`${http_url} resolves ${host_url} to`);
  console.log(http_url.resolve(host_url).toString());
  console.log(`${https_url} resolves ${host_url} to`);
  console.log(https_url.resolve(host_url).toString());

  // can check and convert to protocol relative easily
  if (host_url.isProtocolRelative === false) {
    const rel_host_url = prel_url.resolve(host_url);
    console.log('protocol urls can be converted to protocol relative easily');
    console.log(`${http_url} resolves ${prel_url} to`);
    console.log(http_url.resolve(rel_host_url).toString());
    console.log(`${https_url} resolves ${prel_url} to`);
    console.log(https_url.resolve(rel_host_url).toString());
  }
}
{
  const host_for_path_url = new URL('//google.com');
  const base_path_url = new URL('a/./b/../c');
  const rel_path_url = new URL('./d/./e/../f');
  const root_path_url = new URL('/g/./h/../j');
  const escape_path_url = new URL('./../h');
  
  // normalized relative urls stay relative
  console.log('relative urls stay relative even after normalization');
  console.log(`${rel_path_url} normalizes to`)
  console.log(rel_path_url.pathname.normalize())

  console.log(`${escape_path_url} normalizes to`)
  console.log(escape_path_url.pathname.normalize())

  // when resolving against a url with protocol
  {
    console.log(`when resolving against protocol urls, paths are not implicitly normalized, so '.' and '..' is preserved, but paths do become absolute`);
    // relative urls become root, but stay raw
    console.log(`${host_for_path_url} resolves ${rel_path_url} to`);
    console.log(host_for_path_url.resolve(rel_path_url).toString());
    // base urls become root
    console.log(`${host_for_path_url} resolves ${base_path_url} to`);
    console.log(host_for_path_url.resolve(base_path_url).toString());
    // root urls stay root
    console.log(`${host_for_path_url} resolves ${root_path_url} to`);
    console.log(host_for_path_url.resolve(root_path_url).toString());
  }
}
