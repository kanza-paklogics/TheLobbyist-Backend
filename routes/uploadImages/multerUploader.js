const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads/"));
  },
  filename: function (req, file, cb) {
    // const imgName = path.join(__dirname, "../../public/uploads/") + file.original;
    cb(null, Date.now() + "-" + file.originalname);
    // cb(null, imgName);
  },
});


const uploadCardImg = multer({ storage : storage});

module.exports = uploadCardImg;
