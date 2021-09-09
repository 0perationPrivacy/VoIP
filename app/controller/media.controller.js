var Media = require('../model/media.model');
const multer = require("multer")
const path = require("path")
const crypto = require('crypto')
const moment = require('moment')
const fs = require("fs")

var storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        var date = moment(new Date()).format('MMDDYYYY');
        try {
            await fs.promises.access("./uploads/"+date);
        }catch (e) {
            await fs.promises.mkdir('./uploads/'+date)
        }
        // Uploads is the Upload_folder_name
        cb(null, `./uploads/${date}/`)
        // cb(null, path.join(__dirname, '../../../uploads/'));
    },
    filename: function (req, file, cb) {
        var filename = crypto.randomBytes(24).toString('hex');
        cb(null, filename);
        // cb(null, new Date().toISOString().replace(/:/g, '-')+".jpg")
    }
})

const maxSize = 1000 * 1000 * 1000;

var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|gif|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
  
// mypic is the name of file attribute
}).single("file"); 


exports.fileUpload = async (req, res) => {
    upload(req,res,async function(err) {
        if(err) {
            res.send(err)
        }
        else {
            var date = moment(new Date()).format('MMDDYYYY');
            var mediaData = {media:`uploads/${date}/${req.file.filename}`, user:req.user.id};

            var media = await Media.create(mediaData);
            if(media){
                media.media = `${process.env.BASE_URL.trim()}${media.media}`
                res.send({status:true, message:'Media upload!', data:media});
            }else{
                res.status(400).json({status:'false',message:'Media not uploaded!'}); 
            }
        }
    })
};

var cron = require('node-cron');
// cron job runs every day at 01:00
cron.schedule('0 1 * * *', () => {
    console.log('running a task every day at 01:00');
    var startdate = moment();
    startdate = startdate.subtract(7, "days");
    startdate = startdate.format("DDMMYYYY");
    try {
        fs.rmdirSync("./uploads/"+startdate, { recursive: true });
    }catch (e) {
        console.log('folder not found')
    }
});
exports.deleteMedia = async (req, res) => {
    var startdate = moment();
    startdate = startdate.subtract(7, "days");
    startdate = startdate.format("DDMMYYYY");
    try {
        fs.rmdirSync("./uploads/"+startdate, { recursive: true });
    }catch (e) {
        console.log('folder not found')
    }
};