const mongoose = require('mongoose');
const axios = require('axios');
const Promise = require('bluebird');

const base_url = 'http://localhost:4202';
const ProductModel = require('./models/product.js');
const SuggestModel = require('./models/suggest.js');
const productSample = ProductModel.sample;
const suggestSample = SuggestModel.sample;
const mongoDB = 'mongodb://127.0.0.1/mongo_product_suggestion';
const promise = mongoose.connect(mongoDB);

const getProducts = (numberOfReqs, range) => {
	const baseUrl = base_url+'/api/products?page=';
	let urls = [];

	for(var i = 0; i < numberOfReqs; i++) {
		let k = Math.floor(Math.random() * Math.floor(range));
		urls.push(baseUrl+k);
	}
	
	return Promise.map(urls, (url) => {
		return axios.get(url)
	}, {
		concurrency: 1
	})
	.then(() => {
		return true;
	});
}

const getProduct = (numberOfReqs, range) => {
	const baseUrl = base_url+'/api/products/';
	return productSample(100000, numberOfReqs).then((data) => {
		const urls = data.map(x => baseUrl+x);
		return Promise.map(urls, (url) => {
			return axios.get(url);
		}, {
			concurrency: 1
		})
	}).then(() => {
		return true;
	})

}

getProductSuggestions = (numberOfReqs, range) => {
  const baseUrl = base_url+'/api/products/';
  return suggestSample(10000, numberOfReqs).then((data) => {
    const urls = data.map(x => baseUrl+x+'/suggestions');
    return Promise.map(urls, (url) => {
      return axios.get(url);
    }, {
      concurrency: 1
    })
  }).then(() => {
    return true;
  })
}
// const getProductSuggestions = (numberOfReqs, range) => {
//   const baseUrl = base_url+'/api/products/';
  
// 	let urls = [];

// 	for(var i = 0; i < numberOfReqs; i++) {
// 		let k = Math.floor(Math.random() * Math.floor(range));
// 		urls.push(baseUrl+k);
// 	}

// 	return Promise.map(urls, (url) => {
// 		return axios.get(url+'/suggestions')
// 	}, {
// 		concurrency: 1
// 	})
// 	.then(() => {
// 		return true;
// 	});
// }


getProducts(1000, 10000).then(() => {
	getProduct(1000, 1000000)
	.then(() => {
		getProductSuggestions(100, 10000).then(() => {
      console.log('done suggestion')
    });
	})
})