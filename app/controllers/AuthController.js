const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const path = require("path");
var jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
//import { fetch } from "node-fetch";
// const nodemailer = require("nodemailer");
const validator = require("validator");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const sendMail = require("../../helpers/nodeMailer");

exports.login = (req, res, next) => {
  try {
    const { User } = req.db.models;
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push("Please enter a valid email address.");
    if (validator.isEmpty(req.body.password))
      validationErrors.push("Password cannot be blank.");
    if (validationErrors.length) {
      return res
        .status(400)
        .send({ status: false, message: "Email and Password is required." });
    }
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then((user) => {
        if (user) {
          bcrypt
            .compare(req.body.password, user.password)
            .then(async (doMatch) => {
              if (doMatch) {
                // req.session.isLoggedIn = true;
                // req.session.user = .dataValues;
                // return req.session.save(err => {
                // 	console.log(err);
                // 	res.redirect('/');
                // });
                if (!user.dataValues.isVerified) {
                  return res.send({
                    status: false,
                    message:
                      "Email veification is required, verify your email and try again.",
                  });
                }
                const token = await jwt.sign(
                  {
                    data: {
                      email: user.dataValues.email,
                      userId: user.dataValues.id,
                      role_id: user.dataValues.role_id,
                    },
                  },
                  process.env.JWT_TOKEN_KEY,
                  { expiresIn: "1d" }
                );

                const refreshToken = await jwt.sign(
                  {
                    data: { userId: user.dataValues.id },
                  },
                  process.env.JWT_REFRESH_TOKEN_KEY,
                  { expiresIn: "7d" }
                );
                const { fullName, id, email,profileImg,role_id } = user.dataValues;

                return res.send({
                  status: true,
                  message: "Login successfull.",
                  token,
                  refreshToken,
                  user: { fullName, id, email,profileImg,role_id },
                });
              } else {
                return res.send({
                  status: false,
                  message: "Email or Password is incorrect.",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.send({
                status: false,
                message: "Sorry! Somethig went wrong.",
                err,
              });
            });
        } else {
          return res
            .status(200)
            .send({ status: false, message: "No user found with this email" });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Sorry! Somethig went wrong.",
          err,
        });
      });
  } catch (err) {
    return res
      .status(400)
      .send({ status: false, message: "Sorry! Somethig went wrong.", err });
  }
};

exports.logout = (req, res, next) => {
  if (res.locals.isAuthenticated) {
    req.session.destroy((err) => {
      return res.redirect("/");
    });
  } else {
    return res.redirect("/login");
  }
};

exports.signUp = (req, res, next) => {
  const { User } = req.db.models;

  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return bcrypt
          .hash(req.body.password, 12)
          .then(async (hashedPassword) => {
            const token = await jwt.sign(
              {
                data: { email: req.body.email },
              },
              process.env.JWT_VERIFY_TOKEN,
              { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
            );
            const user = new User({
              fullName: req.body.fullName,
              email: req.body.email,
              password: hashedPassword,
              verificationToken: token,
              role_id: 1,
            });

            return user.save();
          })
          .then(async (result) => {
            let emailResponse = await sendMail({
              from: '"Fred Foo 👻" <foo@example.com>', // sender address
              to: req.body.email, // list of receivers
              subject: "Verify Email", // Subject line
              text: "reset email", // plain text body
              html: `<b>Verify email at <a href=${process.env.VERIFY_URL}/api/auth/verify?verificationToken=${result.verificationToken}>Click Here to verify Email</a></b>`, // html body
            });

           // Clear local storage cookie
            res.clearCookie('localStorage');

               return res.send({
                status: true,
                message: "User created succcessfully.",
                testURI: emailResponse.testURI,
              });
           
          })
      } else {
        
        return res.send({
          status: false,
          message: "E-Mail exists already, please pick a different one.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .send({ status: false, message: "Error creating user", err });
    });
};

exports.accountVerify = async (req, res, next) => {
  try {
    const { User } = req.db.models;

    const { verificationToken } = req.query;
    var decoded = await jwt.verify(
      verificationToken,
      process.env.JWT_VERIFY_TOKEN
    );
    console.log("end point verify")
    User.findOne({
      where: {
        email: decoded.data.email,
      },
    })
      .then(async (user) => {
        if (user && user.verificationToken === verificationToken) {
          let result = await user.update({
            isVerified: true,
            verificationToken: null,
          });
          if (result) {
            res.redirect(process.env.VERIFY_RETURN_URL_SUCCESS);
          } else {
            res.redirect(process.env.VERIFY_RETURN_URL_FAIL);
          }
        } else {
          res.redirect(process.env.VERIFY_RETURN_URL_FAIL);

          // res.status(200).send({ message:"Invalid token",status:false })
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { User } = req.db.models;

  const validationErrors = [];
  console.log("email", req.body.email);
  try {
    if (!validator.isEmail(req?.body?.email))
      validationErrors.push("Please enter a valid email address.");

    if (validationErrors.length) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid email address" });
    }
    const otp = Math.random().toString().substr(2, 6);
    User.findOne({
      where: {
        email: req?.body?.email,
      },
    })
      .then(async (user) => {
        if (user) {
          const token = await jwt.sign(
            {
              data: { email: req.body.email },
            },
            process.env.JWT_RESET_TOKEN,
            { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
          );

          user.resetToken = token;
          user.resetTokenExpiry = Date.now() + 3600000;
          user.otp = otp;
          const userSave = await user.save();
          if (!userSave) {
            return res
              .status(500)
              .send({ status: false, message: "Something went wrong" });
          }
          let emailResponse = await sendMail({
            // from: '"Fred Foo 👻" <foo@example.com>', // sender address
            from: "zubairahsan202@gmail.com", // sender address
            to: req.body.email, // list of receivers
            subject: "Reset password Email", // Subject line
            text: `Your OTP ${otp}`, // plain text body
            // html: `<b>Verify email at <a href=${process.env.VERIFY_URL}/reset-password?verificationToken=${token}>Click Here to reset Password</a></b>`, // html body
            html: `<b>Your OTP is   ${otp}</b>`, // html body
          });
          res.send({
            message: "A link has been sent to your registered email. ",
            status: !!user,
            testURI: emailResponse.testURI,
          });
        } else {
          res.send({
            message: "A link has been sent to your registered email. ",
            status: !!user,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { User } = req.db.models;
    const { userId, role_id, email } = req?.auth?.data;
    console.log("Admin Email:", email);
    // const { verificationToken, password } = req.body;
    const { password } = req.body;
    // var decoded = await jwt.verify(
    //   verificationToken,
    //   process.env.JWT_RESET_TOKEN
    // );
    User.findOne({
      where: {
        // email: decoded.data.email,
        email,
      },
    })
      .then(async (user) => {
        // if (user && user.resetToken === verificationToken) {
        if (user) {
          return bcrypt.hash(password, 12).then(async (hashedPassword) => {
            let result = await user.update({
              password: hashedPassword,
              resetToken: null,
              resetTokenExpiry: null,
            });
            if (result) {
              return (
                res
                  // .status(200)
                  .send({ message: "Password updated", status: true })
              );
            } else {
              return res.send({
                message: "Err updating password try again",
                status: false,
              });
            }
          });
        } else {
          // res.redirect(process.env.VERIFY_RETURN_URL_FAIL)

          return res
            .status(200)
            .send({ message: "Invalid token", status: false });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const { User, Role } = req.db.models;
    const userId = req?.auth?.data?.userId;
    User.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: Role,
          required: false,
        },
      ],
    })
      .then(async (user) => {
        if (user) {
          // res.redirect(process.env.VERIFY_RETURN_URL_FAIL)
          const { fullName, id, email } = user;

          res.send({
            status: true,
            user: { fullName, id, email, role: user.Role },
          });
        } else {
          res
            .status(200)
            .send({ status: false, user: null, message: "User not found" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};

exports.scannedImage = async (req, res, next) => {
  try {
    const { cardsimages, questions, scannedcards } = req.db.models;
    let sampleFile;
    let uploadPath;
    const { device } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send("No files were uploaded.");
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file

    //machine path is
    sampleFile = req.files.imgName;
    sampleFile.name = Date.now() + "_" + sampleFile.name;
    //uploadPath = "/home/Images/" + sampleFile.name;
    uploadPath = "/home/ubuntu/Images/" + sampleFile.name;

    // home / ubuntu / Images;
    // sampleFile = req.files.imgName;
    // uploadPath = path.join(__dirname);
    // console.log("Upload Path is ", uploadPath);
    // uploadPath = path.join(__dirname, "../../"); //It goes three folders or directories back from given __dirname.
    // console.log("path ", uploadPath);
    // sampleFile.name = Date.now() + "_" + sampleFile.name;
    // uploadPath = uploadPath + "/Images/" + sampleFile.name;
    // console.log("Directory is ", uploadPath);

    // uploadPath = __dirname + '/somewhere/on/your/server/' + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, async function (err) {
      if (err) {
        console.log("In error");
        return res.send(err);
      } else {
        console.log("here ", req.body);
        console.log("Sample file name is ", sampleFile.name);
        const url = process.env.FLASK_API + sampleFile.name;

        // const data1 = await fetch(url);
        // //const json = await data.json();
        // console.log(data1);

        // res.status(200).send({
        //   message: "Data is ",
        //   data: data1,
        // });
        var requestOptions = {
          method: "GET",
        };

        fetch(url, requestOptions)
          .then((response) => response.text())
          .then(async (result) => {
            console.log("Result is ", result);
            console.log("Type of result is ", typeof result);

            if (result == "Please Try Again...") {
              return res.send({
                success: false,
                message: "Scanned Image is not valid",
              });
            } else {
              let cardImage = await cardsimages.findOne({
                where: {
                  card_name: result,
                },
              });

              if (cardImage) {
                if (cardImage.question_id) {
                  // res.send({
                  //   success: true,
                  //   message: "Question against card found in database",
                  //   data: card,
                  // });

                  let isCardScanned = await scannedcards.findOne({
                    where: {
                      device_id: device,
                      card_id: cardImage.id,
                    },
                  });

                  if (isCardScanned) {
                    res.send({
                      success: false,
                      message: "You alreday scanned this card",
                      data: cardImage,
                    });
                  } else {
                    res.send({
                      success: true,
                      message: "Question against card found in database",
                      data: cardImage,
                      // scannedCard: addScannedCard,
                    });
                    // let addScannedCard = await scannedcards.create({
                    //   device_id: device,
                    //   card_id: cardImage.id,
                    // });

                    // if (addScannedCard) {
                    //   res.send({
                    //     success: true,
                    //     message: "Question against card found in database",
                    //     data: cardImage,
                    //     scannedCard: addScannedCard,
                    //   });
                    // } else {
                    //   res.send({
                    //     success: false,
                    //     message: "Cannot add scanned card",
                    //     data: cardImage,
                    //   });
                    // }
                  }
                } else {
                  res.send({
                    success: false,
                    message: "Question against card not found in database",
                    data: cardImage,
                  });
                }
              } else {
                res.send({
                  success: false,
                  message: "Card  not found in database",
                });
              }
            }
          })
          .catch((error) => {
            console.log("error", error);
            res.send({
              success: false,
              message: "Error",
              error,
            });
          });
        // fetch(url)
        //   .then((data) => {
        //     res.status(200).send({
        //       message: "Data isdsadasd ",
        //       data,
        //     });

        //     // console.log("File Saved");
        //     // res.
        //     //res.send("File uploaded!");
        //     //console.log("Data is ", data);
        //     // handle the response
        //   })
        //   .catch((err) => {
        //     console.log("Error is ", err);
        //     res.status(400).send({
        //       message: "Err ",
        //       err,
        //     });
        //     // handle the error
        //   });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};

exports.addScannedCard = async (req, res, next) => {
  try {
    const { cardsimages, questions, scannedcards } = req.db.models;
    let { device, cardId } = req.body;

    let addScannedCard = await scannedcards.create({
      device_id: device,
      card_id: cardId,
    });

    if (addScannedCard) {
      res.send({
        success: true,
        message: "Scanned Card added in database with device",
        scannedCard: addScannedCard,
      });
    } else {
      res.send({
        success: false,
        message: "Cannot add scanned card",
        // data: cardImage,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
};

exports.updatePassword = (req, res, next) => {
  const { User } = req.db.models;
  const { verificationToken, newpassword } = req.body;
  User.findOne({
    where: {
      otp: verificationToken,
    },
  })
    .then(async (user) => {
      if (user) {
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(newpassword, salt);

        user.password = hashPassword;
        await user.save();
        console.log(user.dataValues);
        return res.send({
          status: true,
          message: "Password updated succesfully ",
        });
      }
      return res.send({ status: false, message: " Invalid OTP" });
    })
    .catch((err) => {
      return res.send({ status: false, message: " Network Error" });
    });
};

/**
 *  METHOD: POST
 *  ROUTE: '/api/auth/invitee'
 *
 */

exports.invitedUserSignUp = (req, res, next) => {
  const { invite, User, Role } = req.db.models;
  const { email, role, fullName, password } = req?.body;

  invite
    .findOne({
      where: {
        email: email,
      },
    })
    .then((user) => {
      if (user) {
         bcrypt
          .hash(password, 12)
          .then(async (hashedPassword) => {
            const token = await jwt.sign(
              {
                data: { email:email },
              },
              process.env.JWT_VERIFY_TOKEN,
              { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
            );

            const roleId = await Role.findOne({
              where: {
                name: role,
              },
              attributes: ["id"],
            });

            const newUser = await new User({
              fullName: fullName,
              email: email,
              password: hashedPassword,
              verificationToken: token,
              role_id: roleId.id,
              isVerified: true,
            });
            return await newUser.save();
          })
          .then(async (result) => {
            console.log(result);
            if (result) {
              const userToRemoveFromInviteTable = await invite.findOne({
                where: {
                  email: result.email,
                },
              });
              await userToRemoveFromInviteTable.destroy();
              return res.send({
                status: true,
                message: "User created succcessfully.",
              });
            }
          });
      } else {
        return res.send({
          status: false,
          message: "E-Mail does not exists. ",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .send({ status: false, message: "Error creating user", err });
    });
};

/**
 *  METHOD: PUT
 *  ROUTE: '/api/auth/update_prifile'
 *  DESCRIPTION: UPDATE THE LOGED IN USER PROFILE
 *
 */

exports.updateProfile = async (req, res, next) => {
  const { User } = req.db.models;
  const { email } = req?.auth?.data;
  const { fullName } = req?.body;

  try {
    /** Find User With Email */
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      user.fullName = fullName;
      user.profileImg = req.name;

      /** SaveUser */
      await user.save();

     
      console.log("Updated User is ", user);
      /** Send Response */
      return res.send({
        status: true,
        message: "Profile updated successfully",
        user: user ,
      });
    }
    return res.send({    status: false, message: "no user found",
    
  });
  } catch (err) {
    console.log(err);
    return res.send({ status: false, message: err.message });
  }
};

exports.getInvite = async (req, res, next) => {
  const { invite, Role } = req?.db?.models;
  const { id } = req?.params;

  try {
    const invitedUser = await invite.findOne({
      where: {
        id,
      },
      attributes: ["email", "role"],
    });
    console.log(invitedUser?.dataValues);
    if (invitedUser?.dataValues) {
      return res.send({ status: true, user: invitedUser });
    }

    return res.send({
      status: false,
      message: "sorry no user found with this invite email address",
    });
  } catch (err) {
    return res.send({ status: false, message: err.message });
  }
};

exports.getUserDetails = async (req, res, next) => {
  const {  User,  } = req.db.models;
  const { id } = req.params;
 
  

  try {
    const userDetail = await User.findAll({
      where: {
        id:id,
      },
    });

    if (userDetail) {
      /**
       * UPON SUCCESS RETURN BELOW RESPONSE
       */
      return res.send({
        status: true,
        User: userDetail,
      });
    }

    return res.send({ status: false, message: "No User Found" });
  } catch (err) {
    return res.send({ status: false, message: err });
  }
};
