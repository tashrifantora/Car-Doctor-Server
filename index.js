const express = require('express');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require ('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5006;

// Middle ware
 app.use(cors({
  origin: [
    // 'http://localhost:5173'
    'https://car-doctor-9a2cf.web.app',
     'https://car-doctor-9a2cf.firebaseapp.com/'
  
  ],
  credentials: true
 }));
 app.use(express.json());
 app.use(cookieParser());

 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.gsyh7hk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

/* 
====||====||====||====||====||
    OWN Made Middle Ware
====||====||====||====||====||
*/
  const logger = (req,res, next)=>{
    console.log('logInfo:', req.method, req.url)
    next();
  }



  // TOKEN Verification 
  const verifyToken =(req,res, next)=>{
    const token = req.cookies?.token;
    // console.log('token in the middlewere', token)
      if(!token){
        return res.status(401).send({message: "Unauthorized access"})
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message: "Unauthorised Access"})
        }
        req.user= decoded;
        next();
      })

  }




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

const servicesCollection = client.db('CarDoctor').collection('services');
const BookingCollection = client.db('CarDoctor').collection('bookings');


/* 
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
     JWT + TOKEN
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
*/
   app.post('/jwt', async(req, res)=>{
     const user = req.body;
     console.log('User for token', user)
     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : "5h"})
     res
     .cookie('token', token,{
      httpOnly: true,
      secure:true
     })
     .send({success:true});
   })

   /* 
   ======================
    for removing token
  =======================
   */
  app.post('/logout', async( req,res)=>{
    const user = req.body;
    console.log('Log out user:', user)
    res.clearCookie('token', {maxAge:0}).send({success:true})
  })


// Services Releted API
app.get('/services', async (req, res)=>{
  const cursor = servicesCollection.find();
  const result = await cursor.toArray();
  res.send(result) 
})

app.get('/services/:id', async(req, res)=>{
const id = req.params.id;
const query = {_id : new ObjectId (id)}

// Sob data load na kore kichu data load korar method
const options = {
  projection : {title: 1 , service_id : 1, price:1, img:1 }
}
const result = await servicesCollection.findOne(query,options)
res.send(result) 
})


 /*===============
     BOOKINGS 
  =================*/ 
  app.post('/bookings',logger,verifyToken, async(req,res)=>{
    const booking = req.body;
    console.log(booking)
    const result = await BookingCollection.insertOne(booking)
    res.send(result)
  })

  // Get Method withOut ID
  app.get('/bookings',logger,verifyToken, async (req, res)=>{
   console.log('tok owner info',req.user)
   if(req.user.email !== req.query.email){
    return res.status(403).send({message: "Forbidden Access"})
   }
    // Search by email
    let query = {};
    if(req.query?.email){
      query = {email: req.query.email}
    }
    const result = await BookingCollection.find(query).toArray();
    res.send(result)
  })
    
  
  // DELETE Methode
  app.delete('/bookings/:id', async(req,res)=>{
    const id= req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await BookingCollection.deleteOne(query);
    res.send(result)
  })


  // UPDATE Methode
  app.patch('/bookings/:id', async(req, res)=>{
    const id = req.params.id;
    const filter ={_id: new ObjectId(id)}
    const updatedBooking = req.body;
    console.log(updatedBooking)
    const updateDoc = {
      $set: {
        status:  updatedBooking.status
      },
    };
    const result = await BookingCollection.updateOne(filter, updateDoc);
    res.send(result)
    
  })


    // Send a ping to confirm a successful connection
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




 app.get('/', async(req, res)=>{
      res.send('car doctor is running')
 })

 app.listen(port, async (req, res)=>{
  console.log(`cars doctor is rinning on port : ${port} `)
 })



 // Auth/JTW+ Cookie releted
/* app.post('/jwt', logger, async(req, res)=>{
  const user = req.body;
  console.log(user)
  const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
  res
  .cookie('token',token,{
    httpOnly: true,
    secure: false,
    // sameSite: 'none'
  } )
  .send({success:true})
}) */


// Middle ware by OWn
/* const logger = async(req,res,next)=>{
  console.log('Called:', req.host, req.originalUrl);
  next();
} */


// Varify token
/* const verifyToken = async (req,res,next)=>{
  const token = req.cookies.token;

  if(!token){
    return res.status().send({message: 'Not Authorized'})
  }
  next()
} */