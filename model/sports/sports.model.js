const sequelize = require.main.require('../db/db.js');
const datatype = require.main.require('../routes/datatype.js');
const http = require('http');

exports.sports_list = async function (req, res){
    res.setHeader('Content-Type','application/json'); 
    try{
        const [results, metadata] = await sequelize.query('SELECT id,name FROM sports WHERE status = ? ORDER BY name',{ replacements: [1] });
        res.status(200).json({status:true, total_record:metadata.length, result:metadata});
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}

exports.sports_add = async function (req, res){
    res.setHeader('Content-Type','application/json'); 
    var sport = datatype.strtolower(req.body.sport);
    try{
        const [results, metadata] = await sequelize.query('SELECT id FROM sports WHERE name = ?',{ replacements: [sport] });
        if(metadata != ""){
        	res.status(200).json({status:false, message:"Sport/Game already exists"});
        }else{
        	await sequelize.query("INSERT INTO sports (name) VALUES (?)",{ replacements:[sport]});
            res.status(200).json({status:true, message:"Sport/Game added successfully"});
        }
        
    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}