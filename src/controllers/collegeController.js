const collegeModel = require('../models/collegeModel');
const internModel = require('../models/internModel');

const createCollege = async function(req, res) {
    try {
        let saveData = await collegeModel.create(req.body);
        res.status(201).send({ status: true, msg: saveData });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


//--------------------------------------get Collegedatail----------------------------------------------------

const getCollegedetail = async function(req, res) {
    try {
        const collegeName = req.query.collegeName;
        if (!collegeName) {
            return res.status(400).send({ status: false, msg: "please Provide College Name" })
        }

        const findCollege = await collegeModel.findOne({ name: collegeName, isDeleted: false });
        if (!findCollege) {
            return res.status(404).send({ status: false, msg: "msg: college Not Found" });
        }
        const collegeId = findCollege._id
        const findIntern = await internModel.find({ collegeId: collegeId, isDeleted: false }).select({ name: 1, email: 1, mobile: 1 })
        if (!findIntern) {
            return res.status(404).send({ status: false, msg: "no interest found for this college" })
        }
        const findCollegeData = {
            "name": findCollege.name,
            "fullName": findCollege.fullName,
            "logoLink": findCollege.logoLink,
            "interests": findIntern

        }
        return res.status(200).send({ status: true, data: findCollegeData });

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }

};

module.exports = { createCollege, getCollegedetail };