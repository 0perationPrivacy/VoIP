var Media = require('../model/media.model');
const multer = require("multer")
const path = require("path")
const crypto = require('crypto');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "./uploads/")
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
        var filetypes = /jpeg|jpg|png/;
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
            var mediaData = {media:`uploads/${req.file.filename}`, user:req.user.id};

            var media = await Media.create(mediaData);
            if(media){
                media.media = `${process.env.BASE_URL.trim()}${media.media}`
                res.send({status:true, message:'Media upload!', data:media});
            }else{
                res.status(400).json({status:'false',message:'Media not uploaded!'}); 
            }
            // SUCCESS, image successfully uploaded
            // res.send("Success, Image uploaded!")
        }
    })
};

var cron = require('node-cron');
// cron job runs every hour
/*cron.schedule('0 1 * * *', () => {
    console.log('running a task every minute');
    var fs = require('fs'); 
    var directoryPath = path.join(__dirname, '../../uploads/')
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (file) {
            console.log(file)
            var fileData = `${directoryPath}${file}`
            const { birthtime } = fs.statSync(fileData)
            console.log(birthtime); 
            now = new Date().getTime()
            var deleteTime = (3600000 * 12 * 10) // deletes mms after 10 days
            endTime = new Date(birthtime).getTime() + deleteTime;
            console.log(deleteTime)
            console.log(endTime)
            if(now > endTime){
                fs.unlinkSync(fileData);
            }
        });
    });
});*/
exports.deleteMedia = async (req, res) => {
    
    res.send({test:'test'});
};