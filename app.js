var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongoose = require('mongoose')
var imgSchema = require('./model.js');
var fs = require('fs');
var path = require('path');
app.set("view engine", "ejs");
require('dotenv').config();
//set public as static 
app.use(express.static('public'));
//connect to mongodb
mongoose.connect(process.env.MONGO_URL)
    .then(console.log("DB Connected"))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

app.get('/', (req, res) => {
    imgSchema.find({})
        .then((data, err) => {
            if (err) {
                console.log(err);
            }
            res.render('imagepage');
        })
});


app.post('/', upload.single('image'), (req, res) => {

    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgSchema.create(obj)
        .then((err, item) => {
            if (err) {
                console.log(err);
            }
            else {
                item.save();
                // res.sendFile('Uploaded successfully');
            }
        });
});

app.get('/hold', (req, res) => {
    imgSchema.find({})
        .then((data, err) => {
            if (err) {
                console.log(err);
            }
            res.render('uploadedImg', { items: data })
        })
});

var port = process.env.PORT || '3000'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})