const mongoose = require('mongoose');
const MongooseAutoIncrement  = require('mongoose-auto-increment-reworked');
const Promise = require('bluebird');
const fake = require('./../../libs/fake.js');
const ProductModel = require('./models/product.js');
const stringSimilarity = require('string-similarity');

const dataGenerator = fake.generator;

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
			console.log('inserted');
		})
	}, {
		concurrency: 4
	})
	.then(() => {
		return startTime;
	})
}

insertSuggestions = (totalProducts, numberOfSuggestProduct, numberOfSuggestionsPerProduct) => {
	const offsets = [];
	while(offsets.length < numberOfSuggestProduct) {
		let k = Math.floor(Math.random() * Math.floor(totalProducts));
		if(offsets.includes(k) === false) {
			offsets.push(k);
		}
	}

	return Promise.map(offsets, (idx) => {
		let k = Math.floor(Math.random() * Math.floor(totalProducts));
		return Product.find().limit(1).skip(idx).then((product) => {
			let name = product[0]['name'];
			let id = product[0]['id'];
			return Product.find().limit(numberOfSuggestionsPerProduct).skip(k)
			.then((suggestProducts) => {
				var bulk = [];
				suggestProducts.forEach((suggestProduct) => {
					let _name = suggestProduct['name'];
					let _id = suggestProduct['id'];
					if(_id !== id) {
						let score = stringSimilarity.compareTwoStrings(_name, name);
						bulk.push({ productId: id, suggestProduct: suggestProduct, score: score });
					}
				});
				Suggest.insertMany(bulk).then(() => {
					console.log('inserted suggestions')
				})
			});			
		})
	}, {
		concurrency: 10
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
			console.log('done inserted suggestions');
			process.exit();	
		})		
	});
}

// seed(100, 10)
seed(10000, 1000, 100, 30);

// promise.then((db) => {
//   console.log('woohoo mongoose connected successfully');
// }).catch((err) => {
//   console.log('mongoose connection error, please make sure your mongodb is running.');  
// });

// var db = mongoose.connection;

