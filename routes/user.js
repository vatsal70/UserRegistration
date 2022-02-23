var express = require('express')
var router = express()

const bcrypt = require('bcryptjs');
const saltRounds = 10;
const randtoken = require('rand-token');
var nodemailer = require('nodemailer');
//const { token } = require('morgan');
require('dotenv').config()
function sendEmail(email, token) {
 
      var email = email;
      var token = token;
   
      var mail = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE,
          auth: {
              user: process.env.EMAIL_USER_ID, // Your email id
              pass: process.env.EMAIL_USER_PASSWORD // Your password
          }
      });
   
      var mailOptions = {
          from: process.env.EMAIL_USER_ID,
          to: email,
          subject: 'Reset Password Link - userregistration.com',
          html: '<p>You requested for reset password, kindly use this <a href="http://127.0.0.1:3000/api/users/update-password/' + token + '">link</a> to reset your password</p>'
   
      };
   
      mail.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.log(1)
          } else {
              console.log(0)
          }
      });
  }





    

const createTable = async function(req, res, error, conn){


      req.getConnection(function(error, conn) {
            // conn.query(`CREATE TABLE IF NOT EXISTS users (
            //             id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
            //             username VARCHAR(50) NOT NULL UNIQUE, 
            //             password VARCHAR(255) NOT NULL, 
            //             created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`, function(err, result){
            conn.query(`CREATE TABLE IF NOT EXISTS users (
                  id int(11) NOT NULL,
                  name varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                  email varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                  password varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
                  token varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`, function(err, result){

            if (err) throw err;
            // res.status(200).json({"message": "Tables has been created.", 
            //                         "result": result});
                  })

            conn.query(`ALTER TABLE users
                        ADD PRIMARY KEY (id),
                        ADD UNIQUE KEY email (email);`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered first time")
                        });


            conn.query(`ALTER TABLE users
                        MODIFY id int(11) NOT NULL AUTO_INCREMENT;`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered second time")
                        });


                        conn.query(`COMMIT;`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered third time")
                        });
            })

}



const addUsers = async function(req, res, email, name, password, next){
      req.getConnection(async function(error, conn){
            conn.query(`INSERT INTO users (email, name, password) values ('${email}', '${name}', '${password}');`, 
                        async function (err, result) {
                              if (err){
                                    if (err.code === 'ER_DUP_ENTRY'){
                                          res.status(404).send("Email already exists.");
                                          };
                                    if (err.code === 'ER_NO_SUCH_TABLE'){
                                          console.log("Table does not exists.");
                                          await createTable(req, res, error, conn);
                                          await conn.query(`INSERT INTO users (email, name, password) values ('${email}', '${name}', '${password}');`)
                                          const json_result = {
                                                "message": "${email} has been created."
                                                } 
                                          };
                              };
                              const json_result = {
                                    "message": "${email} has been created."
                                    }
                              console.log("Inside Function addsers");
                              return json_result;
                  })
      })
}
















// CREATE TABLE IF NOT EXISTS
router.get('/createTableUsers', function(req, res, next) {
      try{
            req.getConnection(function(error, conn) {
            conn.query(`CREATE TABLE IF NOT EXISTS users (
                  id int(11) NOT NULL,
                  name varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                  email varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                  password varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
                  token varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`, function(err, result){

            if (err) throw err;
            res.status(200).json({"message": "Tables has been created.", 
                                    "result": result});
                  })

            conn.query(`ALTER TABLE users
                        ADD PRIMARY KEY (id),
                        ADD UNIQUE KEY email (email);`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered first time")
                        });


            conn.query(`ALTER TABLE users
                        MODIFY id int(11) NOT NULL AUTO_INCREMENT;`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered second time")
                        });


                        conn.query(`COMMIT;`, function(err, result){
                        if (err) throw err;
                        console.log("Table Altered third time")
                        });
            })
      }
      catch{console.log("Failed")}
})





