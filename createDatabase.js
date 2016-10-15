var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	multipleStatements: true
});
connection.connect();

connection.query("drop database if exists mosque_finder; create database mosque_finder; use mosque_finder;CREATE TABLE `mosques` (`id` int(11) NOT NULL AUTO_INCREMENT,`google_id` varchar(255) NOT NULL,`timings` varchar(255) NOT NULL,PRIMARY KEY (`id`));CREATE TABLE `areas` (`id` int(11) NOT NULL AUTO_INCREMENT,`name` varchar(255) NOT NULL,`pincode` varchar(255) NOT NULL,`zone` varchar(255) NOT NULL,PRIMARY KEY (`id`));", function(err, rows, fields) {
    if (err) {
        throw err;
    }
    console.log('Database Created!!');
    process.exit(0);
});