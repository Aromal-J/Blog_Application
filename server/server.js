import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import aws from "aws-sdk";

const server = express();

let PORT = 3333;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, { autoIndex: true });

//setting up s3 bucket
const s3 = new aws.S3({
  region: "eu-north-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blogging-website-by-aromal",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const formateDataToSend = (user) => {
  const { profile_img, username, fullname } = user.personal_info;
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img,
    username,
    fullname,
  };
};

const generateUserName = async (email) => {
  let username = email.split("@")[0];

  let isUserNameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUserNameNotUnique && (username += nanoid().substring(0, 4));

  return username;
};

//upload image url route
server.get("/get-upload-url", (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadUrl: url }))
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;

  if (fullname.length < 3 && fullname.length > 0) {
    return res
      .status(403)
      .json({ error: "Fullname must be more than 3 character" });
  }
  if (!fullname.length) {
    return res.status(403).json({ error: "Enter your full name" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Enter Email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({ error: "Password is not valid" });
  }

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUserName(email);
    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formateDataToSend(u));
      })
      .catch((error) => {
        if (error.code === 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }
      });
  });
});

server.post("/signin", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "Error occured while login please try again" });
        }
        if (!result) {
          return res.status(403).json({ error: "Invalid credential" });
        } else {
          return res.status(200).json(formateDataToSend(user));
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// server.post('/google-auth', async(req, res){
//   let {access_token}=req.body
// })

server.listen(PORT, () => {
  console.log(`Server is listening to ${PORT}`);
});
