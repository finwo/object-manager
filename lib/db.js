const uuidv4 = require('./uuidv4');
const level  = require('level');
const sub    = require('subleveldown');
const hook   = require('level-hookdown');
const noop   = ()=>{};

const idx = db => {
  const ddb = hook(sub(db, 'dat', {valueEncoding:'json'}));
  const idb = {};
  const fac = {};

  ddb.ensureIndex = (name, factory) => {
    idb[name] = sub(db, `idx-${name}`, {valueEncoding:'json'});
    fac[name] = factory;
    ddb.prehooks.push((operation, cb) => {
      cb();
      if (operation.type !== 'put') return;
      fac[name](operation.key, operation.value, async iv => {
        const found = (await new Promise(r=>idb[name].get(iv, (e,d)=>r(d)))) || {};
        found[operation.key] = true;
        idb[name].put(iv, found);
      });
    });
  };

  ddb.getBy = (name, key, cb) => {
    if (!(name in idb)) return cb(new Error(`Index '${name}' does not exist`));
    idb[name].get(key, async (err, ids) => {
      if (err && (err.name !== 'NotFoundError')) return cb(err);
      let data = await Promise.all((Object.keys(ids||{})).map((id,i) => new Promise(r => {
        ddb.get(id, (err, record) => r({id,record}));
      })));
      for(const entry of data) {
        const iv = await new Promise(r => fac[name](entry.id, entry.record, r));
        if (iv != key) delete ids[entry.id];
      }
      idb[name].put(key, ids||{});
      cb(undefined, data.map(e => e.record));
    });
  };

  return ddb;
};

const push = db => {
  db.push = (value, cb) => {
    const uuid = uuidv4();
    db.put(uuid, value, e => (cb||noop)(e,uuid));
  };
  return db;
};

module.exports = dir => {
  let db = push(idx(level(dir)));

  db.ensureIndex('account-email', (key, value, emit) => {
    if (value.type !== 'account') return;
    if (value.email === undefined) return;
    emit(value.email);
  });

  return db;
};
