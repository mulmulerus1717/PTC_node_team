var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* Search Start */
exports.search_team = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        var offset = req.body.offset;
        var searchteam = "";
        var searchGender = req.body.gender;
        var searchAge = req.body.age_range;
        var searchType = req.body.type;
        var searchSports = req.body.sports;
        var searchteamTrim = req.body.search;

        if(searchteamTrim !== null && searchteamTrim !== "" && searchteamTrim !== undefined && components.preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z0-9 ]$",searchteamTrim) === false){
            var searchteam = (searchteamTrim).trim();
        }

        var whereCondition = "";
        //Filter team by name
        if(searchteam !== "" && searchteam !== null && searchteam !== undefined){ whereCondition += " p.teamname LIKE '%"+searchteam+"%' AND ";}
        
        //Filter Gender
        if(searchGender !== "" && searchGender !== null && searchGender !== undefined){ whereCondition += " p.gender = '"+searchGender+"' AND ";}
        
        //Filter Type
        if(searchType !== "" && searchType !== null && searchType !== undefined){ whereCondition += " p.type = '"+searchType+"' AND ";}
        
        //Filter Age
        if(searchAge !== "" && searchAge !== null && searchAge !== undefined){ 
            whereCondition += " p.age_range = '"+searchAge+"' AND ";
        }

        //Filter Sports
        if(searchSports !== "" && searchSports !== null && searchSports !== undefined){ 
            const parsedSportsStr = searchSports.match(/\d+/g)
            whereCondition += " ps.sport_id IN ("+parsedSportsStr+") AND ";
        }

            const [results, data] = await sequelize.query("SELECT id,country_id,state_id,city_id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var country_id = data[0].country_id;
                var state_id = data[0].state_id;
                var city_id = data[0].city_id;
                const [resultsPlaying, teamsPlayingSport] = await sequelize.query("SELECT ps.sport_id,s.name AS sports_name FROM `teams_sports` ps INNER JOIN sports s ON ps.sport_id = s.id WHERE ps.team_id = ? AND ps.status = 1",{replacements:[team_id]});
                const [results, dataSport] = await sequelize.query("SELECT GROUP_CONCAT(sport_id) AS sports_id FROM `teams_sports` WHERE team_id = ? AND STATUS = 1",{replacements:[team_id]});
                if(dataSport!=""){
                    var sports_id = dataSport[0].sports_id;
                    const [resultsTotalteams, totalRecordsteams] = await sequelize.query("SELECT 1 FROM `teams` p INNER JOIN `teams_sports` ps ON p.id = ps.team_id INNER JOIN `sports` s ON s.id = ps.sport_id WHERE "+whereCondition+" p.id != ? AND p.status = 1 AND account_deactive = 0 AND p.country_id = ? AND p.state_id = ? AND p.city_id = ? AND ps.sport_id IN ("+sports_id+") AND ps.status = 1 AND p.id NOT IN (SELECT b.opponent_id FROM block_team b WHERE b.team_id = ?) AND p.id NOT IN (SELECT b.team_id FROM block_team b WHERE b.team_id = p.id AND b.opponent_id = ?) GROUP BY p.id",{replacements:[team_id,country_id,state_id,city_id,team_id,team_id]});
                    const [results, dataFindteam] = await sequelize.query("SELECT p.token_id,p.teamname,tt.name AS type_name,ag.name AS age_range,p.gender,p.profile_img,p.matches,p.won,p.draw,GROUP_CONCAT(DISTINCT s.`name`) AS all_sports,GROUP_CONCAT(DISTINCT s.`id`) AS all_sports_id, GROUP_CONCAT(DISTINCT s.id, '~' ,s.name) AS sports_with_id, (SELECT GROUP_CONCAT(IF(pkc.won=p.id && pkc.draw=0,'W',IF(pkc.draw=1,'D','L'))) FROM teams_challenges pkc WHERE (pkc.team_id = p.id OR pkc.opponent_id = p.id) and pkc.accept_status = 1 AND (pkc.won != 0 or pkc.draw != 0) ORDER BY pkc.id DESC LIMIT 5) as last_matches FROM `teams` p INNER JOIN `teams_sports` ps ON p.id = ps.team_id INNER JOIN `sports` s ON s.id = ps.sport_id INNER JOIN team_type tt ON tt.id = p.type INNER JOIN age_range ag ON ag.id = p.age_range WHERE "+whereCondition+" p.id != ? AND p.status = 1 AND account_deactive = 0 AND p.country_id = ? AND p.state_id = ? AND p.city_id = ? AND ps.sport_id IN ("+sports_id+") AND ps.status = 1 AND p.id NOT IN (SELECT b.opponent_id FROM block_team b WHERE b.team_id = ?) AND p.id NOT IN (SELECT b.team_id FROM block_team b WHERE b.team_id = p.id AND b.opponent_id = ?) GROUP BY p.id ORDER BY p.matches DESC LIMIT "+limit+" OFFSET "+offset+"",{replacements:[team_id,country_id,state_id,city_id,team_id,team_id]});
                    if(dataFindteam!=""){
                        var count_team = dataFindteam.length;
                        var total_records_teams = totalRecordsteams.length;
                        res.status(200).json({status:true, result:dataFindteam, message:"Teams found successfully!", total:count_team, total_records:total_records_teams, team_playing_sports:teamsPlayingSport });
                    }else{
                        res.status(200).json({status:true, result:"",message:"No teams found by this sports!",total:0,total_records:0, team_playing_sports:[]});
                    }
                }else{
                    res.status(200).json({status:true, result:"",message:"No sports added by team found!"});
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* Search End */


/* Send challenge */
exports.send_challenge = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var opponent_token = req.body.opponent_token;
        var sport_id_challenge = req.body.sport_id;
        var place = req.body.place;
        var match = req.body.match;
        var amount = req.body.amount == '' ? 0 : req.body.amount;
        var challenge_message = req.body.message;
        var currenttime = components.moment("Y-M-D H:m:s");
        
        
        if(match == "1" && (amount == "" || amount == "0")){
            res.status(200).json({status:false, message:"Amount cannot be empty for losers pay match."});
        }else{
            const [results, data] = await sequelize.query("SELECT id,teamname,country_id,state_id,city_id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var country_id = data[0].country_id;
                var state_id = data[0].state_id;
                var city_id = data[0].city_id;
                var teamname = components.capitalText(data[0].teamname);
    
                const [results, dataSport] = await sequelize.query("SELECT GROUP_CONCAT(sport_id) AS sports_id FROM `teams_sports` WHERE team_id = ? AND status = 1",{replacements:[team_id]});
                if(dataSport!=""){
                    var sports_id = dataSport[0].sports_id;
                    const [results, dataFindteam] = await sequelize.query("SELECT p.id FROM `teams` p INNER JOIN `teams_sports` ps ON p.id = ps.team_id WHERE p.token_id = ? AND p.status = 1 AND account_deactive = 0 AND p.country_id = ? AND p.state_id = ? AND p.city_id = ? AND ps.sport_id IN ("+sports_id+") AND ps.status = 1 AND p.id NOT IN (SELECT b.opponent_id FROM block_team b WHERE b.team_id = ?) AND p.id NOT IN (SELECT b.team_id FROM block_team b WHERE b.team_id = p.id AND b.opponent_id = ?) GROUP BY p.id",{replacements:[opponent_token,country_id,state_id,city_id,team_id,team_id]});
                    if(dataFindteam!=""){
                        var opponent_id = dataFindteam[0].id;
                        const [results, teams_challenges] = await sequelize.query("SELECT 1 FROM `teams_challenges` pc WHERE accept_status != 2 AND sport_id = ? AND team_id = ? AND opponent_id = ?",{replacements:[sport_id_challenge,team_id,opponent_id]});
                        if(teams_challenges!=""){
                            res.status(200).json({status:true, result:"",message:"Challenge already send to opponent!"});
                        }else{
                            await sequelize.query("INSERT INTO teams_challenges (team_id,opponent_id,sport_id,message,location,match_contest,amount,added_date) VALUES (?,?,?,?,?,?,?,?)",{replacements:[team_id,opponent_id,sport_id_challenge,challenge_message,place,match,amount,currenttime]});
                            
                            /* Start add notification */
                            var sports_game_name = "";
                            const [results, sport_name] = await sequelize.query("SELECT name FROM `sports` WHERE id = ?",{replacements:[sport_id_challenge]});
                            if(sport_name!=""){
                                sports_game_name = " for " + sport_name[0].name;
                            }
                            var description = teamname + " sent you challenge" + sports_game_name + ".";
                            var link = "/challenges";
                            await sequelize.query("INSERT INTO notifications_team (team_id,opponent_id,description,link,date) VALUES (?,?,?,?,?)",{replacements:[opponent_id,team_id,description,link,currenttime]});
                            /* End add notification */
    
                            res.status(200).json({status:true, result:"",message:"Challenge successfully send to your opponent!"});
                        }
                    }else{
                        res.status(200).json({status:true, result:"",message:"No teams found by this token id!"});
                    }
                }else{
                    res.status(200).json({status:true, result:"",message:"No sports added by team found!"});
                }
                
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

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
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [resultsChallenges, challenges_total] = await sequelize.query("SELECT 1 FROM `teams_challenges` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.accept_status = 0 AND pc.opponent_id = ? AND p.`status` = 1 AND s.`status` = 1 AND pc.block = 0",{replacements:[team_id]});
            const [results, teams_challenges] = await sequelize.query("SELECT p.teamname,p.gender,tt.name AS type_name,ag.name AS age_range,p.token_id as opponent_token_id,p.`profile_img`,p.matches,p.won,p.draw,pc.id AS challenge_id,s.name AS sport_name,pc.match_contest,IF(pc.match_contest=0,'Friendly match','Losers pay match') AS match_contest_name,pln.name AS location_place,pc.amount,pc.match_contest,pc.message AS challenge_message,pc.added_date AS date FROM `teams_challenges` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` INNER JOIN team_type tt ON tt.id = p.type INNER JOIN age_range ag ON ag.id = p.age_range LEFT JOIN play_location pln ON pln.id = pc.location WHERE pc.accept_status = 0 AND pc.opponent_id = ? AND p.`status` = 1 AND s.`status` = 1 AND pc.block = 0 ORDER BY pc.id DESC LIMIT "+limit+" OFFSET "+offset+"",{replacements:[team_id]});
            if(teams_challenges!=""){
                var count_team = teams_challenges.length;
                var total_records_teams = challenges_total.length;
                res.status(200).json({status:true, total_records:total_records_teams, total:count_team, result:teams_challenges, message: count_team+" new challenges received!"});
            }else{
                res.status(200).json({status:true, total_records:0, total:0, result:"", message:"No new challenges!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}


/* Accept challenge */
exports.accept_challenge = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var challenge_id = req.body.challenge_id;
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id,teamname FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            var teamname = components.capitalText(data[0].teamname);
            const [results, teams_challenges] = await sequelize.query("SELECT pc.team_id,pc.message,pc.added_date,s.name AS sports_name FROM `teams_challenges` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.accept_status = 0 AND pc.opponent_id = ? AND pc.id = ? AND p.`status` = 1 AND p.account_deactive = 0 AND s.`status` = 1 AND pc.block = 0",{replacements:[team_id,challenge_id]});
            if(teams_challenges!=""){
                var opponent_team_id = teams_challenges[0].team_id;
                var opponent_message = teams_challenges[0].message;
                var opponent_message_date = teams_challenges[0].added_date;
                var sports_name = teams_challenges[0].sports_name;
                await sequelize.query("UPDATE teams_challenges SET accept_status = 1 WHERE id = ?",{replacements:[challenge_id]});
                await sequelize.query("INSERT teams_msg (`challenges_id`,`team_id`,`opponent_id`,`msg`,`date`) VALUES (?,?,?,?,?)",{replacements:[challenge_id,opponent_team_id,team_id,opponent_message,opponent_message_date]});
                await sequelize.query("INSERT teams_msg (`challenges_id`,`team_id`,`opponent_id`,`msg`,`date`) VALUES (?,?,?,'Hey! Let play, give me the details',?)",{replacements:[challenge_id,team_id,opponent_team_id,currenttime]});
                
                /* Start add notification */
                var description = teamname + " accepted you challenge for " + sports_name +".";
                var link = "/chat?challenge_id="+challenge_id;
                await sequelize.query("INSERT INTO notifications_team (team_id,opponent_id,description,link,date) VALUES (?,?,?,?,?)",{replacements:[opponent_team_id,team_id,description,link,currenttime]});
                /* End add notification */

                res.status(200).json({status:true, result:"", message:"Challenge accepted successfully!"});
            }else{
                res.status(200).json({status:false, result:"", message:"No any challenge found by challenge id!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End of accept challenge */

/* Reject challenge */
exports.reject_challenge = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var challenge_id = req.body.challenge_id;
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [results, teams_challenges] = await sequelize.query("SELECT pc.team_id,pc.message,pc.added_date FROM `teams_challenges` pc INNER JOIN `teams` p ON pc.`team_id` = p.`id` INNER JOIN `sports` s ON s.`id` = pc.`sport_id` WHERE pc.accept_status = 0 AND pc.opponent_id = ? AND pc.id = ? AND p.`status` = 1 AND p.account_deactive = 0 AND s.`status` = 1 AND p.id NOT IN (SELECT b.opponent_id FROM block_team b WHERE b.team_id = ?) AND p.id NOT IN (SELECT b.team_id FROM block_team b WHERE b.team_id = p.id AND b.opponent_id = ?)",{replacements:[team_id,challenge_id,team_id,team_id]});
            if(teams_challenges!=""){
                await sequelize.query("UPDATE teams_challenges SET accept_status = 2 WHERE id = ?",{replacements:[challenge_id]});
                res.status(200).json({status:true, result:"", message:"Challenge rejected successfully!"});
            }else{
                res.status(200).json({status:false, result:"", message:"No any challenge found by challenge id!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End of Reject challenge */


/* message count start */
exports.challenges_count = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;

                const [results, teamsNotification] = await sequelize.query("SELECT COUNT(1) AS notification FROM `teams_challenges` pc WHERE pc.notification = 0 AND pc.opponent_id = ? AND pc.accept_status = 0 AND pc.team_id NOT IN (SELECT b.opponent_id FROM block_team b WHERE b.team_id = ?) AND pc.team_id NOT IN (SELECT b.team_id FROM block_team b WHERE b.team_id = pc.team_id AND b.opponent_id = ?)",{replacements:[team_id,team_id,team_id]});
                if(teamsNotification!=""){
                    var new_message_count = teamsNotification[0].notification;
                    res.status(200).json({status:true, result:new_message_count, message:"Challenges notification count found successfully!"});
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
exports.update_challenges_count = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                const [results, teamsNotification] = await sequelize.query("UPDATE `teams_challenges` SET notification = 1 WHERE notification = 0 AND opponent_id = ?",{replacements:[team_id]});
                if(teamsNotification!=""){
                    res.status(200).json({status:true, result:"", message:"Challenges notification count updated successfully!"});
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


/* Search sports from city Start */
exports.search_city_sports = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        var offset = req.body.offset;
        var searchSports = "";
        var searchSportsTrim = req.body.search;

        if(searchSportsTrim !== null && searchSportsTrim !== "" && searchSportsTrim !== undefined && components.preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z0-9 ]$",searchSportsTrim) === false){
            var searchSports = (searchSportsTrim).trim();
        }

        var whereCondition = "";
        //Filter sports by name
        if(searchSports !== "" && searchSports !== null && searchSports !== undefined){ whereCondition += " AND s.name LIKE '%"+searchSports+"%' ";}

            const [results, data] = await sequelize.query("SELECT id,country_id,state_id,city_id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var country_id = data[0].country_id;
                var state_id = data[0].state_id;
                var city_id = data[0].city_id;
                const [resultsChallenges, challenges_total] = await sequelize.query("SELECT 1 FROM ( SELECT COUNT(s.id) as total, s.name FROM `teams` t INNER JOIN teams_sports ts ON ts.team_id = t.id INNER JOIN sports s ON s.id = ts.sport_id WHERE t.`city_id` = ? AND t.id != ? AND t.status = 1 AND t.account_deactive = 0 "+whereCondition+" AND t.id NOT IN (SELECT `opponent_id` FROM block_team WHERE team_id = ?) GROUP BY s.name ) AS t ORDER BY total DESC",{replacements:[city_id,team_id,team_id]});
                const [results, dataSport] = await sequelize.query("SELECT * FROM ( SELECT COUNT(s.id) as total, s.name, s.id as sport_id FROM `teams` t INNER JOIN teams_sports ts ON ts.team_id = t.id INNER JOIN sports s ON s.id = ts.sport_id WHERE t.`city_id` = ? AND t.id != ? AND t.status = 1 AND t.account_deactive = 0 "+whereCondition+" AND t.id NOT IN (SELECT `opponent_id` FROM block_team WHERE team_id = ?) GROUP BY s.name ) AS t ORDER BY total DESC LIMIT "+limit+" OFFSET "+offset+"",{replacements:[city_id,team_id,team_id]});
                if(dataSport!=""){
                    var total_records_sports = challenges_total.length;
                    var count_sports = dataSport.length;
                    res.status(200).json({status:true, result:dataSport, total:count_sports, total_records:total_records_sports, message:"Sports found from your city!"});
                }else{
                    res.status(200).json({status:true, result:"",message:"No sports found!"});
                }
            }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* Search sports from city End */


/* Start add sports city */
exports.add_sports_city = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var sport_id = req.body.sport_id;

        const [results, data] = await sequelize.query("SELECT id,sports_list FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"Team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            var sports_list = data[0].sports_list;
            const [results, sports_data] = await sequelize.query("SELECT 1 FROM `teams_sports` WHERE team_id = ? AND sport_id = ?",{replacements:[team_id,sport_id]});
            if(sports_data == ""){
                const [results, dataSport] = await sequelize.query("SELECT id,name FROM sports WHERE id = ? AND status = 1 LIMIT 1",{ replacements:[sport_id]});
                var updateSports = sports_list + dataSport[0].name+",";
                await sequelize.query("INSERT INTO teams_sports (team_id,sport_id) VALUES (?,?)",{replacements:[team_id,sport_id]});
                await sequelize.query("UPDATE teams SET sports_list = ? WHERE id = ?",{replacements:[updateSports,team_id]});
                res.status(200).json({status:true, result:"", message:"Sport added successfully!"});
            }else{
                res.status(200).json({status:false, result:"", message:"This sports already added in your sports list!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* End of add sports city */

