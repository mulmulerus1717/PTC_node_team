var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* All block Start */
exports.block_list = async function (req, res){ 
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
        if(searchteam !== "" && searchteam !== null && searchteam !== undefined){ queryBuilder += " AND (p.teamname LIKE '%"+searchteam+"%') ";}
        
            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"Team not found, please login again!"});
            }else{
                var team_id = data[0].id;

                const [resultsBlock, totalResult] = await sequelize.query("SELECT 1 FROM `block` b INNER JOIN teams p on p.id = b.opponent_id WHERE b.`team_id` = ? "+queryBuilder,{replacements:[team_id]});
                const [results, blockResult] = await sequelize.query("SELECT b.date, p.teamname as opponent_name, p.profile_img, p.token_id AS opponent_token_id FROM `block` b INNER JOIN teams p on p.id = b.opponent_id WHERE b.`team_id` = ? "+queryBuilder+" ORDER BY b.id DESC LIMIT "+limit+" OFFSET "+offset,{replacements:[team_id]});
                if(blockResult!=""){
                    var total_records = totalResult.length;
                    var count_results = blockResult.length;
                    res.status(200).json({status:true, total_records:total_records, total:count_results, result:blockResult, message: count_results+" results found!"});
                }else{
                    res.status(200).json({status:true, total_records:0, total:0, result:"", message:"No any result found!"});
                }
            }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* ALL block End */

/* Add block Start */
exports.block_add = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var opponent_token_id = req.body.opponent_token_id;
                var currenttime = components.moment("Y-M-D H:m:s");
                
                const [results, blockResult] = await sequelize.query("SELECT p.id FROM `block` b INNER JOIN teams p on p.id = b.opponent_id WHERE b.`team_id` = ? AND p.token_id = ?",{replacements:[team_id,opponent_token_id]});
                if(blockResult!=""){
                    res.status(200).json({status:false, result:"",message:"Opponent already in block list!"});
                }else{
                    const [results, opponentResult] = await sequelize.query("SELECT p.id FROM teams p WHERE p.token_id = ? AND p.id != ?",{replacements:[opponent_token_id,team_id]});
                    if(opponentResult!=""){
                        var opponent_id = opponentResult[0].id;
                        await sequelize.query("INSERT INTO block (team_id,opponent_id,date) VALUES (?,?,?)",{replacements:[team_id,opponent_id,currenttime]});
                        const [results, challengeResult] = await sequelize.query("SELECT 1 FROM teams_challenges pc WHERE (pc.team_id = ? AND pc.opponent_id = ?) OR (pc.team_id = ? AND pc.opponent_id = ?) AND pc.block = 0",{replacements:[team_id,opponent_id,opponent_id,team_id]});
                        if(challengeResult!=""){
                            await sequelize.query("UPDATE teams_challenges pc SET pc.block = 1 WHERE (pc.team_id = ? AND pc.opponent_id = ?) OR (pc.team_id = ? AND pc.opponent_id = ?)",{replacements:[team_id,opponent_id,opponent_id,team_id]});
                        }
                        res.status(200).json({status:true, result:"", message:"Opponent blocked successfully!"});
                    }else{
                      res.status(200).json({status:false, result:"",message:"Opponent not found!"});  
                    }
                }
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* add block End */


/* Add Unblock Start */
exports.unblock = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                var team_id = data[0].id;
                var opponent_token_id = req.body.opponent_token_id;
                var currenttime = components.moment("Y-M-D H:m:s");
                
                const [results, blockResult] = await sequelize.query("SELECT p.id FROM `block` b INNER JOIN teams p on p.id = b.opponent_id WHERE b.`team_id` = ? AND p.token_id = ?",{replacements:[team_id,opponent_token_id]});
                if(blockResult!=""){
                    var opponent_id = blockResult[0].id;
                    await sequelize.query("DELETE FROM block WHERE team_id = ? AND opponent_id = ?",{replacements:[team_id,opponent_id]});
                    const [results, challengeResult] = await sequelize.query("SELECT 1 FROM teams_challenges pc WHERE (pc.team_id = ? AND pc.opponent_id = ?) OR (pc.team_id = ? AND pc.opponent_id = ?) AND pc.block = 1",{replacements:[team_id,opponent_id,opponent_id,team_id]});
                        if(challengeResult!=""){
                            await sequelize.query("UPDATE teams_challenges pc SET pc.block = 0 WHERE (pc.team_id = ? AND pc.opponent_id = ?) OR (pc.team_id = ? AND pc.opponent_id = ?)",{replacements:[team_id,opponent_id,opponent_id,team_id]});
                        }
                    res.status(200).json({status:true, result:"", message:"Opponent is unblocked successfully!"});
                }else{
                    res.status(200).json({status:false, result:"",message:"Opponent not in block list!"});
                }
            }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* add Unblock End */

