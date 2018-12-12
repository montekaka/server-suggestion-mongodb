const mongoose = require('mongoose');
const MongooseAutoIncrement  = require('mongoose-auto-increment-reworked');
const Promise = require('bluebird');
const fake = require('./../../libs/fake.js');
const ProductModel = require('./models/product.js');
const stringSimilarity = require('string-similarity');

const dataGenerator = fake.generator;
const partition = fake.partition;

const mongoDB = 'mongodb://127.0.0.1/mongo_product_suggestion';
const promise = mongoose.connect(mongoDB);
const MongooseAutoIncrementID = MongooseAutoIncrement.MongooseAutoIncrementID;

const Product = ProductModel.Product;
const Suggest = ProductModel.Suggest;

const insertProducts = (n , k) => {
	const e = n / k;
	const data = [];
	const startTime = Date.now();

	const generateProducts = (batch_number) => {
		var products = [];		
		for(var i = 0; i < k; i++) {
			let id = i + 1 + batch_number * k;
			let product = dataGenerator(id);
			products.push(product);
		}
		return products;
	}

	for(var j = 0; j < e; j++) {		
		data.push(generateProducts);
	}

	return Promise.map(data, (products, idx) => {
		return Product.insertMany(products(idx)).then(() => {
			// console.log('inserted');
		})
	}, {
		concurrency: 4
	})
	.then(() => {
		return startTime;
	})
}

insertSuggestions = (totalProducts, numberOfSuggestProduct, numberOfSuggestionsPerProduct) => {
	//Product.findAll({offset: 0 , limit: 1})
	// randomly pick 10000 products, and create 30 suggestions for each of them.

	var productRandFrom = Math.floor(Math.random() * Math.floor(totalProducts/2));
	var suggestionRandFrom = suggestionRandFrom + Math.floor(Math.random() * Math.floor(totalProducts/10));
	var bulk = [];

	return Product.find().skip(productRandFrom).limit(numberOfSuggestProduct).then((products) => {
		return Product.find().skip(suggestionRandFrom).limit(numberOfSuggestionsPerProduct).then((suggestions) => {
			products.forEach((product) => {
				var name = product['name'];
				var id = product['_id'];
				suggestions.forEach((suggestProduct) => {
					let _name = suggestProduct['name'];
					let _id = suggestProduct['_id'];
					if(_id !== id) {
						let score = stringSimilarity.compareTwoStrings(_name, name);
						bulk.push({ ProductId: id, suggestProduct: suggestProduct, score: score });
					}
				})

			})
			return true;
		})
	}).then(() => {
		return bulk;
	})
	.then((productSuggestions) => {
		return partition(productSuggestions, 100);
	})
	.then((productSuggestions) => {
		return Promise.map(productSuggestions, (suggestions) => {
			return Suggest.insertMany(suggestions);
		}, {
			concurrency: 10
		})
	}).then(() => {
		return true;
	})
}

const seed = (totalProducts, k, numberOfSuggestProduct, numberOfSuggestionsPerProduct) => {
	insertProducts(totalProducts, k).then((startTime) => {
		const endTime = Date.now();
		console.log(`done inserted products from ${startTime} to ${endTime}, finished in ${(endTime - startTime) / (24 * 3600)} min`);
		insertSuggestions(totalProducts, numberOfSuggestProduct, numberOfSuggestionsPerProduct)
		.then(() => {
			let suggestionEndTime = Date.now();
			console.log(`done inserted suggestions ${suggestionEndTime}`);
			process.exit();	
		})		
	});
}

// seed(100, 10)
seed(10000000, 10000, 10000, 30);

// promise.then((db) => {
//   console.log('woohoo mongoose connected successfully');
// }).catch((err) => {
//   console.log('mongoose connection error, please make sure your mongodb is running.');  
// });

// var db = mongoose.connection;

