var sequelize = require.main.require('../db/db.js');
const components = require.main.require('../routes/components.js');
const datatype = require.main.require('../routes/datatype.js');

/* location Start */
exports.location = async function (req, res){ 
    try{
        res.setHeader('Content-Type','application/json');
        var location_name = datatype.strtolower(req.query.name);
        var location_id = datatype.int(req.query.id);

        var locationTable = "";
        var whereCondition = "";

        if(location_name == "countries"){
            var locationTable = "countries";
        }else if(location_name == "states" && location_id != 0){
            var locationTable = "states";
            var whereCondition = " WHERE country_id = "+location_id;
        }else if(location_name == "cities" && location_id != 0){
            var locationTable = "cities";
            var whereCondition = " WHERE state_id = "+location_id;
        }
        
        if(locationTable != ""){
            const [results, data] = await sequelize.query("SELECT * FROM "+locationTable+" "+whereCondition);
            if(data != ""){//check records exist
                res.status(200).json({status:true, total:data.length, result:data, message:"Record found successfully!"});
            }else{
                res.status(200).json({status:false, message:"No record found"});
            }
        }else{
            res.status(200).json({status:false, message:"Please enter correct location name or Id!"});
        }

    } catch(e) {
        console.log(e); //console log the error so we can see it in the console
        res.status(500).json({status:false, message:e.toString()});
    }

}
/* location end */
