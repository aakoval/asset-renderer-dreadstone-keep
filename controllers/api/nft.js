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
    if (type === 'item') {
      nft = await nftHelper.get(type, id);
      res.setHeader('Content-Type', 'image/svg+xml')
      res.render("animated", {
        color: nft?.color || '#FFD011',
        type: nft?.type?.name || 'Earth',
        width: width,
        height: height,
        deltaX: width / 100 * 50,
        deltaY: height / 100 * 50
    })
    } else if (fs.existsSync(filePath)) {
      res.sendFile(filePath)
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
