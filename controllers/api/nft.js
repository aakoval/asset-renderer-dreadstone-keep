'use strict'
const Web3 = require('web3');
const path = require('path');
const fs = require('fs')
const { readdir } = require('fs/promises');
const sharp = require('sharp')

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
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath)
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

module.exports = new NFTController()
