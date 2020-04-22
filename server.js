const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const uuid = require("uuid");

const app = express();

const jsonParser = bodyParser.json();

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

// memory db.
let bookmarks = [
  {
    id: uuid.v4(),
    title: "HTML",
    description: "An introduction to HTML",
    url: "www.example.com/html-tutorial",
    rating: 5,
  },
  {
    id: uuid.v4(),
    title: "CSS",
    description: "An introduction to CSS",
    url: "www.example.com/css-tutorial",
    rating: 4.7,
  },
  {
    id: uuid.v4(),
    title: "Web Security",
    description: "An in depth look at web security",
    url: "www.example.com/web-security-course",
    rating: 4.9,
  },
  {
    id: uuid.v4(),
    title: "JavaScript",
    description: "An itermediate tutorial on JavaScript",
    url: "www.example.com/javascript/intermediate-course",
    rating: 5,
  },
  {
    id: uuid.v4(),
    title: "Web Surfing",
    description: "A tutorial on how to surf the web",
    url: "www.example.com/web-surfing",
    rating: 3,
  },
];

app.get("/bookmarks", (req, res) => {
  res.statusMessage = "All bookmarks";
  res.status(200).json(bookmarks);
});

app.get("/bookmark", (req, res) => {
  const { title } = req.query;
  if (!title) {
    res.statusMessage = "Pass in title query param";
    return res.status(406).end();
  }
  const matches = bookmarks.filter(
    (bookmark) => bookmark.title.toLowerCase() === title.toLowerCase()
  );
  if (matches.length === 0) {
    res.statusMessage = "Bookmark does not exist";
    return res.status(404).end();
  }
  res.status(200).json(matches);
});

app.post("/bookmarks", (req, res) => {
  const { title, description, url, rating } = req.body;
  if (!title || !description || !url || !rating) {
    res.statusMessage = "You need to include all necessary params!";
    return res.status(406).end();
  }
  const newPost = {
    id: uuid.v4(),
    title,
    description,
    url,
    rating,
  };
  bookmarks.push(newPost);
  res.status(201).json(newPost);
});

app.delete("/bookmark/:id", (req, res) => {
  const { id } = req.params;
  const postToDelete = bookmarks.find((bookmark) => bookmark.id === id);
  if (!postToDelete) {
    res.statusMessage = "Bookmark not found";
    return res.status(404).end();
  }
  bookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
  res.status(200).end();
});

app.patch("/bookmark/:id", (req, res) => {
  if (!req.body.id) {
    res.statusMessage = "Pass the ID of the bookmark in the body";
    return res.status(406).end();
  }

  const { id } = req.params;
  const postToUpdate = bookmarks.find((bookmark) => bookmark.id === id);
  if (!postToUpdate) {
    res.statusMessage = "Bookmark not found";
    return res.status(404).end();
  }
  if (req.body.id !== id) {
    res.statusMessage = "Param ID and Body ID do not match";
    return res.status(409).end();
  }
  const allowed_props = ["id", "title", "description", "url", "rating"];
  for (let prop in req.body) {
    if (!allowed_props.includes(prop)) {
      res.statusMessage = `'${prop}' not allowed`;
      return res.status(406).end();
    }
  }
  let updatedObject = {};
  bookmarks = bookmarks.map((bookmark) => {
    if (bookmark.id === id) {
      updatedObject = { ...bookmark, ...req.body };
      return updatedObject;
    }
    return bookmark;
  });
  res.status(202).json(updatedObject);
});

app.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});
