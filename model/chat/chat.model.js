var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* chat Start */
exports.chat_list = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        var offset = req.body.offset;
        var searchteamTrim = req.body.search;

        if(searchteamTrim !== null && searchteamTrim !== "" && searchteamTrim !== undefined && components.preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z ]$",searchteamTrim) === false){
            var searchteam = (searchteamTrim).trim();
        }

        var whereCondition = "";
        //Filter team by name
        if(searchteam !== "" && searchteam !== null && searchteam !== undefined){ whereCondition = " WHERE opponent_team_name LIKE '%"+searchteam+"%' ";}
        
            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                const [resultsTotalMessages, totalRecordsMessages] = await sequelize.query("SELECT 1 FROM (SELECT IF(pm.`team_id`=?,ps.`teamname`,p.`teamname`) AS opponent_team_name FROM `teams_msg` pm INNER JOIN  `teams_challenges` pc ON pc.id = pm.`challenges_id` INNER JOIN `teams` p ON p.id = pm.`team_id` INNER JOIN `teams` ps ON ps.id = pm.`opponent_id` INNER JOIN `sports` s ON pc.`sport_id` = s.`id` WHERE accept_status != 2 AND accept_status != 3 AND (pm.`team_id` = ? OR pm.`opponent_id` = ?) AND pc.block = 0 GROUP BY challenges_id) AS t "+whereCondition,{replacements:[team_id,team_id,team_id,team_id,team_id]});
                const [results, teamsMessages] = await sequelize.query("SELECT * FROM (SELECT pm.`challenges_id`,pm.`date`,pm.`notification`, SUM(IF(pm.opponent_id = ?,IF(pm.`seen`=0,1,0),0)) AS total_messages, (SELECT pmg.msg FROM `teams_msg` pmg WHERE id = MAX(pm.id)) AS last_msg,(SELECT IF(ppm.team_id=?,'you','') FROM `teams_msg` ppm WHERE id = MAX(pm.id)) AS sent_by,s.`name` AS sportname,IF(pm.`team_id`=?,ps.`teamname`,p.`teamname`) AS opponent_team_name FROM `teams_msg` pm INNER JOIN  `teams_challenges` pc ON pc.id = pm.`challenges_id` INNER JOIN `teams` p ON p.id = pm.`team_id` INNER JOIN `teams` ps ON ps.id = pm.`opponent_id` INNER JOIN `sports` s ON pc.`sport_id` = s.`id` WHERE accept_status != 2 AND accept_status != 3 AND (pm.`team_id` = ? OR pm.`opponent_id` = ?) AND pc.block = 0 GROUP BY challenges_id) AS t "+whereCondition+" LIMIT "+limit+" OFFSET "+offset,{replacements:[team_id,team_id,team_id,team_id,team_id]});
                if(teamsMessages!=""){
                    var count_team = teamsMessages.length;
                    var total_records_messages = totalRecordsMessages.length;
                    res.status(200).json({status:true, result:teamsMessages, total_records:total_records_messages, total:count_team, message:"teams messages found successfully!"});
                }else{
                    res.status(200).json({status:true, result:"",total_records:0, total:0, message:"No any teams challenges messages found!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* chat End */


/* chat message Start */
exports.chat_message = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        if(limit === undefined || limit === '' || limit === null){limit=10;}
        var offset = req.body.offset;
        if(offset === undefined || offset === '' || offset === null){offset=0;}

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var challenge_id = req.body.challenge_id;
                var teamsMessagesReverse = "";
                const [resultsOpponentName, opponentName] = await sequelize.query("SELECT s.name AS sports_name, IF(pc.team_id="+team_id+",(SELECT teamname FROM teams p WHERE id = pc.`opponent_id`),(SELECT teamname FROM teams p WHERE id = pc.`team_id`)) AS opponent_name, IF(pc.team_id="+team_id+",(SELECT token_id FROM teams p WHERE id = pc.`opponent_id`),(SELECT token_id FROM teams p WHERE id = pc.`team_id`)) AS opponent_token_id, IF(pc.team_id="+team_id+",(SELECT teamname FROM teams p WHERE id = pc.`team_id`),(SELECT teamname FROM teams p WHERE id = pc.`opponent_id`)) AS my_name FROM `teams_challenges` pc INNER JOIN sports s on s.id = pc.sport_id WHERE pc.id = ? AND (pc.team_id = ? OR pc.opponent_id = ?) AND accept_status IN (0,1) ",{replacements:[challenge_id,team_id,team_id]});
                const [resultsChat, chatMessages] = await sequelize.query("SELECT 1 FROM `teams_msg` pm INNER JOIN `teams_challenges` pc ON pc.`id` = pm.`challenges_id` WHERE pm.challenges_id = ? AND (pm.team_id = ? OR pm.opponent_id = ?) AND accept_status IN (0,1) ",{replacements:[challenge_id,team_id,team_id]});
                const [results, teamsMessages] = await sequelize.query("SELECT IF(pm.`team_id` = "+team_id+",'you','opponent') AS sent_by, (SELECT p.`profile_img` FROM teams p WHERE id = pm.`team_id`) AS profile_img, (SELECT teamname FROM teams p WHERE id = pm.`team_id`) AS send_name, pm.`msg`, pm.`date`, pm.`seen` FROM `teams_msg` pm INNER JOIN `teams_challenges` pc ON pc.`id` = pm.`challenges_id` WHERE pm.challenges_id = ? AND (pm.team_id = ? OR pm.opponent_id = ?) AND accept_status IN (0,1) ORDER BY pm.id ASC LIMIT "+limit+" OFFSET "+offset+"",{replacements:[challenge_id,team_id,team_id]});
                if(teamsMessages!=""){
                    var total_records_chat = chatMessages.length;
                    var count_message = teamsMessages.length;
                    res.status(200).json({status:true,total_records:total_records_chat, total:count_message, result:teamsMessages, opponent_details:opponentName, message:count_message+" teams messages found!"});
                }else{
                    res.status(200).json({status:false, result:"",message:"No any teams challenges messages found!"});
                }

                //update message notification
                await sequelize.query("UPDATE teams_msg SET notification = 1 WHERE challenges_id = ? AND opponent_id = ? AND notification = 0",{replacements:[challenge_id,team_id]});
                //End of update message notification

                //update message seen
                await sequelize.query("UPDATE teams_msg SET seen = 1 WHERE challenges_id = ? AND opponent_id = ? AND seen = 0",{replacements:[challenge_id,team_id]});
                //End of update message seen
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* chat Message End */


/* Send message Start */
exports.send_messages = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var challenge_id = req.body.challenge_id;
                var message = req.body.message;
                var currenttime = components.moment("Y-M-D H:m:s");

                const [results, teamsMessages] = await sequelize.query("SELECT id,team_id,opponent_id FROM teams_challenges pc WHERE id = ? AND (team_id = ? OR opponent_id = ?) AND accept_status IN (0,1) AND pc.block = 0",{replacements:[challenge_id,team_id,team_id]});
                if(teamsMessages!=""){
                    var team_id_msg = teamsMessages[0].team_id;
                    var opponent_id_msg = teamsMessages[0].opponent_id;
                    if(team_id == team_id_msg){var opponent_id = opponent_id_msg;}else{var opponent_id = team_id_msg;}
                    //update message seen
                    await sequelize.query("INSERT INTO teams_msg (challenges_id,team_id,opponent_id,msg,date) VALUES (?,?,?,?,?)",{replacements:[challenge_id,team_id,opponent_id,message,currenttime]});
                    //End of update message seen
                    res.status(200).json({status:true, result:"message sent successfully"});
                }else{
                    res.status(200).json({status:true, result:"",message:"No any teams challenges found!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* send Message End */


/* message count start */
exports.message_count = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;

                const [results, teamsNotification] = await sequelize.query("SELECT SUM(notification) AS new_message_count FROM (SELECT 1 AS notification FROM `teams_msg` pm INNER JOIN `teams_challenges` pc ON pm.challenges_id = pc.id WHERE pm.notification = 0 AND pm.opponent_id = ? GROUP BY pm.challenges_id) AS t",{replacements:[team_id]});
                if(teamsNotification!=""){
                    var new_message_count = teamsNotification[0].new_message_count;
                    res.status(200).json({status:true, result:new_message_count, message:"messages notification count found successfully!"});
                }else{
                    res.status(200).json({status:false, result:"",message:"No any teams challenges found!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}    
/* message count ends */


/* update message count start */
exports.update_message_count = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                const [results, teamsNotification] = await sequelize.query("UPDATE `teams_msg` SET notification = 1 WHERE notification = 0 AND opponent_id = ?",{replacements:[team_id]});
                if(teamsNotification!=""){
                    res.status(200).json({status:true, result:"", message:"messages notification count updated successfully!"});
                }else{
                    res.status(200).json({status:false, result:"",message:"No any teams challenges found!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}    
/* update message count ends */