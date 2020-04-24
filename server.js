const argv      = require('minimist')(process.argv.slice(2));
const express   = require('express');
const autolevel = require('autolevel');
const sublevel  = require('sublevel');
const lucene    = require('lucene-filter')(require('lucene'));

const ontologies = {
  as      : require('@ontologies/as'),
  dc      : require('@ontologies/dcelems'),
  dcterms : require('@ontologies/dcterms'),
  dcmi    : require('@ontologies/dctype'),
  foaf    : require('@ontologies/foaf'),
  ld      : require('@ontologies/ld'),
  owl     : require('@ontologies/owl'),
  prov    : require('@ontologies/prov'),
  rdf     : require('@ontologies/rdf'),
  rdfs    : require('@ontologies/rdfs'),
  schema  : require('@ontologies/schema'),
  shacl   : require('@ontologies/shacl'),
  skos    : require('@ontologies/skos'),
  xsd     : require('@ontologies/xsd'),
};

argv.port = argv.port || process.env.PORT || 8080;
argv.db   = argv.db   || argv.database    || process.env.DATABASE_URL || 'dir://data/';

const app      = express();
const db       = { root: autolevel(argv.db) };
db.attachments = sublevel(db.root, 'attachments');
db.objects     = sublevel(db.root, 'objects');

function randomCharacter(alphabet)  {
  alphabet = alphabet || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet.charAt(Math.floor(Math.random()*alphabet.length));
}

db.genId = async alphabet => {
  let result = '';
  while(result.length < 4) {
    result += randomCharacter(alphabet);
  }
  do {
    try {
      db.root.get(result);
      result += randomCharacter(alphabet);
    } catch(e) {
      break;
    }
  } while(true);
  return result;
};

app.use(require('compression')());
app.use(express.static(__dirname+'/public'));

const api = express.Router();

// Listing available ontologies
api.get('/ontologies', (req, res) => {
  res.json(ontologies);
});
api.get('/ontologies/:vocabulary', (req, res) => {
  res.json(ontologies[req.params.vocabulary || ''] || {});
});

// Search objects
api.get('/objects/search', async (req, res) => {
  let limit  = req.query.limit || 10;
  let output = [];
  let filter = lucene(req.query.q || '*');

  db.objects.createReadStream()
    .on('data', function(data) {
      if (output.length >= limit) {
        this.close();
        return;
      }
      if (filter(data.value)) {
        output.push(data.value);
      }
    })
    .on('close', () => {
      res.json(output);
    })
});

app.use('/api', api);

// All non-caught urls go to the index
app.use((req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(__dirname+'/public/index.html');
    return;
  }
  next();
});
app.listen(argv.port, () => {
  console.log('listening on 0.0.0.0:'+argv.port);
});
