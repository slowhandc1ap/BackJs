const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const router = express.Router(); // สร้าง Express Router
//connect to data base
const db = new sqlite3.Database("./Database/task.sqlite");

// parse incoming requests
app.use(express.json());

// CREATE TABLE TasksType
db.run(`CREATE TABLE IF NOT EXISTS TasksType (
    TypeID INTEGER PRIMARY KEY,
    TypeName TEXT
)`);

// INSERT INTO TasksType with default values
db.run(`INSERT OR IGNORE INTO TasksType (TypeID, TypeName) VALUES 
    (1, 'work'),
    (2, 'General'),
    (3, 'Health'),
    (4, 'Hobby')
`, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Default data inserted into TasksType successfully');
    }
});

app.get("/tasksType", (req, res) => {
    db.all(`SELECT * FROM TasksType`, (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.json(rows);
    });
  });

// Run server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });