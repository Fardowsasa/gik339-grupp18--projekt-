const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Servera frontend (så du slipper Live Server-problemet)
app.use(express.static(path.join(__dirname, "client")));

// DB
const db = new sqlite3.Database("./films.db", (err) => {
  if (err) {
    console.error("Kunde inte öppna databasen:", err.message);
  } else {
    console.log("SQLite DB ansluten.");
  }
});

// Skapa tabell (1 resurs) om den inte finns
db.run(
  `
  CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    director TEXT NOT NULL,
    year INTEGER NOT NULL,
    rating INTEGER NOT NULL
  )
  `,
  (err) => {
    if (err) console.error("Fel vid CREATE TABLE:", err.message);
  }
);

/**
 * REST-endpoints (enligt instruktion):
 * GET    /resurs
 * GET    /resurs/:id (valfri men praktisk)
 * POST   /resurs
 * PUT    /resurs
 * DELETE /resurs/:id
 *
 * Vi använder /films som "resurs".
 */

// GET /films (hämta alla)
app.get("/films", (req, res) => {
  db.all("SELECT * FROM films ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB-fel vid hämtning.", error: err.message });
    res.json(rows);
  });
});

// GET /films/:id (hämta en)
app.get("/films/:id", (req, res) => {
  const id = Number(req.params.id);
  db.get("SELECT * FROM films WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ message: "DB-fel vid hämtning av film.", error: err.message });
    if (!row) return res.status(404).json({ message: "Film hittades inte." });
    res.json(row);
  });
});

// POST /films (skapa)
app.post("/films", (req, res) => {
  try {
    const { title, director, year, rating } = req.body;

    if (!title || !director || year == null || rating == null) {
      return res.status(400).json({ message: "Alla fält måste vara ifyllda." });
    }

    const sql = "INSERT INTO films (title, director, year, rating) VALUES (?, ?, ?, ?)";
    const params = [title.trim(), director.trim(), Number(year), Number(rating)];

    db.run(sql, params, function (err) {
      if (err) return res.status(500).json({ message: "DB-fel vid skapande.", error: err.message });

      res.status(201).json({
        message: "Film skapad!",
        id: this.lastID,
      });
    });
  } catch (e) {
    res.status(500).json({ message: "Serverfel vid skapande.", error: String(e) });
  }
});

// PUT /films (uppdatera) - id ska ligga i body
app.put("/films", (req, res) => {
  try {
    const { id, title, director, year, rating } = req.body;

    if (!id) return res.status(400).json({ message: "id saknas för uppdatering." });
    if (!title || !director || year == null || rating == null) {
      return res.status(400).json({ message: "Alla fält måste vara ifyllda." });
    }

    const sql = `
      UPDATE films
      SET title = ?, director = ?, year = ?, rating = ?
      WHERE id = ?
    `;
    const params = [title.trim(), director.trim(), Number(year), Number(rating), Number(id)];

    db.run(sql, params, function (err) {
      if (err) return res.status(500).json({ message: "DB-fel vid uppdatering.", error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: "Ingen film uppdaterades (id finns inte)." });

      res.json({ message: "Film uppdaterad!" });
    });
  } catch (e) {
    res.status(500).json({ message: "Serverfel vid uppdatering.", error: String(e) });
  }
});

// DELETE /films/:id (ta bort)
app.delete("/films/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM films WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "DB-fel vid borttagning.", error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "Film hittades inte (kunde inte tas bort)." });

    res.json({ message: "Film borttagen!" });
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
