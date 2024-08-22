import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token === null || token === undefined) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Acess token is invalid" });
    }

    req.user = user.id;

    next();
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

server.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des tags banner activity publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/all-latest-blogs-count", async (req, res) => {
  let { data_to_send } = req.body;

  try {
    let count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

server.get("/trending-blogs", async (req, res) => {
  try {
    let blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

server.post("/search-blogs", async (req, res) => {
  let { tag, page, query } = req.body;

  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }

  let maxLimit = 2;

  try {
    let blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id des banner activity title tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

server.post("/search-users", async (req, res) => {
  let { query } = req.body;

  try {
    let users = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(50)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      );

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

server.post("/search-blogs-count", async (req, res) => {
  let { tag, query } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }
  try {
    let count = await Blog.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;

  let { title, des, banner, tags, content, draft } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide the description under 200 characters",
      });
    }
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags inorder to publish the blog, Maximum 10 tags",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;

      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failed to update the total posts number" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.listen(PORT, () => {
  console.log(`Server is listening to ${PORT}`);
});
