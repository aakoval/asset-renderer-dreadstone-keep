'use strict'

const path = require('path');
const fs = require('fs')
const { readdir } = require('fs/promises');
const sharp = require('sharp')
const nftHelper = require('../../helpers/nft')

class NFTController {
  async get (req, res, next) {
    const { type, id } = req.params
    const { width, height } = req.query

    // if (width || height) {
    //   sharp().resize()
    // }
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }

    const folderPath = path.resolve(`resources/${type}/`)

    const files = await readdir(folderPath)

    const filename = files.find((f) => f.startsWith(`${id}.`))

    const filePath = path.resolve(`resources/${type}/${filename}`)
    
    const nft = await nftHelper.get(type, id)
    console.log(nft)

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath)
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
