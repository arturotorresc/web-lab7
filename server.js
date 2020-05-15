const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Bookmark = require("./models/Bookmark");

const app = express();

require("dotenv");

const jsonParser = bodyParser.json();

app.use(express.static("public"));
app.use(jsonParser);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

const API_KEY = "2abbf7c3-245b-404f-9473-ade729ed4653";
// middleware to parse the api key
const parseApiKey = (req, res, next) => {
  const { apiKey } = req.query;
  if (apiKey && apiKey === API_KEY) {
    return next();
  }
  const apiKeyHeader = req.get("book-api-key");
  if (apiKeyHeader && apiKeyHeader === API_KEY) {
    return next();
  }
  const bearerToken = req.get("authorization");
  if (bearerToken && bearerToken.startsWith("Bearer")) {
    const key = bearerToken.substring(7);
    if (key === API_KEY) {
      return next();
    }
  }
  res.statusMessage = "No tienes autorizado este recurso";
  return res.status(401).end();
};

app.use(parseApiKey);

app.get("/bookmarks", (req, res) => {
  Bookmark.find({})
    .then((bookmarks) => {
      res.statusMessage = "All bookmarks";
      res.status(200).json({ bookmarks });
    })
    .catch((err) => res.status(500).end());
});

app.get("/bookmark", (req, res) => {
  const { title } = req.query;
  if (!title) {
    res.statusMessage = "Pass in title query param";
    return res.status(406).end();
  }

  Bookmark.find({ title })
    .then((bookmarks) => {
      if (!bookmarks) {
        res.statusMessage = "Bookmark does not exist";
        return res.status(404).end();
      }
      res.status(200).json({ bookmarks });
    })
    .catch((err) => {
      res.status(500).end();
    });
});

app.post("/bookmarks", (req, res) => {
  const { title, description, url, rating } = req.body;
  console.log(req.body);
  if (!title || !description || !url || !rating) {
    res.statusMessage = "You need to include all necessary params!";
    return res.status(406).end();
  }
  const newPost = {
    title,
    description,
    url,
    rating,
  };
  const validBookmark = new Bookmark(newPost);
  validBookmark
    .save()
    .then((bookmark) => {
      res.status(201).json({ bookmark });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

app.delete("/bookmark/:id", async (req, res) => {
  const { id } = req.params;
  const postToDelete = await Bookmark.exists({ _id: id });
  if (!postToDelete) {
    res.statusMessage = "Bookmark not found";
    return res.status(404).end();
  }
  Bookmark.findByIdAndDelete(id)
    .then(() => res.status(200).end())
    .catch((err) => res.status(500).end());
});

app.patch("/bookmark/:id", async (req, res) => {
  if (!req.body.id) {
    res.statusMessage = "Pass the ID of the bookmark in the body";
    return res.status(406).end();
  }

  const { id } = req.params;
  const postToUpdate = await Bookmark.exists({ _id: id });
  if (!postToUpdate) {
    res.statusMessage = "Bookmark not found";
    return res.status(404).end();
  }
  if (req.body.id !== id) {
    res.statusMessage = "Param ID and Body ID do not match";
    return res.status(409).end();
  }
  req.body.id = undefined;
  Bookmark.findByIdAndUpdate(id, req.body, {
    new: true,
  })
    .then((bookmark) => {
      res.json({ bookmark });
    })
    .catch((err) => res.status(500).end());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  const uri = process.env.DB_URI || "mongodb://localhost:27017/webdev-bookmark";
  mongoose
    .connect(uri, dbOptions)
    .then(() => console.log("Success connect to db"))
    .catch((err) => console.log("Error connecting to db........", err));
});
