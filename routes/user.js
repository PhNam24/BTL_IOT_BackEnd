const express = require('express');
const { login, register, getAllUser } = require('../controller/UserController');

const router = express.Router();

router.get('/', getAllUser);
router.post('/login', login);
router.post('/register', register);

module.exports = router;