const express = require('express');
const { Server } = require('ws');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
var fruitNames;


const User = require('./user.js'); // Locate file

const PORT = process.env.PORT || 3000; //port for https

const server = express()
    .use((req, res) => res.send("Hello, you!"))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
const uri = 'mongodb+srv://Cedric:Ced%40Mongo@cluster0.u5gptbl.mongodb.net/pharmart?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));

process.on('unhandledRejection', (err) => {
    console.log('Unhandled rejection:', err);
  });
  
  process.on('uncaughtException', (err) => {
    console.log('Uncaught exception:', err);
  });
  


db.on('error', (err) => {
    console.log('Mongoose connection error:', err);
  });
db.once('open', function() {
  console.log("Connected successfully to MongoDB");
  
  
  mongoose.set('strictQuery', false);
});


wss.on('connection', function(ws, req) {
    // create();
    ws.on('message', message => { // If there is any message
        // let datastring = "";
        var datastring = message.toString();
        // console.log(dataString);

        
        
        if(datastring.charAt(0) == "{"){ // Check if message starts with '{' to check if it's json
            datastring = datastring.replace(/\'/g, '"');
            var data = JSON.parse(datastring);
            console.log(data)
            if(data.auth == "chatappauthkey231r4"){

               
                // TODO: Create login function
                if (data.cmd === 'signup'){ // On Signup
                    console.log('saving...2');
                    // If mail doesn't exists it will return null
                    User.findOne({email: data.email}).then((mail) => {
                        console.log(data.email)
                        console.log('saving...3');
                        // Check if email doesn't exist.
                        if (mail == null){
                            console.log('saving...4');
                            User.findOne({username: data.username}).then((user) => {
                                console.log('saving...5');
                                    // Check if username doesn't exists.
                                    if (user == null){
                                        console.log('saving...6');
                                        const hash = crypto.createHash("md5")
                                        let hexPwd = hash.update(data.hash).digest('hex');
                                        var signupData = "{'cmd':'"+data.cmd+"','status':'succes'}";
                                        const user = new User({
                                            email: data.email,
                                            username: data.username,
                                            password: hexPwd,
                                            phoneNumber: data.phoneNumber
                                        });
                                        console.log('saving...7');
                                        // const User = mongoose.model('User', userSchema, 'users');
                                        // Insert new user in db
                                        user.save().then((savedUser) => {
                                            console.log('User saved successfully:', savedUser);
                                            var signupData = "{'cmd':'"+data.cmd+"','status':'success'}";
                                            // Send info to user
                                            ws.send(signupData);
                                        }).catch((error) => {
                                            console.error('Error saving user:', error);
                                            // Send error message to user
                                            var signupData = "{'cmd':'"+data.cmd+"','status':'error_saving_user'}";
                                            ws.send(signupData);
                                        });
                                } else{
                                    console.log('user exists');
                                    // Send error message to user.
                                    var signupData = "{'cmd':'"+data.cmd+"','status':'user_exists'}";  
                                    ws.send(signupData);  
                                }
                            });
                        } else{
                            console.log('email exists');
                            // Send error message to user.
                            var signupData = "{'cmd':'"+data.cmd+"','status':'mail_exists'}";    
                            ws.send(signupData);
                        }
                    });
                }


    if (data.cmd === 'healthtip') {
      console.log('saving...from home page');
      console.log(data);

      const collection = db.collection('health_tip');
      const cursor = collection.aggregate([{ $sample: { size: 1 } }]);

      cursor.forEach(
        (doc) => {
          console.log(doc);
          const resultString = JSON.stringify(doc);
          console.log(resultString);
          console.log('success');
          ws.send(resultString);
        },
        (err) => {
          if (err) {
            console.log(err);
            ws.send({});
            ws.send("error");
          }
        }
      );
    }


    if (data.cmd === 'order') {
        console.log('saving...from oder page');
        console.log(data);
        const resultString = JSON.stringify(data)
        ws.send(resultString);
        fruitNames = resultString;
      }


      if (data.cmd === 'getorder') {
        console.log('saving...from getoder page');
        ws.send(fruitNames);
      }






                if (data.cmd === 'login'){ // On Signin
                    console.log('saving...a');
                    console.log(data);
                    // Check if email exists 
                    User.findOne({email: data.email}).then((r) => {
                        console.log('saving...b');
                        // If email doesn't exists it will return null
                        if (r != null){
                            console.log('saving...bccc');
                            const hash = crypto.createHash("md5")
                            // Hash password to md5
                            let hexPwd = hash.update(data.hash).digest('hex');
                            console.log('saving...c');
                            console.log(hexPwd);
                            console.log(r.password);
                            // Check if password is correct
                            if (hexPwd == r.password) {
                                console.log('success');
                                // Send username to user and status code is succes.
                                var loginData = '{"username" : "' +r.username+ '", "status":"succes", "phoneNumber" : "' +r.phoneNumber+ '"}';
                                // Send data back to user
                                ws.send(loginData);
                            } else{
                                // Send error
                                console.log("Wrong password")
                                var loginData = '{"cmd":"'+data.cmd+'","status":"wrong_pass"}';
                                ws.send(loginData);
                            }
                        } else{
                            // Send error
                            console.log("Wrong email")
                            var loginData = '{"cmd":"'+data.cmd+'","status":"wrong_mail"}';
                            ws.send(loginData);
                        }
                    });
                } 



                app.post('/submit-form', (req, res) => {
                    const data = req.body.data; // Retrieve the submitted data from the request body
                    // Do something with the data, such as save it to a database or process it in some way
                    res.send('Data submitted successfully!'); // Send a response to indicate that the data was submitted successfully
                console.log('html');  
                });





            }
        }
    }) 
})
