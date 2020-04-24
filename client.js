const riot = require('riot');
const app  = require('./component/app.riot');
const { Route, Router } = require('@riotjs/route');

// Register basic components
riot.register('app', app.component || app.default || app);
riot.register('route', Route);
riot.register('router', Router);

// Start our application
riot.mount('app');

