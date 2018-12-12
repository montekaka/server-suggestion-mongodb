const faker = require('faker');
const _ = require('underscore');

const randomImgUrl = 'https://picsum.photos/200/200/?image=';

function generator(id) {
  const randomNum = Math.floor(Math.random() * 1000) + 1;
  const randomName = faker.commerce.productName();
  return {
    name: randomName,
    imageUrl: randomImgUrl+randomNum
  }	
}

function partition(items, size) {
  var result = _.groupBy(items, function(item, i) {
      return Math.floor(i/size);
  });
  return _.values(result);
}

exports.generator = generator;
exports.partition = partition;


