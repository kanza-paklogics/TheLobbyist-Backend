
const AWS = require("aws-sdk");
// Enter copied or downloaded access ID and secret key here
// The name of the bucket that you have created
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function s3DeleteImage(fileName){
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
      region: process.env.AWS_REGION,
    });
    console.log("fileName is...", fileName);
    
    console.log( "testingImages/" + fileName)
    const params = {
       Bucket: process.env.AWS_BUCKET_NAME,
      Key: "cardsimages/" + fileName, // File name you want to delete from S3
    };
    // Deleting file from the bucket
    console.log("params are...", params);
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log(`File deleted successfully. ${data}`);
      resolve(data);
    });
  });
};
module.exports = s3DeleteImage;