const Suggest = require('./product.js').Suggest;
const _ = require('underscore');

const fetch = (req, res) => {
  Suggest.find({}, (err, items) => {
    if(err) {
      res.sendStatus(404); 
    } else {
      res.json(items);
    }
  });
}

const sampleOne = (total_count) => {
  const random = Math.floor(Math.random() * total_count);	
  return Suggest.findOne().skip(random);
}

const sample = (total_count, N) => {
  let samples = [];
  var result = [];

  for (var i = 0; i < N; i++) {
    samples.push(sampleOne);
  }

  return Promise.map(samples, (fn) => {
    return fn(total_count).then((data) => {
      result.push(data.productId);
    })
  }).then(() => {    
    return _.uniq(result);
  });
}

module.exports.fetch = fetch;
module.exports.sample = sample;
