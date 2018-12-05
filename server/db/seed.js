const mongoose = require('mongoose');
const MongooseAutoIncrement  = require('mongoose-auto-increment-reworked');
const Promise = require('bluebird');
const fake = require('./../../libs/fake.js');
const ProductModel = require('./models/product.js');

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
	const generateProducts = () => {
		var products = [];		
		for(var i = 0; i < k; i++) {
			let product = dataGenerator();
			products.push(product);
		}
		return products;
	}
	for(var j = 0; j < e; j++) {		
		data.push(generateProducts);
	}
	return Promise.map(data, (products) => {
		return Product.insertMany(products()).then(() => {
			// console.log('inserted')
		})
	}, {
		concurrency: 1
	})
	.then(() => {
		return startTime;
	})
}

const seed = (n, k) => {
	insertProducts(n, k).then((startTime) => {
		const endTime = Date.now();
		console.log(`done inserted products from ${startTime} to ${endTime}, finished in ${(endTime - startTime) / (24 * 3600)} min`);
		process.exit();	
	});
}

// seed(100, 10)
seed(1000, 10);

// promise.then((db) => {
//   console.log('woohoo mongoose connected successfully');
// }).catch((err) => {
//   console.log('mongoose connection error, please make sure your mongodb is running.');  
// });

// var db = mongoose.connection;

