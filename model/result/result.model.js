var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');


/* All result Start */
exports.all_result = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        if(limit === undefined || limit === '' || limit === null){limit=10;}
        var offset = req.body.offset;
        if(offset === undefined || offset === '' || offset === null){offset=0;}
        var searchteamTrim = req.body.search;

        if(searchteamTrim !== null && searchteamTrim !== "" && searchteamTrim !== undefined && components.preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z ]$",searchteamTrim) === false){
            var searchteam = (searchteamTrim).trim();
        }
        //Filter team by name
        var queryBuilder = "";
        if(searchteam !== "" && searchteam !== null && searchteam !== undefined){ queryBuilder += " AND (p.teamname LIKE '%"+searchteam+"%' OR pl.teamname LIKE '%"+searchteam+"%') ";}
        
            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var challenge_status = req.body.status;
                if(challenge_status != ""){
                    var challenge_status = datatype.strtolower(challenge_status);
                }

                if(challenge_status == "pending"){
                    queryBuilder += " AND pc.accept_status = 0";
                }else if(challenge_status == "accept"){
                    queryBuilder += " AND pc.accept_status = 1 AND pc.draw = 0 AND pc.won = 0";
                }else if(challenge_status == "decline"){
                    queryBuilder += " AND pc.accept_status = 2";
                }else if(challenge_status == "complete"){
                    queryBuilder += " AND pc.accept_status = 3";
                }

                const [resultsGame, gameResult] = await sequelize.query("SELECT 1 FROM teams_challenges pc INNER JOIN `teams` p ON p.id = pc.team_id INNER JOIN `teams` pl ON pl.id = pc.opponent_id INNER JOIN sports s ON s.id = pc.`sport_id` WHERE (pc.team_id = ? OR pc.opponent_id = ?) AND pc.block = 0 "+queryBuilder,{replacements:[team_id,team_id]});
                const [results, teamsResult] = await sequelize.query("SELECT pc.id AS challenges_id, pc.accept_status,pc.match_contest, IF(pc.match_contest=0,'Friendly match','Losers pay match') AS match_contest_name, pln.name AS location_place,pc.amount, IF(pc.draw=0,IF(pc.won!=0 && pc.won=pc.team_id,p.teamname, IF(pc.won!=0 && pc.won=pc.opponent_id, pl.teamname,'')),'') AS won, IF(pc.draw=0,IF(pc.won!=0 && pc.won=pc.team_id,p.profile_img, IF(pc.won!=0 && pc.won=pc.opponent_id, pl.profile_img,'')),'') AS winner_image, pc.draw, pc.result_date,IF(team_result!='draw',(SELECT teamname FROM teams WHERE id = team_result),team_result) as team_result, IF(opponent_result!='draw',(SELECT teamname FROM teams WHERE id = opponent_result),opponent_result) as opponent_result, s.name AS sports_name, p.profile_img as team_profile, p.teamname AS teamname, p.`token_id` AS team_token, pl.profile_img as opponent_profile, pl.teamname AS opponentname, pl.`token_id` AS opponent_token, pc.match_contest FROM teams_challenges pc INNER JOIN `teams` p ON p.id = pc.team_id INNER JOIN `teams` pl ON pl.id = pc.opponent_id INNER JOIN sports s ON s.id = pc.`sport_id` LEFT JOIN play_location pln ON pln.id = pc.location WHERE (pc.team_id = ? OR pc.opponent_id = ?) AND pc.block = 0 "+queryBuilder+" ORDER BY pc.id DESC LIMIT "+limit+" OFFSET "+offset,{replacements:[team_id,team_id]});
                if(teamsResult!=""){
                    var total_records = gameResult.length;
                    var count_results = teamsResult.length;
                    res.status(200).json({status:true, total_records:total_records, total:count_results, result:teamsResult, message: count_results+" challenge results found!"});
                }else{
                    res.status(200).json({status:true, result:"", total_records:0, total:0, message:"No any teams challenges found to all result!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* ALL result End */

/* result list Start */
exports.result_list = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var challenge_id = req.body.challenge_id;

                const [results, teamsResult] = await sequelize.query("SELECT pc.id AS challenges_id, pc.accept_status, pc.match_contest, IF(pc.match_contest=0,'Friendly match','Losers pay match') AS match_contest_name, pln.name AS location_place,pc.amount, IF(pc.draw=0,IF(pc.won!=0,IF(p.id=pc.won,p.teamname,pl.teamname),0),0) AS won, pc.draw, pc.result_date,IF(team_result!='draw',(SELECT teamname FROM teams WHERE id = team_result),team_result) as team_result, IF(opponent_result!='draw',(SELECT teamname FROM teams WHERE id = opponent_result),opponent_result) as opponent_result, s.name AS sports_name, p.teamname AS teamname, p.`token_id` AS team_token, pl.teamname AS opponentname, pl.`token_id` AS opponent_token FROM teams_challenges pc INNER JOIN `teams` p ON p.id = pc.team_id INNER JOIN `teams` pl ON pl.id = pc.opponent_id INNER JOIN sports s ON s.id = pc.`sport_id` LEFT JOIN play_location pln ON pln.id = pc.location WHERE pc.id = ? AND (pc.team_id = ? OR pc.opponent_id = ?) AND pc.accept_status = 1 AND pc.block = 0",{replacements:[challenge_id,team_id,team_id]});
                if(teamsResult!=""){
                    res.status(200).json({status:true, result:teamsResult});
                }else{
                    res.status(200).json({status:true, result:"",message:"No any teams challenges found to add result!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* result End */


/* Add result Start */
exports.result_add = async function (req, res){ 
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
                var resultAdded = datatype.strtolower(req.body.result);
                var resultteamId = resultAdded;
                var currenttime = components.moment("Y-M-D H:m:s");

                if(resultAdded != "draw"){
                    const [resultsteam, teamsByResult] = await sequelize.query("SELECT id FROM `teams` WHERE token_id = ?",{replacements:[resultAdded]});
                    if(teamsByResult!=""){
                        var resultteamId = teamsByResult[0].id;
                    }
                }
                const [results, teamsResult] = await sequelize.query("SELECT pc.id AS challenges_id, pc.team_result, pc.opponent_result, p.`token_id` AS team_token, p.`id` AS team_id, pl.`token_id` AS opponent_token, p.`teamname` AS team_teamname, pl.`teamname` AS opponent_teamname, s.name AS sports_name, pl.`id` AS opponent_id FROM teams_challenges pc INNER JOIN `teams` p ON p.id = pc.team_id INNER JOIN `teams` pl ON pl.id = pc.opponent_id INNER JOIN sports s ON s.id = pc.`sport_id` WHERE pc.id = ? AND (pc.team_id = ? OR pc.opponent_id = ?) AND pc.accept_status = 1 AND pc.won = 0 AND pc.draw = 0 AND pc.block = 0",{replacements:[challenge_id,team_id,team_id]});
                if(teamsResult!=""){
                    var teamAddResult = teamsResult[0].team_result;
                    var challengeteamId = teamsResult[0].team_id;
                    var challengeteamName = components.capitalText(teamsResult[0].team_teamname);
                    var challengeOpponentName = components.capitalText(teamsResult[0].opponent_teamname);
                    var challengeSportsName = teamsResult[0].sports_name;
                    var challengeOpponentId = teamsResult[0].opponent_id;
                    var opponentAddResult = teamsResult[0].opponent_result;
                    var fullname = "";
                    var notificationteamId = "";
                    if(challengeteamId == team_id){
                        fullname = challengeteamName;
                        notificationteamId = challengeOpponentId;
                        await sequelize.query("UPDATE teams_challenges SET team_result = ? WHERE id = ?",{replacements:[resultteamId,challenge_id]});
                    }else{
                        fullname = challengeOpponentName;
                        notificationteamId = challengeteamId;
                        await sequelize.query("UPDATE teams_challenges SET opponent_result = ? WHERE id = ?",{replacements:[resultteamId,challenge_id]});
                    }

                    /* Start add notification */
                    var description = fullname + " added match result for " + challengeSportsName +".";
                    var link = "/result";
                    await sequelize.query("INSERT INTO notifications_team (team_id,opponent_id,description,link,date) VALUES (?,?,?,?,?)",{replacements:[notificationteamId,team_id,description,link,currenttime]});
                    /* End add notification */

                    const [resultsteam, teamsByResultAdd] = await sequelize.query("SELECT team_result, opponent_result, won, draw FROM `teams_challenges` WHERE id = ?",{replacements:[challenge_id]});
                    if(teamsByResultAdd!=""){
                        var team_result = teamsByResultAdd[0].team_result;
                        var opponent_result = teamsByResultAdd[0].opponent_result;
                        var won = teamsByResultAdd[0].won;
                        var draw = teamsByResultAdd[0].draw;
                        
                        if(team_result != "" && opponent_result != "" && team_result == opponent_result){
                            if(won == 0 && draw == 0){
                                if(team_result == "draw"){
                                    await sequelize.query("UPDATE teams_challenges SET draw = 1, result_date = ?, accept_status = 3 WHERE id = ?",{replacements:[currenttime,challenge_id]});
                                    await sequelize.query("UPDATE teams SET matches = matches + 1, draw = draw + 1 WHERE id = ? and id = ?",{replacements:[challengeteamId,challengeOpponentId]});
                                }else{
                                    await sequelize.query("UPDATE teams_challenges SET won = ?, result_date = ?, accept_status = 3 WHERE id = ?",{replacements:[team_result,currenttime,challenge_id]});
                                    await sequelize.query("UPDATE teams SET matches = matches + 1, won = won + 1 WHERE id = ?",{replacements:[team_result]});
                                }

                                /* Start add notification */
                                var description = challengeteamName + " and you finalizes match result for " + challengeSportsName +".";
                                var link = "/result";
                                await sequelize.query("INSERT INTO notifications_team (team_id,opponent_id,description,link,date) VALUES (?,?,?,?,?)",{replacements:[notificationteamId,team_id,description,link,currenttime]});
                                /* End add notification */

                            }
                        }
                    }
                    res.status(200).json({status:true, result:"", message:"Result added successfully!"});
                }else{
                    res.status(200).json({status:true, result:"",message:"No challenges found to add result or result may already added!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* add result End */

