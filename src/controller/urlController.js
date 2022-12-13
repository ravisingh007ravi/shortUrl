const shortid = require('shortid');
const urlModel = require('../model/urlModel');
const axios = require("axios")


//<----------------this APi for Create Short URL--------->//
const shortUrl = async (req, res) => {

    try {
        const longUrl = req.body.longUrl

        if (!longUrl) return res.status(400).send({ msg: "Body is empty so provide some same data like longURL" })

        let checkurl = await urlModel.findOne({ longUrl: longUrl })
        if (checkurl) return res.status(400).send({ msg: "that url already present" })

        let urlfound = false;
        let url = { method: 'get', url: longUrl };

        await axios(url)
            .then((result) => {
                if (result.status == 201 || result.status == 200)
                    urlfound = true;
            })
            .catch((err) => { });

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
        const paramData = req.params.urlCode;

        const urlData = await urlModel.findOne({ urlCode: paramData });

        console.log(urlData, paramData)
        if (!urlData) return res.status(400).send({ msg: "Invalid urlCode pls provide right urlCode" })

        const longUrl = urlData.longUrl

        return res.redirect(longUrl)
    }
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}


module.exports = { shortUrl, activeShorturl }
