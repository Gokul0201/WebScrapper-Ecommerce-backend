var express = require('express');
var router = express.Router();
var dotenv=require('dotenv').config();
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const secret=process.env.JWTsecretKey;
const { dbName, dbUrl, mongodb, MongoClient } = require("../Configdb");
const client = new MongoClient(dbUrl);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt)
    req.body.password = hash
    await db.collection("registered_users").insertOne(req.body);
    res.send({
         statusCode: 201,
         message: 'User registered successfully.'
    })
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});

//login
router.post('/login', async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);
    //check if user exists
    let user = await db.collection('registered_users').findOne({username:req.body.username});

    if(user)
    {
    //check if the password matches
    let hashResult = await bcryptjs.compare(req.body.password,user.password)
      if(hashResult)
      {
        let token = jwt.sign({_id:user._id},secret);
        res.send({
          statusCode: 200,
          message:"User Logged in Successfully",
          token,
          hashResult,
        
        })
      }
      else
      {
        res.send({
          statusCode: 401,
          message:"Invalid Credentials",
        })
      }
    }
    else
    {
      res.send({
        statusCode: 401,
        message:"User Does Not Exist",
      })
    }
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});


module.exports = router;
