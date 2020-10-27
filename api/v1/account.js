const createError = require('http-errors');

module.exports = (app, prefix) => {
  return [
    {
      method: 'GET',
      name  : 'account.getAll',
      path  : `${prefix}`,
      async handler() {
        return 'Dinges';
      },
    },
    {
      method: 'GET',
      name  : 'account.get',
      path  : `${prefix}/:id`,
      async handler() {

      },
    },
    {
      method: 'POST',
      name  : 'account.create',
      path  : `${prefix}`,
      async handler() {

      },
    },
  ]
};
