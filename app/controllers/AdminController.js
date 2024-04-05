const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");

const sendMail = require("../../helpers/nodeMailer");
const checkRole = require("./checkRole");

/**
 *  POST REQUEST
 *  SEND INVITE
 *
 */

exports.sendInvite = async (req, res, next) => {
  const { invite } = req?.db?.models;
  const { email, roleAssigned } = req?.body;
  console.log("email and role ",email, roleAssigned);
  const role = await checkRole(req, res);

  /** check if role is admin or user */
  console.log("role is ", role);
  if (role?.name !== "Admin") {
    return res.send({
      status: false,
      message: "Only admins can send requests to Users.",
    });
  }

  /**
   *  if role is admin
   *  check if email already exists and him invite again
   */
  invite
    .findOne({
      where: {
        email,
      },
    })
    .then(async (invitee) => {
      /**
       *  IF EMAIL EXIST SEND INVITE LINK AGAIN TO USER
       */

      if (invitee) {

        console.log(`url is ${process.env.VERIFY_URL}/adminpanel/userform/${invitee.id}`)
        let emailResponse = await sendMail({
          // from: '"Fred Foo 👻" <foo@example.com>', // sender address
          from: process.env.FROM, // sender address
          to: invitee.email, // list of receivers
          subject: "Sign up", // Subject line
          text: "Sign up for Lobbyist ", // plain text body
          
          html: `
          <strong>Hello,</strong><br>
          <p>Click the button below to Sign Up:</p>
          <a href="${process.env.VERIFY_URL}/adminpanel/userform/${invitee.id}">
            <button type="button" style="background-color: #008CBA;">Sign Up</button>
          </a>
          <br>
          Thanks,<br>
          TheLobbyist Team.
        `, // html body
        
        });
        /**
         *  CHECK EMAIL RESPONSE
         */
        if (emailResponse) {
          return res.send({
            status: true,
            message: "Invite sent Successfully",
            emailResponse,
          });
        }
        
        return res.send({ status: false, message: "something went wrong" });
      } else {
        const newInvite = await invite.create({
          invitedBy: role.email,
          email,
          role: roleAssigned,
        });
        let emailResponse = await sendMail({
          // from: '"Fred Foo 👻" <foo@example.com>', // sender address
          from: process.env.FROM, // sender address
          to: email, // list of receivers
          subject: "Sign up", // Subject line
          text: "Sign up for Lobbyist ", // plain text body
          html: `
          <strong>Hello,</strong><br>
          <p>Click the button below to Sign Up:</p>
          <a href="${process.env.VERIFY_URL}/adminpanel/userform/${invitee.id}">
            <button type="button" style="background-color: #008CBA;">Sign Up</button>
          </a>
          <br>
          Thanks,<br>
          TheLobbyist Team. 
        `, // html body
        });

        /**
         *  CHECK EMAIL RESPONSE
         */
        if (emailResponse) {
          await newInvite.save();
          return res.send({
            status: true,
            message: "Invite sent Successfully",
            emailResponse,
          });
        }else{
          console.log("email response is false")
          return res.send({
            status: false,
            message: "email not sent",
            
          });
        }
      }
    })
    .catch((err) => {
      return res.send({ status: false, message: err.message });
    });
};

/**
 *  POST REQUEST
 *  CREATE NEW USER
 *
 */
exports.createUser = (req, res, next) => {
  const { User, Role } = req.db.models;
  const { email, role } = req.body;
  const createdBy = req?.auth?.data?.userId;

  console.log(createdBy);
  const { userId, role_id } = req?.auth?.data;
  console.log(userId, role_id);

  if (userId || role_id) {
    Role.findOne({
      where: {
        id: role_id,
      },
      attributes: ["name"],
    })
      .then((roleType) => {
        if (roleType.name === "User") {
          return res.send({
            status: false,
            message: "Only admins can create accounts.",
          });
        }
        const adminUserPassword = email.split("@")[0];
        User.findOne({
          where: {
            email,
          },
        })
          .then(async (user) => {
            if (!user) {
              const token = await jwt.sign(
                {
                  data: { email },
                },
                process.env.JWT_VERIFY_TOKEN,
                { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
              );
              Role.findOne({
                where: {
                  name: role,
                },
                attributes: ["id"],
              }).then(async (roleId) => {
                if (roleId.id) {
                  try {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash("test1234", salt);
                    const user = await User.create({
                      email,
                      role_id: roleId.id,
                      verificationToken: token,
                      password: hashPassword,
                    });
                    return res.send({ status: true, user });
                  } catch (err) {
                    return res.send({ status: false, message: err.message });
                  }
                }
              });
            } else {
              return res.status(400).send({
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
        
      })
      .catch((err) => {
        console.log(err);
        res.send({ status: false, message: err });
      });
  }
};

/**
 *
 * METHOD: DELTETE
 * ROUTE: '/api/admin/deleteuser/:uid'
 * DESCRIPTION: SOFT DELETE USER FROM DB BASED IN USER ID
 *
 */

exports.deleteUser = (req, res, next) => {
  const { User, Role } = req.db.models;
  const { userId, role_id } = req?.auth?.data;
  const { uid } = req?.params;

  if (userId || role_id) {
    Role.findOne({
      where: {
        id: role_id,
      },
      attributes: ["name"],
    })
      .then((roleType) => {
        if (roleType.name === "User") {
          return res.send({
            status: false,
            message: "you can't delete user.",
          });
        }
        // const adminUserPassword = email.split("@")[0];
        User.findOne({
          where: {
            id: uid,
          },
        })
          .then(async (user) => {
            if (!user) {
              return res.send({ status: false, message: "No User Found" });
            } else {
              await user.destroy();
              return res.status(200).send({
                status: true,
                message: `${user.dataValues.fullName} User deleted successfully`,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            return res
              .status(400)
              .send({ status: false, message: "Error deleting user", err });
          });
      })
      .catch((err) => {
        console.log(err);
        res.send({ status: false, message: err });
      });
  }
};

exports.UserSignUp = async (req, res, next) => {
  try {
    const { User } = req.db.models;
    const { emailUser, fullName, password } = req.body;

    const user = await User.findOne({ where: { email: emailUser } });
    if (user) {
      return bcrypt
        .hash(password, 12)
        .then(async (hashedPassword) => {
          const token = await jwt.sign(
            {
              data: { email: emailUser },
            },
            process.env.JWT_VERIFY_TOKEN,
            { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
          );

          await user.update({
            fullName,
            password,
          });

          const result = await User.findOne({ where: { email: emailUser } });

          // const user = new User({
          //   fullName: req.body.fullName,
          //   email: req.body.email,
          //   password: hashedPassword,
          //   verificationToken: token,
          //   role: role_id,
          // });
          return result;
        })
        .then(async (result) => {
          let emailResponse = await sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Verify Email", // Subject line
            text: "reset email", // plain text body
            html: `<b>Verify email at <a href=${process.env.VERIFY_URL}/api/auth/verify?verificationToken=${result.verificationToken}>Click Here to verify Email</a></b>`, // html body
          });
          return res.status(200).send({
            status: true,
            message: "User created succcessfully.",
            testURI: emailResponse.testURI,
          });
        });
    } else {
      return res.status(400).send({
        status: false,
        message: "in else",
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};
