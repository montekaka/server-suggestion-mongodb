const mongoose = require('mongoose');
const Promise = require('bluebird');
const MongooseAutoIncrement  = require('mongoose-auto-increment-reworked');
const stringSimilarity = require('string-similarity');

//Define a schema
const Schema = mongoose.Schema;
const MongooseAutoIncrementID = MongooseAutoIncrement.MongooseAutoIncrementID;

const ProductModelSchema = new Schema({
	name: String,
	imageUrl: String,
	updateDate: {type: Date, default: Date.now},
	createdDate: {type: Date, default: Date.now}	
});

// ProductModelSchema.plugin(MongooseAutoIncrementID.plugin, {modelName: 'Product'});

const Product = mongoose.model('Product', ProductModelSchema);

const SuggestModelSchema = new Schema({
	productId: String,
	suggestProduct: ProductModelSchema,
	score: Number,
	updateDate: {type: Date, default: Date.now},
	createdDate: {type: Date, default: Date.now}		
})

// SuggestModelSchema.plugin(MongooseAutoIncrementID.plugin, {modelName: 'Suggest'});

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

const get = (req, res) => {
	const id = req.params.id;
  const pageNumber = req.query.page ? Number(req.query.page) : 0;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

	if (id) {
		Product.findOne({_id: id}, (err, product) => {
	    if(err) {
	      res.sendStatus(404); 
	    } else {
	      res.json(product);
	    }			
		});
	} else {
		Product.find({}).skip(pageNumber * limit).limit(limit).then((products) => {
			res.set({
				'currentPage': pageNumber,
				limit: limit
			});
			res.json(products);
		}).catch((err) =>{
			console.log(err)
		})	
	}
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
	// .then(() => {
	// 	res.sendStatus(202);
	// })
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

const getSuggestions = (req, res) => {
	// 5c0c48ba4e68e0649a5f6b2b
	const id = req.params.id;
  const pageNumber = req.query.page ? Number(req.query.page) : 0;
  const limit = req.query.limit ? Number(req.query.limit) : 10;	

  Suggest.find({productId: id}).skip(pageNumber * limit).limit(limit).then((products) => {
			res.set({
				'currentPage': pageNumber,
				limit: limit
			});  	
			res.json(products);
	}).catch((err) =>{
		console.log(err)
	});
}

const sampleOne = (total_count) => {
	const random = Math.floor(Math.random() * total_count);	
	return Product.findOne().skip(random);
}

const sample = (total_count, N) => {
	let samples = [];
	var result = [];

	for (var i = 0; i < N; i++) {
		samples.push(sampleOne);
	}

	return Promise.map(samples, (fn) => {
		return fn(total_count).then((data) => {
			result.push(data._id);
		})
	}).then(() => {
		return result;
	});
}

module.exports.Product = Product;
module.exports.Suggest = Suggest;
module.exports.create = create;
module.exports.fetch = fetch;
module.exports.get = get;
module.exports.getSuggestions = getSuggestions;
module.exports.destroy = destroy;
module.exports.destroyAll = destroyAll;
module.exports.sample = sample;
