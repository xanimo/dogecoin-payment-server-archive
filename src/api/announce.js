const express = require('express')

const AnnounceMessage = require('./models/announce')
const { initKeyPair, importaddress } = require('../util')


const router = express.Router();

router.post('/', (req, res) => {
    // Express is able to catch error and send the message on its own;
    const keyPair = initKeyPair(process.env.PRIVATE_KEY)
    const pubkey = keyPair.publicKey.toString('hex')

    const announcemsg = AnnounceMessage.fromObject(req.body)
    announcemsg.validate(pubkey)

    // Import the address to our dogecoin node
    importaddress(this.redeemScript)
        .then(function (res) {
            console.log(res)
        })

    return res.send()
})

module.exports = router;
