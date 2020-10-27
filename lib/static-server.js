const mime  = require('mime');
const path  = require('path');
const fs    = require('fs');
const {URL} = require('url');
const cache = {};

module.exports = conf => (req, res) => async () => {
  function badrequest() {
    res.statusCode    = 409;
    res.statusMessage = 'Bad Request';
    return res.end(`Cannot ${req.method} ${req.url}`);
  }

  function notfound() {
    res.statusCode    = 404;
    res.statusMessage = 'Not Found';
    return res.end(`Cannot ${req.method} ${req.url}`);
  }

  async function serve(filename) {
    filename = path.normalize(filename);
    const stat = await new Promise(r => fs.stat(filename, (e,d) => r(d) ));
    if (!stat) return;
    if (!stat.isFile()) return;
    res.setHeader('Content-Type', mime.getType(filename.split('.').pop()));
    res.write((await new Promise(r => fs.readFile(filename, (e,d) => r(d) ))).toString('utf8'));
    res.end();
    return true;
  }

  if (req.method !== 'GET') return badrequest();

  // Build target path
  const basedir = path.normalize(conf.dir) + path.sep;
  const url     = new URL(req.url, `file://`);
  const target  = path.join(basedir, url.pathname);

  // Prevent non-public data access
  if ((!target) || (target.substr(0,basedir.length) !== basedir)) {
    return badrequest();
  }

  // Handle existing files
  if (await serve(target)) return;
  if (await serve(`${target}.htm`)) return;
  if (await serve(`${target}.html`)) return;
 
  // Handle indexes
  for(const index of conf.index) {
    if (await serve(`${target}/${index}`)) return;
  }

  // Handle fallback
  if (conf.fallback && (await serve(`${basedir}/${conf.fallback}`))) return;

  // No match, bail
  return notfound();
};
