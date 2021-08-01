const express = require('express');
const app = express();
const port = 8000;
var bodyParser = require('body-parser');

// parser backend material
const upload = require('express-fileupload')
const pdfparese = require('pdf-parse')
const fs = require('fs')
const csv = require('fast-csv')

app.use(upload())
app.use(express.json())

// for data base connection
const db = require('./config/mongoose');
const Applicant = require('./models/applicant');

// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// to link css/js/image file
app.use(express.static(__dirname + '/assets'));

app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res){
    
    return res.render('index', {
    });
});

app.get('/jobList', function(req, res){
    return res.render('jobList', {
    });
});

app.get('/details', function(req, res){
    return res.render('details', {
    });
});

app.get('/uploadResume',  function(req, res){
    res.sendFile(__dirname + '/index')
    return res.render('uploadResume', {
    });
});

app.get('/adminPage', function(req, res){

    Applicant.find({}, function(err, applicants){
        if(err){
            console.log("error in fetching applicants from db");
            return;
        }
        return res.render('adminPage',{
            applicant_list: applicants
        });

    })

});

app.post('/create_applicant',  function(req, res){
    console.log('post successfull')
    Applicant.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender
    }, function(err, newApplicant){
        if(err){console.log('Error in creating a applicant!')
            return;}
            console.log('******', newApplicant);
            return res.redirect('uploadResume');
    })
});

// parser backend
app.post('/uploadResume', (req, res) => {
    if (req.files) {
        console.log(req.files)
        let email
        let linked
        let pno
        let textlin
        let tectle
            //res.send(req.files)
        req.files.file.mv('/uploadResume' + req.files.file.name, (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                const pdffile = fs.readFileSync(req.files.file.name)
                pdfparese(pdffile).then((data) => {
                        console.log(data)
                        email = data.text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
                        linked = data.text.match(/(linkedin\.com\/in\/[A-z0-9_-]+)/gi)
                        pno = data.text.match(/([6789]\d\d\d\d\d\d\d\d\d+)/gi)
                        textlin = data.text.split(/\r\n|\r|\n/).length;
                        tectle = data.text.length - 2 * textlin;



                    }).then(() => {
                        var ws = fs.createWriteStream('details.csv');
                        csv.write([
                                ['emailid', email],
                                ["linkedin", linked],
                                ["phoneNo", pno],
                                ["textLines", textlin],
                                ["textLength", tectle]
                            ], { headers: true }

                        ).pipe(ws)

                    })
                    .catch((err) => {
                        res.send(err)
                    })
                res.sendFile(__dirname + '/adminPage')
                    // res.send('done')

            }
        })
    } else
        res.sendFile('not find');
});

// excel detail download
app.post('/downloadexcel', (req, res) => {
    res.download('details.csv')
});

// pdf resume download
app.post('/downloadpdf', (req, res) => {
    res.download('Resume.pdf')
});

// setting port
app.listen(port, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running on port: ${port}`);
});
