const path = require("path");
const s3Upload = require("../../../helpers/s3Upload");
const profileImgUploader = async (req, res, next) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let img = req.files.profileImg;
      let imgTypes = ["jpg", "jpeg", "png","gif","JPG", "JPEG", "PNG","GIF"];
      let fileDetail = img.name.split(".");
      let imgType = fileDetail[fileDetail.length - 1];
      img.name = new Date().getTime() + "." + imgType;
     
      let typeCheck = false;
      typeCheck = imgTypes.includes(imgType);
      console.log(typeCheck);
      if (typeCheck) {

        // for later use
          const S3imageURL = await s3Upload(img.data, img.name, "profile", imgType, "profileImage");
          console.log("S3imageURL is...", S3imageURL);


        // img.mv(path.join(__dirname, "../../public/uploads/") + img.name);
        req.name =S3imageURL.url[0].Key;
         next();
      } else {
        res.send({
          message: "invalid img file format",
          status: false,
        });
      }
      
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = { profileImgUploader };
