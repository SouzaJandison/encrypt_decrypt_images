const express = require('express')
const multer = require('multer')

const fs = require('fs')
const crypto = require('crypto')
const Path = require('path')
const { promisify } = require('util')

const multerConfig = require('./config/multer')

const routes = express.Router()

const alg = 'aes-256-cbc'

routes.post('/', multer(multerConfig).single('file'), async (request, response) => {
    const { filename, path } = request.file
    const { option, password } = request.body
    
    const handlerFile = option === 'encrypt' ? await encrypt(filename, path, password) : await decrypt(filename, path, password)
    
    deleteFile('uploads', filename)

    return response.json(handlerFile)
})

function encrypt(filename, path, password) {
    return new Promise((resolve, reject) => {
        const read = fs.createReadStream(path)
        const write = fs.createWriteStream(`./tmp/encrypt/${filename}`)
        const cipher = crypto.createCipher(alg, password)

        read.pipe(cipher).pipe(write)
            .on('finish', () => {
                let imageFile = fs.readFileSync(Path.resolve(__dirname, '..', 'tmp', 'encrypt', filename))
                let encoded = Buffer.from(imageFile).toString('base64')
                deleteFile('encrypt', filename)
                return resolve({
                    url: `data:image/png;base64,${encoded}`,
                    name: `encrypt-${filename}`
                })
            })
            .on('error', reject)
    })
}

function decrypt(filename, path, password) {
    return new Promise((resolve, reject) => {
        const read = fs.createReadStream(path)
        const write = fs.createWriteStream(`./tmp/decrypt/${filename}`)
        const cipher = crypto.createDecipher(alg, password)

        read.pipe(cipher).pipe(write)
            .on('finish', () => {
                let imageFile = fs.readFileSync(Path.resolve(__dirname, '..', 'tmp', 'decrypt', filename))
                let encoded = Buffer.from(imageFile).toString('base64')
                deleteFile('decrypt', filename)
                return resolve({
                    url: `data:image/png;base64,${encoded}`,
                    name: `decrypt-${filename}`
                })
            })
            .on('error', reject(new Error('DEU RUIM DE VERDADE!!!')))
    })
}

function deleteFile(folder, name) {
    promisify(fs.unlink)
            (Path.resolve(__dirname, '..', 'tmp', folder, name))
}

module.exports = routes