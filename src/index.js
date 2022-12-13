const express = require('express');
const mongoose = require('mongoose');
const route = require('./router/routes.js')
mongoose.set('strictQuery', false);
const app = express();

app.use(express.json());
const DB="mongodb+srv://ravisingh007ravi:Ravi1234@cluster0.w9hbwbb.mongodb.net/shortURL?retryWrites=true&w=majority"

mongoose.connect(DB, {useNewUrlParser : true})
.then(()=>{ console.log("MongoDb connected 😎😎")})
.catch(err=>{ console.log(err)});

app.use("/",route)

app.listen(process.env.PORT || 3000, ()=>{
    console.log('Running on port '+ (process.env.PORT || 3000))
});