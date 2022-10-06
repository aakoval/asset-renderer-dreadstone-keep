'use strict'

const path = require('path');
const nftHelper = require('../../helpers/nft')

class NFTController {
  async get (req, res, next) {
    const { type, id } = req.params
    const { width = 200, height = 200 } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }

    if (type === 'avatar') {
      const nft = await nftHelper.get(type, id);
      console.log('nfft', nft);
      res.setHeader('Content-Type', 'image/svg+xml');
      if (type === 'avatar') {
        res.render('layouts/avatar', {
          layout: 'avatar.hbs',
          ...nft,
          width: width,
          height: height
        })
      }
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
