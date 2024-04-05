const fs = require("fs");
const AWS = require("aws-sdk");

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;


async function S3UploadImage(
  fileContent,
  uploadName,
  key,
  fileType,
  uploadPath
) {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
      region: process.env.AWS_REGION,
    });
    const currentTime = Date.now();
    const urlsArray = [];
console.log("key is...", key)
    let folder = '';
    if (key === 'profile') {
      folder = 'profileimage';
    } else {
      folder = 'cardsimages';
    }
 
    console.log("fileContent is...", s3);
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:`${folder}/${uploadName}`,
      Body: fileContent,
    };
    const { Location, Key } = await s3.upload(params).promise();
    console.log("Location is...", Location);
    urlsArray.push({ Location, Key });

    return {
      status: true,
      msg: `All files uploaded successfully.`,
      url: urlsArray,
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      msg: err.message,
    };
  }
}

module.exports = S3UploadImage;
