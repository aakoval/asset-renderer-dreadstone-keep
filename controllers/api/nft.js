'use strict'

const path = require('path');
const fs = require('fs')
const { readdir } = require('fs/promises');
const nftHelper = require('../../helpers/nft')

class NFTController {
  async get (req, res, next) {
    const { type, id } = req.params
    const { width = 200, height = 200 } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }

    if (type === 'item' || type === 'avatar') {
      const nft = await nftHelper.get(type, id);
      console.log('nfft', nft);
      res.setHeader('Content-Type', 'image/svg+xml');
      if (type === 'item') {
        res.render('layouts/item', {
          layout: 'item.hbs',
          color: nft?.color || '#FFD011',
          typeColor1: nft?.typeColors[0],
          typeColor2: nft?.typeColors[1],
          typeColor3: nft?.typeColors[2],
          width: width,
          height: height,
          deltaX: width / 100 * 50,
          deltaY: height / 100 * 50
      })
      }
      if (type === 'avatar') {
        res.render('layouts/avatar', {
          layout: 'avatar.hbs',
          ...nft,
          width: width,
          height: height
        })
      }
    } else if (type === 'gem') {
      const folderPath = path.resolve(`resources/${type}/`)
      const files = await readdir(folderPath)
      const filename = files.find((f) => f.startsWith(`${id}.`));
      const filePath = path.resolve(`resources/${type}/${filename}`);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath)
      } else {
        res.status(404).json({ error: 'File not found' })
      }
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
