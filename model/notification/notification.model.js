var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* notification Start */
exports.notifications_listing = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var limit = req.body.limit;
        var offset = req.body.offset;
        if(limit == "" || limit == undefined || limit == null){limit = 0;}
        if(offset == "" || offset == undefined || offset == null){offset = 0;}

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [resultsTotalNotification, totalRecordsNotification] = await sequelize.query("SELECT 1 FROM notifications_team WHERE team_id = ?",{replacements:[team_id]});
            const [results, teamsNotification] = await sequelize.query("SELECT n.id AS notification_id,n.description,n.link,n.date,n.seen,p.profile_img FROM notifications_team n INNER JOIN teams p ON n.opponent_id = p.id WHERE n.team_id = ? ORDER BY n.id DESC LIMIT "+limit+" OFFSET "+offset,{replacements:[team_id]});
            if(teamsNotification!=""){
                var count_team = teamsNotification.length;
                var total_records_notification = totalRecordsNotification.length;
                res.status(200).json({status:true, result:teamsNotification, total_records:total_records_notification, total:count_team, message:"teams notification found successfully!"});
                await sequelize.query("UPDATE notifications_team SET notify = 1 WHERE team_id = ?",{replacements:[team_id]});
            }else{
                res.status(200).json({status:true, result:"",total_records:0, total:0, message:"No any teams notification found!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* notification End */


/* Add notification Start */
exports.notifications_add = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var token_id = req.body.token_id;
        var description = req.body.description;
        var link = req.body.link;
        var currenttime = components.moment("Y-M-D H:m:s");

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var opponent_id = data[0].id;
            const [results, teamsNotification] = await sequelize.query("SELECT id FROM teams WHERE token_id = ? AND account_deactive = 0 AND status = 1",{replacements:[token_id]});
            if(teamsNotification != ""){
                var team_id = teamsNotification[0].id;
                await sequelize.query("INSERT INTO notifications_team (team_id,opponent_id,description,link,date) VALUES (?,?,?,?,?)",{replacements:[team_id,opponent_id,description,link,currenttime]});
                res.status(200).json({status:true, result:"", message:"Notification added successfully!"});
            }else{
                res.status(200).json({status:false, message:"This team not found, please try again!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* End notification End */



/* notification Count */
exports.notifications_count = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [resultsTotalNotification, totalRecordsNotification] = await sequelize.query("SELECT 1 FROM notifications_team WHERE team_id = ? AND notify = 0",{replacements:[team_id]});
            if(totalRecordsNotification!=""){
                var total_records_notification = totalRecordsNotification.length;
                res.status(200).json({status:true, result:total_records_notification, message:"Notification found successfully!"});
            }else{
                res.status(200).json({status:true, result:"",total_records:0, total:0, message:"No any teams notification found!"});
            }
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* notification Count */


/* Notification seen */
exports.notification_seen = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

        var notification_id = req.body.notification_id;

        const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? AND account_deactive = 0 AND status = 1 LIMIT 1",{replacements:[auth_token]});
        if(data == ""){//check already exist
            res.status(200).json({status:false, message:"team not found, please login again!"});
        }else{
            var team_id = data[0].id;
            const [resultsTotalNotification, totalRecordsNotification] = await sequelize.query("SELECT 1 FROM notifications_team WHERE team_id = ? AND seen = 0 AND id = ?",{replacements:[team_id,notification_id]});
            if(totalRecordsNotification!=""){
                await sequelize.query("UPDATE notifications_team SET seen = 1 WHERE team_id = ? AND id = ?",{replacements:[team_id,notification_id]});
            }
            res.status(200).json({status:true, result:"", message:"Notification updated successfully!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}

/* Notification seen */
