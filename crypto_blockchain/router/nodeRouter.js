const nodeController = require('../controller/nodeController');
const router = require("express").Router();

router.get('/allNode',nodeController.getNode);
router.get('/peerConnected',nodeController.peerConnected);
router.post('/nick',nodeController.postNick);
router.get('/nick',nodeController.getOnNick);
router.post('/nickOffline',nodeController.nickOffline);

module.exports = router;