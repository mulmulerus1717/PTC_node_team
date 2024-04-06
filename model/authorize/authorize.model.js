var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* authorize destroy Start */
exports.authorize_destroy = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                await sequelize.query("UPDATE teams SET jwt_token = '' WHERE jwt_token = ? ",{replacements:[auth_token]});
                res.status(200).json({status:true, result:"",message:"team logout successfully!"});
            }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* authorize destroy End */


/* authorize destroy Start */
exports.authorize = async function (req, res){
    try{
        res.setHeader('Content-Type','application/json');
        var authorization = req.header('authorization');
        var auth_token = (authorization).split(" ")[1];

            const [results, data] = await sequelize.query("SELECT id FROM teams WHERE jwt_token = ? LIMIT 1",{replacements:[auth_token]});
            if(data == ""){//check already exist
                res.status(200).json({status:false, message:"team not found, please login again!"});
            }else{
                res.status(200).json({status:true, result:"",message:"team is logged in!"});
            }
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }
}
/* authorize destroy End */