import { Request, Response, NextFunction } from "express";
import Users from "../database/entity/Users";
import { validate } from "class-validator";
import path from "path";

/** The following extends the session to include uuid for Typescript */
declare module "express-session" {
  interface Session {
    userID: string;
  }
}

async function findUser(username: string, password: string) {
  try {
    const user = await Users.findOneOrFail({ username, password });
    return user.uuid;
  } catch (error) {
    return false;
  }
}

export const redirect = {
  /** Checks if user if logged in, if they are, then they are redirected to homepage
   * instead of login/register page
   */
  toHomeIfLoggedIn: (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userID) {
      res.redirect("/");
    } else {
      next();
    }
  },
  /** Checks if the user is logged in before preceeding to the
   * main page, if not, they are redirected to the loginpage
   */
  toLoginIfNotLoggedIn: (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userID) {
      res.redirect("/login");
    } else {
      next();
    }
  },
};

export async function login(req: Request, res: Response, next: NextFunction) {
  switch (req.method) {
    case "GET": {
      // even if it is a long path, when a form submits data to /register,
      // as long as we define /register in express, it takes us to the right page
      res.sendFile(
        path.join(__dirname + "/../pages/authentication/login.html")
      );
      break;
    }
    case "POST": {
      let uuid = await findUser(req.body.username, req.body.password);
      if (uuid) {
        req.session.userID = uuid;
      } else {
        res.redirect("/login");
        break;
      }
      res.redirect("/");
      break;
    }
    default: {
      res.redirect("/login");
      break;
    }
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (req.method) {
    case "GET": {
      res.sendFile(
        path.join(__dirname + "/../pages/authentication/register.html")
      );
      break;
    }
    case "POST": {
      try {
        const { username, email, password } = req.body;
        const user = Users.create({ username, email, password });
        const error = await validate(user);
        if (error.length > 0) {
          res.redirect("/register");
          break;
        }
        await user.save();
      } catch (error) {
        res.redirect("/register");
        break;
      }
      //redirect to login if register successful
      res.redirect("/login");
      break;
    }
    default: {
      res.redirect("/register");
      break;
    }
  }
}

export function logout(req: Request, res: Response, next: NextFunction) {
  switch (req.method) {
    case "POST": {
      req.session.destroy((error) => {
        res.redirect("/");
      });
      res.clearCookie("LOGIN_INFO"); //as sefined in session in index.ts
      break;
    }

    default: {
      res.redirect("/");
      break;
    }
  }
}
