const conf = require('rc')('docman', {
  port    : 5000,
  dir     : `${__dirname}/public`,
  data    : 'data',
  fallback: `/index.html`,
  index   : [
    'index.html',
    'index.htm',
  ],
});

const app    = require('./lib/router')(conf);
app.db       = require('./lib/db')(conf.data);
app.uuidv4   = require('./lib/uuidv4');
app.template = require('./lib/template');

app.use(require('morgan')('tiny'));
app.use(require('body-parser').json());
require('./api')(app,'/api');

app.listen(conf.port, () => {
  console.log(`Listening on port ${conf.port}`);
});

