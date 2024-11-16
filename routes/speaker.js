const express = require('express');
const { getAllSpeakers, turnOnSpeaker, turnOffSpeaker } = require('../controller/SpeakerController');

const router = express.Router();

router.get('/', getAllSpeakers);
router.put('/on/:id', turnOnSpeaker);
router.put('/off/:id', turnOffSpeaker);

module.exports = router;