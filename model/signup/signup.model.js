var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
var md5 = require('md5');
const datatype = require.main.require('../routes/datatype.js');
const crypto = require('crypto');

/* Start Signup */
exports.save_team = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var teamname = datatype.strtolower(req.body.teamname);
        var email = datatype.strtolower(req.body.email);
        var password = md5(req.body.password);
        var type = datatype.int(req.body.type);
        var gender = req.body.gender;                            
        var age_range = datatype.int(req.body.age_range);
        var country_id = datatype.int(req.body.country_id);
        var state_id = datatype.int(req.body.state_id);
        var city_id = datatype.int(req.body.city_id);
        var currenttime = components.moment("Y-M-D H:m:s");
        var otp = components.generateCode(5,"numbers");
        var token_id = components.generateCode(50);
        var subjectmessage = otp+' is your play to conquer OTP';
        var message_details = {otp:otp, otp_title:"signup OTP", fullname:teamname}
        var ip_address = req.ip;
        var sport_id = req.body['sport_id[]'];
        var add_sports = ""; 
        var team_id = "";
        if(sport_id != undefined && sport_id != "" && sport_id != null){
            var sport_id = Array.from(new Set(sport_id));//remove duplicate values
            if(Array.isArray(sport_id) && components.onlyNumbers(sport_id)){
                if(sport_id.length<6){

                    if(gender === "m" || gender === "f" || gender === "o" || gender === "a"){

                        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE email = ? LIMIT 1",{ replacements: [email] });
                        if(data != ""){//check already exist
                            res.status(200).json({status:false, message:"Email already exist, try with different email id!"});
                        }else{
                            //find country
                            const [results, dataCountry] = await sequelize.query("SELECT id FROM countries WHERE id = ? LIMIT 1",{ replacements: [country_id] });
                            if(dataCountry != ""){

                                //find state
                                const [results, dataState] = await sequelize.query("SELECT id FROM states WHERE id = ? AND country_id = ? LIMIT 1",{ replacements: [state_id,country_id]});
                                if(dataState != ""){

                                    //find city
                                    const [results, dataCity] = await sequelize.query("SELECT id FROM cities WHERE id = ? AND state_id = ? LIMIT 1",{ replacements:[city_id,state_id]});
                                    if(dataCity != ""){

                                        // Start of add team sports in team sports table
                                        for(var sportscount = 0; sportscount < sport_id.length; sportscount++){
                                            var findSport_id = sport_id[sportscount];
                                            if(findSport_id != "0"){
                                                const [results, dataSport] = await sequelize.query("SELECT id,name FROM sports WHERE id = ? AND status = 1 LIMIT 1",{ replacements:[findSport_id]});
                                                if(dataSport!=""){
                                                    var addsp_id = dataSport[0].id;
                                                    add_sports += dataSport[0].name+",";
                                                }
                                            }
                                        }
                                        // End of add team sports in team sports table
                                        
                                        //start save data
                                        await sequelize.query("INSERT INTO teams (`teamname`,`email`,`password`,`type`,`age_range`,`gender`,`sports_list`,`otp`,`register_date`,`country_id`,`state_id`,`city_id`,`ip_address`,`token_id`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",{ replacements:[teamname,email,password,type,age_range,gender,add_sports,otp,currenttime,country_id,state_id,city_id,ip_address,token_id]}).then(function(resultdata) {
                                            if(resultdata[0] != undefined && resultdata[0] != null && resultdata[0] != ""){
                                                team_id = resultdata[0];
                                                //send OTP to clients
                                                components.sendMail(email,subjectmessage,message_details);
                                            }
                                        });
                                        
                                        if(team_id!=""){
                                            // Start of add team sports in team sports table
                                            for(var sportscount = 0; sportscount < sport_id.length; sportscount++){
                                                var findSport_id = sport_id[sportscount];
                                                if(findSport_id != "0"){
                                                    const [results, dataSport] = await sequelize.query("SELECT id,name FROM sports WHERE id = ? AND status = 1 LIMIT 1",{ replacements:[findSport_id]});
                                                    if(dataSport!=""){
                                                        var addsp_id = dataSport[0].id;
                                                        await sequelize.query("INSERT INTO teams_sports (team_id,sport_id) VALUES (?,?)",{ replacements:[team_id,addsp_id]});
                                                    }
                                                }
                                            }
                                            // End of add team sports in team sports table
                                        }
                                        res.status(200).json({status:true, message:"team Register successfully, Please verify OTP send on email "+email+"!"});
                                        // end save data

                                    }else{
                                        res.status(200).json({status:false, message:"City not found!"}); 
                                    }
                                }else{
                                    res.status(200).json({status:false, message:"State not found!"}); 
                                }
                            }else{
                                res.status(200).json({status:false, message:"Country not found!"}); 
                            }
                        }
                    }else{
                        res.status(422).json({status:false, message:"Please select correct gender!"});
                    }
                }else{
                    res.status(422).json({status:false, message:"Please add only 5 sports!"});
                }
            }else{
                res.status(422).json({status:false, message:"Sport id must be array and integer value!"});
            }
        }else{
            res.status(422).json({status:false, message:"Sport id cannot be empty!"});
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}

