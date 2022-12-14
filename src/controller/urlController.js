const shortid = require('shortid');
const urlModel = require('../model/urlModel');
const axios = require("axios")
const redis = require("redis");
const { promisify } = require("util");

const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



//<----------------this APi for Create Short URL--------->//
const shortUrl = async (req, res) => {

    try {
        const longUrl = req.body.longUrl

        if (!longUrl) return res.status(400).send({ msg: "Body is empty so provide some same data like longURL" })

        let checkurl = await urlModel.findOne({ longUrl: longUrl })
        if (checkurl) return res.status(400).send({ msg: "that url already present in DataBase" })

        let urlfound = false;
        let url = { method: 'get', url: longUrl };

        await axios(url)
            .then((result) => {
                if (result.status == 201 || result.status == 200)
                    urlfound = true;
            })
            .catch((err) => {});

        if (urlfound == false) return res.status(400).send({ msg: "that url is invalid" })

        const urlCode = shortid.generate()

        const shortUrl = "http://localhost:3000" + "/" + urlCode;

        const urldata = {
            longUrl: longUrl.trim(),
            shortUrl: shortUrl,
            urlCode: urlCode
        }
        const createurl = await urlModel.create(urldata)
        return res.status(200).send({ status: true, data: urldata })
    }
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}


//<----------------this APi for get Short URL------------>//
const activeShorturl = async (req, res) => {

    try {
       
        let checkUrldata = await GET_ASYNC(`${req.params.urlCode}`)
        if(checkUrldata) {
          res.send(checkUrldata)
        } else {
          let profile = await urlModel.findOne(req.params.authorId);
          if (!profile) return res.status(400).send({ msg: "Invalid urlCode pls provide right urlCode" })
          const longUrl = profile.longUrl
          return res.redirect(longUrl)
          await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(longUrl))
          res.send({ data: profile });
    }}
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}


module.exports = { shortUrl, activeShorturl }
