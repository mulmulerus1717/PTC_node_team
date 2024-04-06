const { Sequelize } = require('sequelize');
//var mysql = require('mysql');

const sequelize = new Sequelize('wiyt_team_dev', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,  
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "wiyt_dev"
// });
  
// con.connect(function(err) {
//     if (err) throw err;
//     //console.log("Connected!");
// });

module.exports = sequelize;