/* End of Signup */

/* Send Signup OTP Start */
exports.validateOTP = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.query.email);
        var otp = req.query.otp;

        const [results, data] = await sequelize.query("SELECT id,otp_verify,otp FROM teams WHERE email = ? LIMIT 1",{replacements:[email]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Email not found, please signup!"});
        }else{
            if(data[0].otp_verify == "1"){
                res.status(200).json({status:false, message:"OTP already verified!"});
            }else{
                if(data[0].otp == otp){
                    await sequelize.query("UPDATE teams SET otp_verify = 1, status = 1 WHERE email = ?",{replacements:[email]});
                    res.status(200).json({status:true, message:"OTP verified successfully!"});
                }else{
                    res.status(200).json({status:false, message:"OTP is incorrect, try again!"});
                }
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Send Signup OTP End */


/* Resend Signup OTP Start */
exports.resendOTP = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.query.email);

        const [results, data] = await sequelize.query("SELECT id,otp_verify,status,teamname FROM teams WHERE email = ? LIMIT 1",{replacements:[email]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Email not found, please signup!"});
        }else{

            if(data[0].otp_verify == "0" && data[0].status == "0"){
                //send OTP to clients 
                var otp = components.generateCode(5,"numbers");
                var subjectmessage = otp+' is your play to conquer resend OTP';
                var teamname = data[0].teamname;
                var message_details = {otp:otp, otp_title:"resend OTP", fullname:teamname}
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


/* Resend Signup OTP Email Verify Start */
exports.resendOTPEmailVerify = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.query.email);

        const [results, data] = await sequelize.query("SELECT id,otp_verify,status FROM teams WHERE email = ? LIMIT 1",{replacements:[email]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Email not found, please signup!"});
        }else{
            if(data[0].otp_verify != "0" && data[0].status != "0"){
                res.status(200).json({status:false, message:"This email already verified!", redirect:1});
            }else{
                res.status(200).json({status:false, message:"This email not verified!", redirect:0});    
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Resend Signup OTP Email Verify End */


/* Start of data deletion with Facebook */


// Function to decode base64 URL
function base64UrlDecode(input) {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('binary');
}

// Function to parse the signed request
function parseSignedRequest(signedRequest) {
    if(signedRequest != ""){
      const [encodedSig, payload] = signedRequest.split('.', 2);

      const secret = "29f06fe9f867090b1cb6a8be58f821d1"; // Use your app secret here

      const sig = Buffer.from(encodedSig, 'base64');
      const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest();

      if (!crypto.timingSafeEqual(sig, expectedSig)) {
        console.error('Bad Signed JSON signature!');
        return null;
      }

      const data = JSON.parse(base64UrlDecode(payload));
      return data;
    }
}


exports.datadeletionfacebook = async function (req, res){ 
    try{

        const signedRequest = req.body.signed_request;
        const data = parseSignedRequest(signedRequest);
      
        if (!data) {
            res.status(400).json({ error: 'Bad Signed JSON signature' });
            return;
        }

        const userId = data.user_id;

        // Start data deletion process
        const statusUrl = 'https://www.<your_website>.com/deletion?id=abc123'; // URL to track the deletion
        const confirmationCode = 'abc123'; // unique code for the deletion request

        const responseData = {
            url: statusUrl,
            confirmation_code: confirmationCode
        };

        res.json(responseData);

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* End of signup with Facebook */