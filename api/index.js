module.exports = (app, prefix) => {
  require('./v1')(app,`${prefix}/v1`);
};
