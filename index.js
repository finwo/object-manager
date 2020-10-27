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

const app = require('./lib/router')(conf);

app.use(require('morgan')('tiny'));
app.use(require('body-parser').json());

app.listen(conf.port, () => {
  console.log(`Listening on port ${conf.port}`);
});