// ADD USERS TO THE ADDED TABLE
router.post('/addUsers', async function(req, res, next) {
  const email = req.body.email;
  const name = req.body.name;
  const password = await bcrypt.hash(req.body.password, saltRounds);
  console.log(email, name, password);

      req.getConnection(function(error, conn) {
            conn.query(`INSERT INTO users (email, name, password) values ('${email}', '${name}', '${password}');`, 
                        function (err, result) {
            if (err){
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY'){
                  res.status(404).send("Email already exists.");
                  };
            };
            res.status(200).json(result);
            })
      })
})





// LOGIN USERS TO THE PORTAL
router.post('/loginUsers', async function(req, res, next) {
      const email = req.body.email;
      const name = req.body.name
      const password = req.body.password;
      console.log(email, name, password);
      req.getConnection(async function(error, conn) {
            conn.query(`SELECT * FROM users WHERE email = '${email}'`, async function(err, result){
                  try{
                        if (result.length <= 0){
                              res.status(501).json({"message": "Email does not exists."});
                        }
                        else{
                              const hashedPassword = result[0].password;
                              if (await bcrypt.compare(password, hashedPassword)) {
                                    console.log("---------> Login Successful")
                                    res.status(200).send(`${email} is logged in!`)
                                    } 
                              else {
                                    console.log("---------> Password Incorrect")
                                    res.status(404).send("Password incorrect!")
                              }
                        }
                  } catch{console.log("Something went wrong.")}

            })
      })

})





router.get('/logout', function (req, res) {
      req.session.destroy();
      res.status(200).send({
            "type": "success", 
            "message": "You've been logged out"
      })
      });




/* send reset password link in email */
router.post('/reset-password-email', function(req, res, next) {
 
      var email = req.body.email;
   
   
      req.getConnection(async function(error, conn){
            conn.query('SELECT * FROM users WHERE email ="' + email + '"', function(err, result){
                  if (err) throw err;
                  var type = ''
                  var msg = ''
                  var temp_link = ''
                  console.log(result[0]);
                  try{
                        if (result[0].email.length > 0) {
                              var token = randtoken.generate(20);
                              var sent = sendEmail(email, token);
                              if (sent != '0') {
                              var data = {
                                    token: token
                              }
                              conn.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function(err, result) {
                                    if(err) throw err
                              })
                              type = 'success';
                              msg = 'The reset password link has been sent to your email address';
                              temp_link = 'http://127.0.0.1:3000/api/users/update-password/' + token
                              } else {
                              type = 'error';
                              msg = 'Something goes to wrong. Please try again';
                              }
                        } 
                  }catch{
                        console.log('2');
                        type = 'error';
                        msg = 'The Email is not registered with us';
                        temp_link = 'https://127.0.0.1:3000/api/users/addUsers'
                  }
                  res.status(200).send({
                        type,
                        msg,
                        temp_link
                  })
            })
      })
  })





/* update password to database */
router.post('/update-password/:token', function(req, res, next) {
 
      // var token = req.body.token;
      var token = req.params.token
      var password = req.body.password;
   
      req.getConnection(async function(error, conn){
            conn.query('SELECT * FROM users WHERE token = "' + token + '"', function(err, result){
                  if (err) throw err;
   
            var type
            var msg
   
            if (result.length > 0) {
                        
                  var saltRounds = 10;
      
                  // var hash = bcrypt.hash(password, saltRounds);
      
                  bcrypt.genSalt(saltRounds, function(err, salt) {
                        bcrypt.hash(password, salt, function(err, hash) {
      
                        var data = {
                              password: hash
                        }
      
                        conn.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
                              if(err) throw err
                        
                        });
      
                        });
                  });
      
                  type = 'success';
                  msg = 'Your password has been updated successfully';
                  
            } else {
      
                  console.log('2');
                  type = 'success';
                  msg = 'Invalid link; please try again';
      
                  }
            
            res.status(200).send({
                  type,
                  msg
            })
            })
      })
  })











module.exports = router
