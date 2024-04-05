const path = require("path");
const s3Upload = require("../../helpers/s3Upload");

/**
 *  function chekFileType()
 *  CHECK THE FILE TYPE OF EACH IMG UPLOADED
 *  RETURN TRUE & FALSE
 */
const chekFileType = (img) => {
  let imgTypes = ["jpg", "jpeg", "png"];
  let fileDetail = img.name.split(".");
  let imgType = fileDetail[fileDetail.length - 1];
  img.name = new Date().getTime() + "." + imgType;
  // console.log(img.name);
  // console.log(fileType[fileType.length-1])
  //Use the mv() method to place the file in the upload directory (i.e. "uploads")
  let typeCheck = false;
  typeCheck = imgTypes.includes(imgType);

  return typeCheck;
};

/** END OF checkFileType */

const cardImageUploader = async (req, res, next) => {

  try {
    console.log("req files", req.files);
    console.log("req file", req.file);
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let img = req?.files?.card_image;

      let imgTypes = ["jpg", "jpeg", "png"];
      let fileDetail = img.name.split(".");
      let imgType = fileDetail[fileDetail.length - 1];
      img.name = new Date().getTime() + "." + imgType;
      console.log(img.name);
      // console.log(fileType[fileType.length-1])
      // Use the mv() method to place the file in the upload directory (i.e. "uploads")
      /** *** */
      let typeCheck = false;
      typeCheck = imgTypes.includes(imgType);
      // typeCheck = chekFileType(img);

      if (typeCheck) {
        // "/home/ubuntu/Images/" + sampleFile.name

        // img.mv("/home/ubuntu/Flask_API/Cards/" + img.name);

        // req.name = path.join("/uploads/" + img.name);
        const S3imageURL = await s3Upload(img.data, img.name,"card", );
        console.log("S3imageURL is...", S3imageURL);
        console.log("S3imageURL.url.Key", S3imageURL.url[0].Key);

        return res.send({
          status: true,
          imagePath:S3imageURL.url[0].Key,
        });
        // next();
      } else {
        return res.send({
          message: "invalid img file format",
          status: false,
        });
      }
      /** *** */
      return res.send({
        message: "invalid img file format",
        status: false,
      });
      //send response
      // res.send({
      //   status: true,
      //   message: "File is uploaded",
      //   data: {
      //     img: avatar.img,
      //     mimetype: img.mimetype,
      //     size: img.size,
      //   },
      // });
      // const file = req.files.card_images;
      // const data = [];

      // function move(image) {
      //   try {
      //     image.mv(
      //       path.join(__dirname, "../../app/public/uploads/") + img.name

      //     );
      //     req.card_image = path.join("/uploads/" + img.name);
      //   } catch (e) {
      //     return res.send({
      //       success: false,
      //       message: "upload error",
      //     });
      //   }

      //   data.push({
      //     name: image.name,
      //     mimeType: image.mimetype,
      //     size: image.size,
      //   });
      // }

      // Array.isArray(file) ? file.forEach((file) => move(file)) : move(file);
    }
    // req.data = data?.map(({ name }) => {card_name: name});
    // next();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = { cardImageUploader };
