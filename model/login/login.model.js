var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
var md5 = require('md5');
const datatype = require.main.require('../routes/datatype.js');
const { jwt } = require.main.require('../routes/require.js');

/* Login Start */
exports.login_team = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.body.email);
        var password = md5(req.body.password);
        
        const [results, data] = await sequelize.query("SELECT id,password FROM teams WHERE email = ? AND status = 1 LIMIT 1",{ replacements: [email]});
        if(data != ""){//check email exist
            if(data[0].password === password){//match password
                var team_id = data[0].id;
                var user = {
                    email,
                    team_id,
                    password
                }
                var token = jwt.sign({user},'KT9@6!11O',{expiresIn:'3600s'},(err,token)=>{//3600s valid for 1 hour
                    if(err){
                        res.status(200).json({status:false, message:"Token cannot create, please try again!"});
                    }else{
                        var currenttime = components.moment("Y-M-D H:m:s");
                        //update last login
                        sequelize.query("UPDATE teams SET last_login = ?, jwt_token = ? WHERE email = ?",{ replacements: [currenttime,token,email]});
                        //last login updated
                        res.status(200).json({ status:true, token:token, message:"Login success, Token will expired after 1 hour!" });
                    }
                });
            }else{
                res.status(200).json({status:false, message:"Password is incorrect!"});
            }
        }else{
            res.status(200).json({status:false, message:"Email does not exist!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}
/* Login end */

/* Forget password */
exports.forget_password = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.body.email);
        const [results, data] = await sequelize.query("SELECT id,teamname FROM teams WHERE email = ? AND status = 1 LIMIT 1",{replacements: [email]});
        if(data != "" && data[0].id != ""){//check email exist
            var otp = components.generateCode(5,"numbers");
            await sequelize.query("UPDATE teams SET forget_password = 1,otp = ? WHERE email = ?",{replacements: [otp,email]});
                //send OTP to clients 
                var subjectmessage = otp+' is your Play to Conquer forgot password OTP';
                var teamname = data[0].teamname;
                var message_details = {otp:otp, otp_title:"resend OTP", fullname:teamname}
                components.sendMail(email,subjectmessage,message_details);

                res.status(200).json({status:true, message:"OTP sent on your email "+email});
        }else{
            res.status(200).json({status:false, message:"Email id not exist!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* end forget password */


/* Change password OTP */
exports.change_password = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var md5 = require('md5');
        var email = datatype.strtolower(req.body.email);
        var otp = req.body.otp;
        var new_password = md5(req.body.new_password);
        const [results, data] = await sequelize.query("SELECT id,otp,forget_password FROM teams WHERE email = ? AND status = 1 LIMIT 1",{replacements: [email]});
        if(data != "" && data[0].id != ""){//check email exist
            if(data[0].forget_password != "1"){
                res.status(200).json({status:false, message:"Please request forget password!"});
            }else if(data[0].otp == otp){
                await sequelize.query("UPDATE teams SET forget_password = 0, password = ? WHERE email = ?",{replacements:[new_password,email]});
                //last login updated
                res.status(200).json({status:true, message:"Password Changed successfully!"});
                
            }else{
                res.status(200).json({status:false, message:"Incorrect OTP!"});
            }
        }else{
            res.status(200).json({status:false, message:"Email id not exist!"});
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* end change password OTP */



/* Resend Signup OTP Start */
exports.resendOTP = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.query.email);

        const [results, data] = await sequelize.query("SELECT id,forget_password,status,firstname,lastname FROM teams WHERE email = ? LIMIT 1",{replacements:[email]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Email not found, please signup!"});
        }else{

            if(data[0].forget_password == "1" && data[0].status == "1"){
                //send OTP to clients 
                var otp = components.generateCode(5,"numbers");
                var subjectmessage = otp+' is your play to conquer forgot password resend OTP';
                var fullname = data[0].firstname + " " + data[0].lastname;
                var message_details = {otp:otp, otp_title:"forgot password resend OTP", fullname:fullname}
                components.sendMail(email,subjectmessage,message_details);
                
                //update new otp
                await sequelize.query("UPDATE teams SET otp = ? WHERE email = ?",{replacements:[otp,email]});
                res.status(200).json({status:true, message:"OTP resend on "+email});
            }else{
                res.status(200).json({status:false, message:"This email already verified!"});    
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Resend Signup OTP End */
