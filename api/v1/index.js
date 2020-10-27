const err = require('http-errors');
const fs  = require('fs');

module.exports = (app, prefix) => {

  // Build manifest
  const manifest = [
    ...require('./account')(app, `${prefix}/account`),
  ];

  // Render client
  const client = app.template.render(fs.readFileSync(`${__dirname}/client.js`), { manifest });

  // Output the api manifest
  app.get(`${prefix}/manifest.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(manifest));
    res.end();
  });

  // Output built client
  app.get(`${prefix}/client.js`, (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.write(client);
    res.end();
  });

  // Handle manifest routing
  manifest.forEach(route => {
    app[route.method.toLowerCase()](route.path, async (req, res) => {
      const response = await route.handler({
        ...req.body,
        ...req.params,
        req, res
      });
      if (err.isHttpError(response)) {
        res.statusCode    = response.statusCode;
        res.statusMessage = response.status;
        res.write(response.message || response.status);
        return res.end();
      }
      if ('string' === typeof response) {
        res.setHeader('Content-Type', 'text/html');
        res.write(response);
        return res.end();
      }
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(undefined === response ? null : response));
      res.end();
    });
  });
};
