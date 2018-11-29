const router = require('express').Router();
const controller = require('./db/index');

router.get('/api/products', controller.productFetch);
router.post('/api/products', controller.productCreate);
router.delete('/api/products/:id', controller.productDestroy);

module.exports = router;
