// netlify/functions/api.js
const serverless = require("serverless-http");
const express = require("express");
const sanitizeHTML = require("sanitize-html");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// ---------- Conexão Mongo (reuso entre invocações) ----------
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    if (!process.env.MONGODB_URL) {
      throw new Error("Defina a variável de ambiente MONGODB_URL no Netlify.");
    }
    cachedClient = new MongoClient(process.env.MONGODB_URL);
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(); // se quiser, passe o nome: cachedClient.db("nome_db")
  return cachedDb;
}

// ---------- Middlewares ----------
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---------- Home (SSR) ----------
app.get("/", async (req, res) => {
  const db = await getDb();
  const items = await db.collection("items").find().toArray();

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Lista de Tarefas</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
    crossorigin="anonymous"
  />
</head>
<body>
  <div class="container py-4">
    <h1 class="display-4 text-center mb-4">Lista de Tarefas</h1>

    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST" class="d-flex gap-2">
        <input id="input" name="item" class="form-control mr-2" type="text" placeholder="Nova tarefa..." autocomplete="off" />
        <button class="btn btn-primary">Adicionar</button>
      </form>
      <button id="delete-all" class="btn btn-outline-danger mt-3">Apagar tudo</button>
    </div>

    <p id="total" class="text-muted"></p>
    <ul id="list-item" class="list-group pb-5"></ul>
  </div>

  <script>window.__ITEMS__ = ${JSON.stringify(items)};</script>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="/browser.js"></script>
</body>
</html>`);
});

// ---------- API ----------
app.post("/create-item", async (req, res) => {
  const db = await getDb();
  const safeText = sanitizeHTML(req.body.text || req.body.item || "", {
    allowedTags: [],
    allowedAttributes: {}
  });
  if (!safeText.trim()) return res.status(400).json({ error: "empty" });

  const info = await db.collection("items").insertOne({ text: safeText });
  res.json({ _id: info.insertedId, text: safeText });
});

app.post("/update-item", async (req, res) => {
  const db = await getDb();
  const id = req.body.id;
  const safeText = sanitizeHTML(req.body.text || "", {
    allowedTags: [],
    allowedAttributes: {}
  });
  await db.collection("items").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { text: safeText } }
  );
  res.send("sucess"); // mantém texto esperado pelo front
});

app.post("/delete-item", async (req, res) => {
  const db = await getDb();
  const id = req.body.id;
  await db.collection("items").deleteOne({ _id: new ObjectId(id) });
  res.send("sucess");
});

app.post("/delete-all", async (_req, res) => {
  const db = await getDb();
  await db.collection("items").deleteMany({});
  res.send("sucess");
});

// ---------- Exporta como Netlify Function ----------
module.exports.handler = serverless(app);
