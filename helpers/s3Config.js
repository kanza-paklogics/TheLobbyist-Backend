// const AWS = require("aws-sdk");


// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
//     region: process.env.AWS_REGION,
//   });
 

//   module.exports = s3;


const AWS = require("aws-sdk");

const createS3Client = () => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
  });

  return s3;
};

module.exports = createS3Client;
