const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// SQLite Database
const db = new sqlite3.Database("./p2030.db", (err) => {
  if (err) {
    console.error("Could not connect to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Ensure the database has the required tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_no TEXT,
    name TEXT,
    surname TEXT,
    dob TEXT,
    gender TEXT,
    school_attended TEXT,
    grade_year TEXT,
    stream TEXT,
    potential_course TEXT,
    mentor TEXT,
    cell_number TEXT,
    email_address TEXT,
    applied_for_2021 TEXT,
    university_applied_for TEXT,
    field1 TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS mentors (
    mentor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_name TEXT,
    mentor_age INTEGER,
    mentor_phone_number TEXT,
    mentor_origin TEXT,
    mentor_home_language TEXT
  )`);
});

// Fetch students
app.get("/students", (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM students";
  const params = [];

  if (search) {
    query += " WHERE name LIKE ? OR surname LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error fetching students: " + err.message });
    }
    res.json(rows);
  });
});

// Fetch mentors
app.get("/mentors", (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM mentors";
  const params = [];

  if (search) {
    query += " WHERE mentor_name LIKE ?";
    params.push(`%${search}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error fetching mentors: " + err.message });
    }
    res.json(rows);
  });
});

// Create student
app.post("/students", (req, res) => {
  const data = req.body;
  db.run(
    `INSERT INTO students (ref_no, name, surname, dob, gender, school_attended, grade_year, stream, potential_course, mentor, cell_number, email_address, applied_for_2021, university_applied_for, field1)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.ref_no,
      data.name,
      data.surname,
      data.dob,
      data.gender,
      data.school_attended,
      data.grade_year,
      data.stream,
      data.potential_course,
      data.mentor,
      data.cell_number,
      data.email_address,
      data.applied_for_2021,
      data.university_applied_for,
      data.field1,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error creating student: " + err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update student
app.put("/students/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  db.run(
    `UPDATE students SET ref_no = ?, name = ?, surname = ?, dob = ?, gender = ?, school_attended = ?, grade_year = ?, stream = ?, potential_course = ?, mentor = ?, cell_number = ?, email_address = ?, applied_for_2021 = ?, university_applied_for = ?, field1 = ? WHERE id = ?`,
    [
      data.ref_no,
      data.name,
      data.surname,
      data.dob,
      data.gender,
      data.school_attended,
      data.grade_year,
      data.stream,
      data.potential_course,
      data.mentor,
      data.cell_number,
      data.email_address,
      data.applied_for_2021,
      data.university_applied_for,
      data.field1,
      id,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error updating student: " + err.message });
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete student
app.delete("/students/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM students WHERE id = ?", id, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error deleting student: " + err.message });
    }
    res.json({ changes: this.changes });
  });
});

// Create mentor
app.post("/mentors", (req, res) => {
  const data = req.body;
  db.run(
    `INSERT INTO mentors (mentor_name, mentor_age, mentor_phone_number, mentor_origin, mentor_home_language)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.mentor_name,
      data.mentor_age,
      data.mentor_phone_number,
      data.mentor_origin,
      data.mentor_home_language,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error creating mentor: " + err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update mentor
app.put("/mentors/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  db.run(
    `UPDATE mentors SET mentor_name = ?, mentor_age = ?, mentor_phone_number = ?, mentor_origin = ?, mentor_home_language = ? WHERE mentor_id = ?`,
    [
      data.mentor_name,
      data.mentor_age,
      data.mentor_phone_number,
      data.mentor_origin,
      data.mentor_home_language,
      id,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error updating mentor: " + err.message });
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete mentor
app.delete("/mentors/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM mentors WHERE mentor_id = ?", id, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error deleting mentor: " + err.message });
    }
    res.json({ changes: this.changes });
  });
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
