const shortid = require('shortid');
const urlModel = require('../model/urlModel.js');
const Validations = require('../validation/valid.js')
const axios = require("axios")
const redis = require("redis");
const { promisify } = require("util");

const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", (err) => {
  if (err) throw err;
});

redisClient.on("connect", async () => {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



//<----------------this APi for Create Short URL--------->//
const shortUrl = async (req, res) => {

  try {
    const longUrl = req.body.longUrl
    const data = req.body
    if (!longUrl) return res.status(400).send({ status: false, message: "longUrl must be present" })

    longUrl.trim()

    if (!(Validations.isValidString(longUrl))) return res.status(400).send({ status: false, message: "Pls provide a URL" })
    
    let cahcedProfileData = await GET_ASYNC(longUrl)

    let data1 = JSON.parse(cahcedProfileData)

    if (data1) return res.status(201).send({ status: true, message: "url is already shorted", data: data1 })
    
    else {

    let urlfound = false;
    let url = { method: 'get', url: longUrl };

    await axios(url)
      .then((result) => {
        if (result.status == 201 || result.status == 200)
          urlfound = true;
      })
      .catch((err) => {console.log(err) });

    if (urlfound == false) return res.status(400).send({ msg: "URL is not correct" })
      
      let urlCode = shortid.generate(longUrl);

      data.shortUrl = `http://localhost:3000/${urlCode}`
      data.urlCode = urlCode

      const createURL = await urlModel.create(data);

      let urlData = {
        longUrl: createURL.longUrl,
        shortUrl:createURL.shortUrl,
        urlCode:createURL.urlCode
      }

      await SET_ASYNC(longUrl,1440, JSON.stringify(urlData))

      return res.status(201).send({ status: true, data: urlData });
    }
  }
  catch (error) {return res.status(500).send({ msg: error.message })}
}


//<----------------this APi for get Short URL------------>//
const activeShorturl = async (req, res) => {

  try {

    let urlCode = req.params.urlCode

    let cahcedProfileData = await GET_ASYNC(urlCode)

    if (cahcedProfileData != null) {
      let data = JSON.parse(cahcedProfileData)
      let longUrl = data.longUrl

    return res.status(302).redirect(longUrl)
    }
     else 
     {
      let profile = await urlModel.findOne({ urlCode: urlCode });
      if (profile == null) {
        return res.status(404).send({ status: false, message: "urlcode is not registered" })
      }
      let longUrl = profile.longUrl
      await SET_ASYNC(urlCode,1440, JSON.stringify(profile))

      return res.status(302).redirect(longUrl)

    }
  }
  catch (error) {return res.status(500).send({ msg: error.message })}
}

module.exports = { shortUrl, activeShorturl }
