const internModel = require("../models/internModel");
const collegeModel = require("../models/collegeModel");


const createIntern = async function(req, res) {
    try {
        let data = req.body;

        let intern = await internModel.find(data)

        if (intern.length != 0) {
            return res.status(409).send({ status: false, message: "That student are already applied for internship(please provide another name)." })
        }
        // name validation
        if (!data.name) {
            return res.status(400).send({ status: false, msg: " Please enter name for the internship (Required Field)" });
        }

        let match = (!/^([a-zA-Z]+)$/.test(data.name))
        if (!match) {
            return res.status(400).send({ status: false, msg: "Please enter a valid name" });
        }

        //mobile  validation
        if (!data.mobile) {
            return res.status(400).send({ status: false, msg: " Please enter mobile for the internship(Required Field)" });
        }

        let mob = /^[0-9]{10}$/.test(data.mobile);
        if (!mob) {
            return res.status(400).send({ status: false, msg: "please enter valid mobile number" });
        }

        // mobile duplication check
        let mobiledb = await internModel.findOne({ mobile: data.mobile }, { mobile: 1, _id: 0 });
        if (mobiledb) {
            return res.status(400).send({ status: false, msg: "We are sorry; this mobile is already registered" });
        }

        //email validation
        if (!data.email) {
            return res.status(400).send({ status: false, msg: " Please enter email for the internship (Required Field)" });

        }
        let check = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            data.email
        );
        if (!check) {
            return res.status(400).send({ status: false, msg: " Please enter valid emailid" });
        }
        if (!(data.email === String(data.email).toLowerCase())) {
            return res.status(400).send({ status: false, msg: "Capital letters are not allowed in emailid" });
        }

        // email duplication check
        let emaildb = await internModel.findOne({ email: data.email }, { email: 1, _id: 0 });
        if (emaildb) {
            return res.status(400).send({ status: false, msg: "We are sorry; this email is already registered" });
        }
        if (!data.collegeName) {
            return res.status(400).send({ status: false, msg: "please enter college name" });
        }
        let collegeData = await collegeModel.find({ name: data.collegeName }).select({ _id: true })

        if (collegeData.length == 0) {
            return res.status(404).send({ status: false, msg: "Requested college doesn't exist." })
        }

        let internData = await internModel.create({ name: data.name, email: data.email, mobile: data.mobile, collegeId: collegeData[0] });
        let name = internData.name;
        let email = internData.email;
        let mobile = internData.mobile;
        let collegeId = internData.collegeId._id;
        let isDeleted = internData.isDeleted;

        let allData = { isDeleted, name, email, mobile, collegeId }

        res.status(201).send({ status: true, data: allData });

    } catch (err) {
        res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
};

module.exports.createIntern = createIntern;