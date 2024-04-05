var jwt = require("jsonwebtoken");

const checkRole = async (req, res) => {
  const { User, Role } = req.db.models;
  const { userId, role_id, email } = req?.auth?.data;
  console.log(userId, role_id);

  try {
    const role = await Role.findOne({
      where: {
        id: role_id,
      },
      attributes: ["name"],
    });

    if (role) {
      return { ...role.dataValues, email };
    }
    res.send({ status: false, message: "role does not exist" });
  } catch (err) {
    res.send({ status: "false", message: err });
  }
};

module.exports = checkRole;
