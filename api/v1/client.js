;(async factory => {
  if (('object' === typeof module) && ('exports' in module)) {
    module.exports = await factory({
      fetch: require('node-fetch'),
    });
  } else if ('object' === typeof window) {
    window.api = await factory({
      fetch: window.fetch,
    });
  }
})(({fetch}) => {
  const manifest = ${JSON.stringify(manifest)};
  return manifest.reduce((api,route) => {
    let ref    = api;
    const path = route.name.split('.');
    const last = path.pop();
    for(const token of path) {
      ref = ref[token] = ref[token] || {};
    }
    const method = route.method;
    ref[last] = params => {
      return fetch(route.path, {
        method : route.method,
        headers: 'GET' === route.method ? undefined : {'Content-Type':'application/json'},
        body   : params ? JSON.stringify(params) : undefined,
      }).then(response => response.json());
    };
    return api;
  }, {});
});
