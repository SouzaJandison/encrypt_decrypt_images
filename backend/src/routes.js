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
    try {
        const { filename, path } = request.file
        const { option, password } = request.body
        
        const handlerFile = option === 'encrypt' 
            ? await encrypt(filename, path, password) 
            : await decrypt(filename, path, password)

        return response.json(handlerFile)
    } catch (error) {
        console.log('FAIL', error)
        return response.status(400).json(error)
    }
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
                deleteFile('uploads', filename)
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

        read.pipe(cipher)
            .on('error', (error) => {
                deleteFile('uploads', filename)
                deleteFile('decrypt', filename)
                reject(error)
            })
            .pipe(write)
                .on('finish', () => {
                    let imageFile = fs.readFileSync(Path.resolve(__dirname, '..', 'tmp', 'decrypt', filename))
                    let encoded = Buffer.from(imageFile).toString('base64')
                    deleteFile('uploads', filename)
                    deleteFile('decrypt', filename)
                    return resolve({
                        url: `data:image/png;base64,${encoded}`,
                        name: `decrypt-${filename}`
                    })
                })
    }).catch(() => {
        throw {
            error: 'Error',
            message: 'Senha Incorreta!'
        }
    })
}

function deleteFile(folder, name) {
    promisify(fs.unlink)
            (Path.resolve(__dirname, '..', 'tmp', folder, name))
}

module.exports = routes