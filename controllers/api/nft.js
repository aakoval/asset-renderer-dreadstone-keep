'use strict'

const path = require('path');
const fs = require('fs')
const { readdir } = require('fs/promises');
const sharp = require('sharp')
const nftHelper = require('../../helpers/nft')

class NFTController {
  async get (req, res, next) {
    const { type, id } = req.params
    const { width = 200, height = 200 } = req.query

    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }

    const folderPath = path.resolve(`resources/${type}/`)

    const files = await readdir(folderPath)

    const filename = files.find((f) => f.startsWith(`${id}.`))
    const filePath = path.resolve(`resources/${type}/${filename}`)
    let nft;
    if (type === 'item' || type === 'avatar') {
      nft = await nftHelper.get(type, id);
      res.setHeader('Content-Type', 'image/svg+xml');
      if (type === 'item') {
        res.render("animated", {
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
      console.log('nftnftnft', nft);
      if (type === 'avatar') {
        res.render("avatar", {...nft})
      }
      
    } else if (fs.existsSync(filePath)) {
      res.sendFile(filePath)
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
