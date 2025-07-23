const express = require("express");
const mongoose = require("mongoose");

const server = express();
server.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/library")
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

const bookSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  author: String,
  year: Number,
});

const Book = mongoose.model("Book", bookSchema);

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);

// Get books filter, pagination
server.get("/books", async (req, res) => {
  try {
    let { author, year, page = 1, take = 10 } = req.query;
    page = +page;
    take = +take;

    let filter = {};
    if (author) filter.author = author;
    if (year) filter.year = +year;

    const books = await Book.find(filter)
      .skip((page - 1) * take)
      .limit(take);

    res.status(200).send(books);
  } catch (err) {
    res.json({ err });
  }
});

//  Get one
server.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send({ error: "Kitob topilmadi" });
    res.status(200).send(book);
  } catch (err) {
    res.json({ err });
  }
});

// Post
server.post("/books", async (req, res) => {
  try {
    const { name, price, image, author, year } = req.body;
    if (!name || !price || !image || !author || !year) {
      return res
        .status(400)
        .send({ error: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const book = new Book({ name, price, image, author, year });
    await book.save();
    res.status(201).send({ message: "Kitob qo'shildi", book });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Patch
server.patch("/books/:id", async (req, res) => {
  try {
    const update = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!update) return res.status(404).send({ error: "Kitob topilmadi" });
    res.status(200).send({ message: "Kitob yangilandi", book: update });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete
server.delete("/books/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).send({ error: "Kitob topilmadi" });
    res.status(204).end();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Register
server.post("/register", async (req, res) => {
  try {
    const { name, password, age } = req.body;
    if (!name || !password || !age) {
      return res.status(400).send({ error: "Ism, parol va yosh kerak" });
    }

    const exists = await User.findOne({ name });
    if (exists)
      return res.status(409).send({ error: "Foydalanuvchi mavjud" });

    const user = new User({ name, password, age });
    await user.save();

    res.status(201).send({ message: "Ro'yxatdan o'tdi", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
server.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password)
      return res.status(400).send({ error: "Ism va parol kerak" });

    const user = await User.findOne({ name, password });
    if (!user) return res.status(401).send({ error: "Login xato" });

    res.status(200).send({ message: "Xush kelibsiz", user });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});