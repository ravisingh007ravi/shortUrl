const express= require('express');
const router = express.Router();
const { shortUrl, activeShorturl } = require('../controller/urlController')


//<----------------this APi for Create Short URL--------->//
router.post('/url/shorten', shortUrl);
//<----------------this APi for get Short URL------------>//
router.get('/:urlCode', activeShorturl)
//<----------------this APi for Check the Path Name------>//
router.all("/*",(req,res)=>{
    return res.status(400).send({status:false,message:"Given path are not found !!!"})
})


module.exports= router