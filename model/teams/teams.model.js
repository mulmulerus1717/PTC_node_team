var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* Receive challenge */
exports.receive_challenge = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        var offset = req.body.offset;

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [resultsChallenges, challenges_total] = await sequelize.query("SELECT 1 FROM `team_players` pc INNER JOIN `players` p ON pc.`player_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.status = 0 AND pc.team_id = ? AND p.`status` = 1 AND s.`status` = 1",{replacements:[team_id]});
            const [results, teams_challenges] = await sequelize.query("SELECT pc.id AS team_player_id,p.firstname,p.lastname,p.gender,p.age,p.token_id,p.`profile_img`,p.matches,p.won,p.draw,s.name AS sport_name,(SELECT GROUP_CONCAT(IF(pkc.won=p.id && pkc.draw=0,'W',IF(pkc.draw=1,'D','L'))) FROM players_challenges pkc WHERE (pkc.player_id = p.id OR pkc.opponent_id = p.id) and pkc.accept_status = 1 AND (pkc.won != 0 or pkc.draw != 0) ORDER BY pkc.id DESC LIMIT 5) as last_matches FROM `team_players` pc INNER JOIN `players` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.status = 0 AND pc.team_id = ? AND p.`status` = 1 AND s.`status` = 1 ORDER BY pc.id DESC LIMIT "+limit+" OFFSET "+offset+"",{replacements:[team_id]});
            if(teams_challenges!=""){
                var count_team = teams_challenges.length;
                var total_records_teams = challenges_total.length;
                res.status(200).json({status:true, total_records:total_records_teams, total:count_team, result:teams_challenges, message: count_team+" players team join request received!"});
            }else{
                res.status(200).json({status:true, total_records:0, total:0, result:"", message:"No players team join request!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* Accept challenge */
exports.accept_request = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var team_player_id = req.body.team_player_id;
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id,teamname FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            var teamname = components.capitalText(data[0].teamname);
            const [results, teams_challenges] = await sequelize.query("SELECT player_id FROM `team_players` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.status = 0 AND pc.team_id = ? AND pc.id = ? AND p.`status` = 1 AND p.account_deactive = 0 AND s.`status` = 1",{replacements:[team_id,team_player_id]});
            if(teams_challenges!=""){
                var player_id = teams_challenges[0].player_id;
                var sports_name = teams_challenges[0].sports_name;
                await sequelize.query("UPDATE team_players SET status = 1 WHERE id = ?",{replacements:[team_player_id]});
                
                /* Start add notification */
                var description = teamname + " accepted you team join request for " + sports_name +".";
                var link = "";
                await sequelize.query("INSERT INTO notifications (player_id,opponent_id,description,link,date,team) VALUES (?,?,?,?,?,?)",{replacements:[team_id,player_id,description,link,currenttime,1]});
                /* End add notification */

                res.status(200).json({status:true, result:"", message:"Team join request accepted successfully!"});
            }else{
                res.status(200).json({status:false, result:"", message:"No any team join request found by challenge id!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End of accept challenge */



/* Reject challenge */
exports.reject_request = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var team_player_id = req.body.team_player_id;
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id,teamname FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            var teamname = components.capitalText(data[0].teamname);
            const [results, teams_challenges] = await sequelize.query("SELECT player_id FROM `team_players` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.status = 0 AND pc.team_id = ? AND pc.id = ? AND p.`status` = 1 AND p.account_deactive = 0 AND s.`status` = 1",{replacements:[team_id,team_player_id]});
            if(teams_challenges!=""){
                var player_id = teams_challenges[0].player_id;
                var sports_name = teams_challenges[0].sports_name;
                await sequelize.query("DELETE FROM team_players WHERE id = ?",{replacements:[team_player_id]});

                res.status(200).json({status:true, result:"", message:"Team join request rejected successfully!"});
            }else{
                res.status(200).json({status:false, result:"", message:"No any team join request found by challenge id!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End of Reject challenge */
