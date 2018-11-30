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

const Product = mongoose.model('Product', ProductModelSchema);

const SuggestModelSchema = new Schema({
	productId: { type: Schema.Types.ObjectId, ref: 'Product' },
	suggestProduct: ProductModelSchema,
	score: Number,
	updateDate: {type: Date, default: Date.now},
	createdDate: {type: Date, default: Date.now}		
})

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
	  //res.json(p);
	  var _query = Product.where('_id').ne(p._id);
	  var q = _query.exec();
	  return q.then((result) => {
		  return {
		  	newProduct: p,
		  	products: result
		  };	  	
	  })
	})
	.then((result) => {
		let newProduct = result.newProduct;
		let products = result.products;
		var promisesSuggestions = [];
		for (var i = 0; i < products.length; i++) {
			let _product = products[i];
			let score = stringSimilarity.compareTwoStrings(_product['name'], newProduct['name']);
			let _suggestion1 = new Suggest({
				productId: newProduct._id,
				score: score,
				suggestProduct: _product
			});

			let _suggestion2 = new Suggest({
				productId: _product._id,
				score: score,
				suggestProduct: newProduct
			}); 
			var suggestion1 = _suggestion1.save();
			var suggestion2 = _suggestion2.save();			
			promisesSuggestions.push(suggestion1);
			promisesSuggestions.push(suggestion2);
		}
		return promisesSuggestions;
	})
	.then((suggestions) => {
		Promise.all(suggestions).then(() => {
			res.json({'msg': 'done'});
		})
	});
}

const destroy = (req, res) => {
	const _id = req.params.id;
	Suggest.deleteMany({productId: {$in: [_id]}}, () =>{
		Suggest.deleteMany({'suggestProduct._id': {$in: [_id]}}, () => {
			Product.findOneAndRemove({_id: _id}, (err, product) => {
				if(err) {
					res.sendStatus(404);
				} else {
					res.json(product);
				}
			});
		})
	})
}

const destroyAll = (req, res) => {
	Product.deleteMany({}, () => {
		Suggest.deleteMany({}, () => {
			res.json({'msg': 'Delete all'});
		})
	})
}

module.exports.Suggest = Suggest;
module.exports.create = create;
module.exports.fetch = fetch;
module.exports.destroy = destroy;
module.exports.destroyAll = destroyAll;
