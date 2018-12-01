const router = require('express').Router();
const controller = require('./db/index');

router.get('/api/products', controller.productFetch);
router.post('/api/products', controller.productCreate);
router.delete('/api/products/:id', controller.productDestroy);
router.delete('/api/products', controller.productDestroyAll);
router.get('/api/suggestions', controller.suggestFetch);

module.exports = router;
