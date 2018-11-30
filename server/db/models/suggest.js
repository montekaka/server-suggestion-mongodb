const Suggest = require('./product.js').Suggest;

const fetch = (req, res) => {
  Suggest.find({}, (err, items) => {
    if(err) {
      res.sendStatus(404); 
    } else {
      res.json(items);
    }
  });
}

module.exports.fetch = fetch;
