const express = require("express");
const router = express.Router();
const collegeController = require('../controllers/collegeController');
const internController = require('../controllers/internController');
const { validatecollage } = require("../Middleware/valid");



router.post('/functionup/colleges', validatecollage, collegeController.createCollege);
router.post('/functionup/interns', internController.createIntern);
router.get('/functionup/collegeDetails', collegeController.getCollegedetail)


module.exports = router;