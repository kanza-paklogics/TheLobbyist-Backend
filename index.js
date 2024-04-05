const path = require("path");
// load dependencies
const env = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
var { expressjwt: jwt } = require("express-jwt");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
app.use(cors());
//Loading Routes
const webRoutes = require("./routes/web");
const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin");
const timeRoutes = require("./routes/time");
const questionRoutes = require("./routes/question");
const packRoutes = require("./routes/pack");
const questionAnalyticRoutes = require("./routes/questionAnalytic");
const packAnalyticsRoutes = require("./routes/packAnalytics");
const votesRoutes = require("./routes/votes");
const cardRoutes = require("./routes/card");
const { sequelize } = require("./models/index");
const errorController = require("./app/controllers/ErrorController");
const dashboardRoutes = require("./routes/dashboard");
const gamesRoutes = require("./routes/games");

env.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
}));

app.use('/cards', express.static(path.join(__dirname, '../../Flask_API/Cards')));
// app.use('/cards', express.static(__dirname, '/home/ubuntu/Flask_API/Cards'));

// app.use(
//   "/home/ubuntu/Flask_API/Cards",
//   express.static("/home/ubuntu/Flask_API/Cards")
// );
app.use('/characters', express.static(path.join(__dirname, '../../Flask_API/Characters')));
app.use('/profileimage', express.static(path.join(__dirname, '/app/public/uploads')));


app.use(
  jwt({
    secret: process.env.JWT_TOKEN_KEY,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/auth/sign-up",
      "/api/auth/invitee",
      "/api/auth/login",
      "/api/question_analytics/get_record",
      // "/api/auth/reset-password",
      { url: /^\/api\/pack_analytics\/get_record\/.+$/, methods: ["GET"] },
      { url: /^\/api\/auth\/get_invite\/.+$/, methods: ["GET"] },
      // { url: /^\/api\/question\/get_question_logs\/.+$/, methods: ["GET"] },

      "/api/auth/forget-password",
      "/api/auth/updatepassword",
      "/api/auth/verify",
      "/api/test",
      "/api/auth/upload",
      "/api/time/getroundtime",
      // "/api/question/add_question",
      "/api/card/add_card",
      // "/api/pack/add_pack",
      "/api/pack/publish",
      "/api/auth/scannedcard",
      "/api/question_analytics/add_record",

      "/api/pack_analytics/add_record",
      //"/cards"
      // "/home/ubuntu/Flask_API/Cards/"
    ], 
  })
);
app.use((req, res, next) => {
  req.db = sequelize;
  next();
});
app.use("/api", webRoutes);
app.use("/api/question_analytics", questionAnalyticRoutes);
app.use("/api/pack_analytics", packAnalyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/games",gamesRoutes);
app.use("/api/card", cardRoutes);
app.use("/api/pack", packRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/votes", votesRoutes);
sequelize
  //  .sync({ alter: true })
  .sync()
  .then(() => {
    app.listen(process.env.PORT);
    //pending set timezone
    console.log("App listening on port " + process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });
