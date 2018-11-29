const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');

//Define a schema
const Schema = mongoose.Schema;

const ProductModelSchema = new Schema({
	name: String,
	imageUrl: String,
	updateDate: {type: Date, default: Date.now},
	createdDate: {type: Date, default: Date.now}	
});

const SuggestModelSchema = new Schema({
	productId: { type: Schema.Types.ObjectId, ref: 'Product' },
	suggestProduct: ProductModelSchema,
	score: Number,
	updateDate: {type: Date, default: Date.now},
	createdDate: {type: Date, default: Date.now}		
})

const Product = mongoose.model('Product', ProductModelSchema);
const Suggest = mongoose.model('Suggest', SuggestModelSchema);

const fetch = (req, res) => {
  Product.find({}, (err, products) => {
    if(err) {
      res.sendStatus(404); 
    } else {
      res.json(products);
    }
  });
}

const create = (req, res) => {
  const item = {
    name: req.body['name'], 
    imageUrl: req.body['imageUrl']
  };	

	var product = new Product(item);
	var promise = product.save();

	promise.then((p) => {
	  res.json(p);
	})
	// promise.then((p) => {
	// 	Product.where('_id').ne(p._id)
	// 	.exec((products) => {

	// 	})
	// })
	// Product.create(item, (err, res) => {
	// 	if(err) {
	// 		callback(err, null);
	// 	} else {
	// 		callback(null, res);
	// 	}
	// });
}

const destroy = (req, res) => {
	const _id = req.params.id;
	Product.findOneAndRemove({_id: _id}, (err, product) => {
		if(err) {
			res.sendStatus(404);
		} else {
			res.json(product);
		}
	});
}

module.exports.create = create;
module.exports.fetch = fetch;
module.exports.destroy = destroy;

