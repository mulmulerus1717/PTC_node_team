var express = require('express');
var router = express.Router();

//Middleware
const { 
    validationRules, 
    validateProfile,
    validationRulesViewProfile,
    editEMailValidationRules,
    verifyEMailValidationRules,
    changePasswordValidationRules, 
    changeAccountSettingValidationRules } = require.main.require('../middleware/profile/profile.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var profileModel = require.main.require('../model/profile/profile.model.js');

const path = require("path");

const checkFileType = function (req, file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    const fileSize = parseInt(req.headers['content-length']);
    
    if(fileSize > 2000000){
        req.fileValidationError = 'Cannot upload more than 2MB!';
        cb(new Error('max size'))
    }else if (!mimeType && !extName) {
        req.fileValidationError = 'You can Only Upload Images!';
        cb(new Error('file incorrect'))
    }else{
        return cb(null, true);
    }

};

    /* Start profile Form. */
    const multer = require('multer')
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './images/')
        },
        filename: (req, file, cb) => {
            cb(null , `${Date.now()}${file.originalname}`);
        }
    })

    const upload = multer({ 
        storage: storage, 
        limits: { fileSize: 2000000 },
        fileFilter: (req, file, cb) => {
            checkFileType(req, file, cb);
        },
    })

    router.post('/', upload.single('file'), validationRulesToken(), validateProfile, function (req, res, error) {
        try {
            var errors = new Array();
            if(req.file == "" || req.file == undefined){
                errors[0] = {"profile_img":"Please upload profile image!"};
            }
            if(errors != ""){
                res.status(422).json({status:false, errors:errors});
            }else{
                profileModel.profile_team(req, res);
            }
        }catch(err) {
          res.sendStatus(400);
        }
    })
    /* Ends profile Form. */

    /* Start View Profile Form */
    router.get('/view_profile_basic', validationRulesToken(), validationRulesViewProfile(), validateProfile, function(req, res, next) {
        profileModel.view_profile_team_basic(req, res);
    });
    /* End View Profile Form */

    /* Start View Profile Form */
    router.post('/view_profile', validationRulesToken(), validationRulesViewProfile(), validateProfile, function(req, res, next) {
        profileModel.view_profile_team(req, res);
    });
    /* End View Profile Form */

    /* Start View Profile Sports */
    router.get('/view_profile_sports', validationRulesToken(), validationRulesViewProfile(), validateProfile, function(req, res, next) {
        profileModel.view_profile_team_sports(req, res);
    });
    /* End View Profile Start */

    /* Start Profile Form */
    router.post('/edit_profile', validationRulesToken(), validationRules(), validateProfile, function(req, res, next) {
        profileModel.edit_profile(req, res);
    });
    /* End Profile Form */

    /* Start Profile Edit Email */
    router.post('/edit_profile_email', validationRulesToken(), editEMailValidationRules(), validateProfile, function(req, res, next) {
        profileModel.edit_profile_email(req, res);
    });
    /* End Profile Edit Email */

    /* Start Profile Edit Email */
    router.post('/verify_profile_email', validationRulesToken(), verifyEMailValidationRules(), validateProfile, function(req, res, next) {
        profileModel.verify_profile_email(req, res);
    });
    /* End Profile Edit Email */

    /* Start Profile Change Password */
    router.post('/change_profile_password', validationRulesToken(), changePasswordValidationRules(), validateProfile, function(req, res, next) {
        profileModel.change_profile_password(req, res);
    });
    /* End Profile Change Password */

    /* Start Profile Change Account Settings */
    router.post('/change_profile_account_setting', validationRulesToken(), changeAccountSettingValidationRules(), validateProfile, function(req, res, next) {
        profileModel.change_profile_account_setting(req, res);
    });
    /* End Profile Change Account Settings */


module.exports = router;