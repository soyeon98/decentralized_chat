const serverController = require('../controller/serverController');
const router = require("express").Router();

router.get('/startNode/:id',serverController.startNode);
router.get('/stopNode/:id',serverController.stoptNode);

module.exports = router;