
var mysql   = require("mysql");
var express = require("express");
var md5 = require("MD5");
var jwt = require('jsonwebtoken'); 
var config = require('../config');
var connection = require("../database");


var userLoginCheck = function (req, res) {
	var post  = {
		password:req.body.password,
		email:req.body.email
	}

	var query = "SELECT * FROM ?? WHERE ??=? AND ??=?";

	var table = ["user","password",  md5(post.password), "email", post.email];

	query = mysql.format(query,table);

	connection.query(query,function(err,rows){
		if(err) {
			res.json({"Error" : true, "Message" : "Error executing MySQL query"});
		}
		else {

			if(rows.length==1){
				var token = jwt.sign(rows, config.secret, {
					expiresIn: 1440
				});
				user_id= rows[0].userid;
				var data  = {
					user_id:rows[0].userid,
					device_type:rows[0].device_type,
					access_token:token,
					device_token:rows[0].device_token,
					ip_address:rows[0].ip_address
				}
				var query = "INSERT INTO  ?? SET  ?";
				var table = ["access_token"];
				query = mysql.format(query,table);
				connection.query(query, data, function(err,rows){
					if(err) {
						res.json({"Error" : true, "Message" : "Error executing MySQL query"});
					} else {
						res.json({
							success: true,
							message: 'Token generated',
							token: token,
							currUser: user_id
						});
           				 } // return info including token
           				});
			}
			else {
				res.json({"Error" : true, "Message" : "wrong email/password combination"});
			}

		}
	});
}

module.exports = userLoginCheck;
