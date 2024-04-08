var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');
const fs = require('fs');
const md5 = require('md5');


/* Profile Basic Details Start */
exports.view_profile_team_basic = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        const [results, data] = await sequelize.query("SELECT id,token_id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{ replacements: [auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var teamTokenId = data[0].token_id;
            var opponentTokenId = req.body.token_id;
            if(opponentTokenId == "" || opponentTokenId == null || opponentTokenId == undefined){
                var findteam = teamTokenId;
            }else{
                var findteam = opponentTokenId;
            }
            const [results, datateam] = await sequelize.query("SELECT p.teamname,p.profile_img FROM teams p WHERE token_id = ? AND STATUS = 1 LIMIT 1",{ replacements: [findteam]});
            if(datateam != ""){//check already exist
                res.status(200).json({status:true, result:datateam, message:"Profile view successfully!"});
            }else{
                res.status(200).json({status:false, message:"team not found, please try again!"});
            }
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Profile Basic Details end */

/* Profile Start */
exports.view_profile_team = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        const [results, data] = await sequelize.query("SELECT id,token_id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{ replacements: [auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var teamId = data[0].id;
            var teamTokenId = data[0].token_id;
            var opponentTokenId = req.body.token_id;
            if(opponentTokenId == "" || opponentTokenId == null || opponentTokenId == undefined){
                var findteam = teamTokenId;
                var myEmail = "p.email,";
            }else{
                var findteam = opponentTokenId;
                var myEmail = "";
            }
            const [results, datateam] = await sequelize.query("SELECT p.teamname,"+myEmail+"p.gender,p.type,tt.name AS team_type_name,p.age_range,ar.name AS age_range_name,p.register_date,p.profile_img,p.sports_list,p.matches,p.won,p.draw,c.name AS country_name,p.country_id,s.name AS state_name,p.state_id,ct.name AS city_name,p.city_id,p.token_id,IF(p.account_deactive=1,'yes','no') AS account_deactive,(SELECT COALESCE((SELECT 1 FROM `block` WHERE `team_id` = ? AND `opponent_id` = p.id),0)) AS block FROM teams p INNER JOIN `countries` c ON c.`id` = p.`country_id` INNER JOIN `states` s ON s.`id` = p.`state_id` INNER JOIN `cities` ct ON ct.`id` = p.city_id INNER JOIN `team_type` tt ON tt.id = p.type INNER JOIN `age_range` ar ON ar.id = p.age_range WHERE p.token_id = ? AND p.status = 1 LIMIT 1",{ replacements: [teamId,findteam]});
            if(datateam != ""){//check already exist
                res.status(200).json({status:true, result:datateam, message:"Profile view successfully!"});
            }else{
                res.status(200).json({status:false, message:"Team not found, please try again!"});
            }
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Profile end */

/* Profile Sports Start */
exports.view_profile_team_sports = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        const [results, data] = await sequelize.query("SELECT id,token_id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{ replacements: [auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
        	var teamId = data[0].id;
            var teamTokenId = data[0].token_id;
            var opponentTokenId = req.body.token_id;
            if(opponentTokenId == "" || opponentTokenId == null || opponentTokenId == undefined){
                var findteam = teamTokenId;
            }else{
                var findteam = opponentTokenId;
            }
            const [results, datateam] = await sequelize.query("SELECT ps.`sport_id`,s.name FROM `teams_sports` ps INNER JOIN sports s ON ps.sport_id = s.id WHERE ps.`team_id` = ? and ps.`status` = 1",{ replacements: [teamId]});
            if(datateam != ""){//check already exist
                res.status(200).json({status:true, result:datateam, message:"Profile Sports view successfully!"});
            }else{
                res.status(200).json({status:false, message:"Team not found, please try again!"});
            }
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* Profile Sports end */


/* Profile Start */
exports.profile_team = async function (req, res){ 

    try{
        res.setHeader('Content-Type','application/json');
        var imgfilename = req.file.filename;
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        const [results, data] = await sequelize.query("SELECT id,profile_img FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{ replacements: [auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var id = data[0].id;
            var old_profile_img = data[0].profile_img;
            if(old_profile_img!="" && old_profile_img != null){
                var imagesFolder = "./images/"+old_profile_img;
                fs.unlinkSync(imagesFolder);
            }
            await sequelize.query("UPDATE teams SET profile_img = ? WHERE id = ?",{ replacements: [imgfilename,id]});
            res.status(200).json({status:true, message:"Profile update successfully!"});
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}
/* Profile end */



/* Start edit profile */
exports.edit_profile = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var teamname = datatype.strtolower(req.body.teamname);
        var country_id = datatype.int(req.body.country_id);
        var state_id = datatype.int(req.body.state_id);
        var city_id = datatype.int(req.body.city_id);
        var gender = datatype.strtolower(req.body.gender);
        var type = datatype.int(req.body.type);
        var gender = req.body.gender;                            
        var age_range = datatype.int(req.body.age_range);
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];
        var add_sports = "";
        var sport_id = req.body['sport_id[]'];
        if(sport_id != undefined && sport_id != "" && sport_id != null){
            var sport_id = Array.from(new Set(sport_id));//remove duplicate values
            if(Array.isArray(sport_id) && components.onlyNumbers(sport_id)){
                if(sport_id.length<6){
                    const [results, dataCountry] = await sequelize.query("SELECT id FROM countries WHERE id = ? LIMIT 1",{ replacements:[country_id]});
                    if(dataCountry != ""){
                        const [results, dataState] = await sequelize.query("SELECT id FROM states WHERE id = ? AND country_id = ? LIMIT 1",{ replacements:[state_id,country_id]});
                        if(dataState != ""){
                            const [results, dataCity] = await sequelize.query("SELECT id FROM cities WHERE id = ? AND state_id = ? LIMIT 1",{ replacements:[city_id,state_id]});
                            if(dataCity != ""){
                                //start update data
                                const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{ replacements:[auth_token]});
                                if(data != "" && data[0].id != ""){//check already exist
                                    var team_id = data[0].id;

                                    //Start of delete team old sports 
                                    await sequelize.query("DELETE FROM teams_sports WHERE team_id = ?",{ replacements:[team_id]});
                                    //end of delete team old sports

                                    // Start of add team sports in team sports table
                                    for(var sportscount = 0; sportscount < sport_id.length; sportscount++){
                                        var findSport_id = sport_id[sportscount];
                                        if(findSport_id != "0"){
                                            const [results, dataSport] = await sequelize.query("SELECT id,name FROM sports WHERE id = ? AND status = 1 LIMIT 1",{ replacements:[findSport_id]});
                                            if(dataSport!=""){
                                                var addsp_id = dataSport[0].id;
                                                add_sports += dataSport[0].name+",";
                                                await sequelize.query("INSERT INTO teams_sports (team_id,sport_id) VALUES (?,?)",{ replacements:[team_id,addsp_id]});
                                            }
                                        }
                                    }
                                    // End of add team sports in team sports table

                                    //Start update team details
                                    await sequelize.query("UPDATE teams SET `teamname` = ?, `type` = ?,`gender`= ?, `age_range` = ?,`country_id` = ?,`state_id` = ?, `city_id` = ?, sports_list = ? WHERE id = ?",{replacements:[teamname,type,gender,age_range,country_id,state_id,city_id,add_sports,team_id]});
                                    res.status(200).json({status:true, message:"Team details updated successfully!"});
                                    //End update team details

                                }else{
                                    res.status(200).json({status:false, message:"No team found!"});
                                }
                                //end of update data
                            }else{
                                res.status(422).json({status:false, message:"City not found!"}); 
                            }
                        }else{
                            res.status(422).json({status:false, message:"State not found!"}); 
                        }
                    }else{
                        res.status(422).json({status:false, message:"Country not found!"}); 
                    }
	                
                }else{
                    res.status(422).json({status:false, message:"Sport id must be array and integer value!"});
                }
            }else{
                res.status(422).json({status:false, message:"Please add only 5 sports!"});
            }
        }else{
            res.status(422).json({status:false, message:"Sport id cannot be empty!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* End of edit profile */

/* edit email start */

exports.edit_profile_email = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.body.email);
        var otp = components.generateCode(5,"numbers");
        var subjectmessage = otp+' is your Play to Conquer OTP';
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];
        var currenttime = components.moment("Y-M-D H:m:s");
        
        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE email = ? LIMIT 1",{ replacements:[email]});
        if(data != "" && data[0].id != ""){//check already exist
            res.status(200).json({status:false, message:"Email already exist, try with different email id!"});
        }else{
            const [results, data] = await sequelize.query("SELECT id,teamname FROM teams WHERE jwt_token = ? AND account_deactive = 0 LIMIT 1",{replacements:[auth_token]});
            //send OTP to clients 
            var id = data[0].id;
            var teamname = data[0].teamname;
            if(id != "" && id != null){
                await sequelize.query("UPDATE teams SET new_email = ?,otp = ?,last_update = ?,update_email = 1 WHERE id = ?",{replacements:[email,otp,currenttime,id]});
                var message_details = {otp:otp, otp_title:"change email", fullname:teamname}
                components.sendMail(email,subjectmessage,message_details);
                res.status(200).json({status:true, message:"Please verify OTP send on email "+email+"!"});
            }
        }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}

/* edit email end */


/* edit verify email start */

exports.verify_profile_email = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var email = datatype.strtolower(req.body.email);
        var otp = req.body.otp;
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE email = ? LIMIT 1",{replacements:[email]});
        if(data == ""){//check already exist

            const [results, data] = await sequelize.query("SELECT id,new_email,otp,update_email FROM teams WHERE jwt_token = ? AND account_deactive = 0 LIMIT 1",{replacements:[auth_token]});
            if(data != "" && data[0].id != ""){//check already exist
                var team_id = data[0].id;
                if(data[0].update_email == "1"){
                    if(data[0].new_email === email){
                        if(data[0].otp == otp){
                            await sequelize.query("UPDATE teams SET update_email = 0, email = ?, last_update = ? WHERE id = ?",{replacements:[email,currenttime,team_id]});
                            res.status(200).json({status:true, message:"New email id updated successfully!"});
                        }else{
                            res.status(200).json({status:false, message:"OTP is incorrect, try again!"});
                        }
                    }else{
                        res.status(200).json({status:false, message:"New email does not match with request change email, try again!"});
                    }
                }else{
                    res.status(200).json({status:false, message:"Please request change email!"});
                }
            }
        }else{
            res.status(200).json({status:false, message:"Email already exist, please try with another email id!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* edit verify email end */

/* start Profile change password */

exports.change_profile_password = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var old_password = md5(req.body.old_password);
        var new_password = req.body.new_password;
        var confirm_password = req.body.confirm_password;
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id,password FROM teams WHERE jwt_token = ? AND account_deactive = 0 LIMIT 1",{replacements:[auth_token]});
            if(data != ""){//check already exist
                var current_password = data[0].password;
                var team_id = data[0].id;
                var update_password = md5(new_password);
                if(current_password === old_password){
                    if(new_password === confirm_password){
                        await sequelize.query("UPDATE teams SET password = ?, last_update = ? WHERE id = ?",{replacements:[update_password,currenttime,team_id]});
                        res.status(200).json({status:true, message:"New password updated successfully!"});
                    }else{
                        res.status(200).json({status:false, message:"New password does not match with confirm password!"});
                    }
                }else{
                    res.status(200).json({status:false, message:"Old password is incorrect, please try again!"});
                }
            }else{
                res.status(200).json({status:false, message:"team not found, please try again!"});
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End Profile change password */


/* start Profile account setting */

exports.change_profile_account_setting = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var account_setting = req.body.account_setting;
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id,account_deactive FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
        if(data != ""){//check already exist
            var account_deactive = data[0].account_deactive;
            var team_id = data[0].id;
            if(account_deactive != account_setting){
                await sequelize.query("UPDATE teams SET account_deactive = ?, deactive_date = ? WHERE id = ?",{replacements:[account_setting,currenttime,team_id]});
            }
            res.status(200).json({status:true, message:"Account setting updated successfully!"});
        }else{
            res.status(200).json({status:false, message:"team not found, please try again!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End Profile account setting */
