const static = require('./static-server');
const Router = require('router');
const noop   = ()=>{};


module.exports = conf => {
  const router       = Router();
  const finalHandler = static(conf);
  router.listen = (port, cb) => {
    const server = require('http').createServer((req, res) => {
      router(req, res, finalHandler(req, res));
    });
    server.listen(port, cb||noop);
    return server;
  };
  return router;
};
