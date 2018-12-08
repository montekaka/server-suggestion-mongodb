//Import the mongoose module
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/mongo_product_suggestion';
const ProductModel = require('./models/product.js');
const SuggestModel = require('./models/suggest.js');

const promise = mongoose.connect(mongoDB);

promise.then((db) => {
  console.log('woohoo mongoose connected successfully');
}).catch((err) => {
  console.log('mongoose connection error, please make sure your mongodb is running.');  
});

var db = mongoose.connection;

module.exports.productCreate = ProductModel.create;
module.exports.productFetch = ProductModel.fetch;
module.exports.productGet = ProductModel.get;
module.exports.productDestroy = ProductModel.destroy;
module.exports.productDestroyAll = ProductModel.destroyAll;
module.exports.suggestFetch = SuggestModel.fetch;
