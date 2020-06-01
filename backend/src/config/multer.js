const multer = require('multer')
const path = require('path')

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: multer.diskStorage({
        destination: (request, file, callback) => {
            callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
        },
        filename: (request, file, callback) => {
            callback(null, file.originalname)
        }
    }),
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (request, file, callback) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ]
        if(allowedMimes.includes(file.mimetype)) {
            callback(null, true)
        } else {
            callback(new Error('Invalid file type.'))
        }
    }
}