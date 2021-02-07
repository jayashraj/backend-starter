import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { login, register, logout, redirect } from "./routes/auth";
import redis from "redis";
import connect from "connect-redis";
import "reflect-metadata";
import { createConnection } from "typeorm";

let RedisStore = connect(session);
let redisClient = redis.createClient();
redisClient.on("error", function (err) {
  console.log(err);
  console.log("Is redis running? Or is configured properly?");
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//import { Users } from "./entity/Users";
/* 
createConnection().then(async connection => {}).catch(error => console.log(error));
 */

createConnection()
  .then(async (connection) => {
    app.listen(5000, () => {
      console.log("Server is litening at http://localhost:5000");
    });
  })
  .catch((error) => console.log(error));

/* 
Because we are using express-session, we do not check cookies on req.cookies
Cookies are present in req.session
*/

app.use(
  session({
    name: "LOGIN_INFO",
    secret: "keyboard cat", //used to sign the cookie?
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: { secure: false, maxAge: 72000, sameSite: true },
  })
);

// Home Page
app.get("/", redirect.toLoginIfNotLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname + "/pages/index.html"));
});

// JS: routes/auth.ts
// HTML: pages/authentication
app.all("/login", redirect.toHomeIfLoggedIn, login);
app.all("/register", redirect.toHomeIfLoggedIn, register);
app.all("/logout", redirect.toLoginIfNotLoggedIn, logout);
