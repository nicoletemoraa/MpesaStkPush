const express = require('express');
const mainController =require('../controllers/mainController');
const router =express.Router();


router.get("/lipa-na-mpesa", mainController.index);
router.get("/lipa-na-mpesa-callback", mainController.lipaNaMpesaOnlineCallback);

module.exports=router;






