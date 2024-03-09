
const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();

//connect to data base
const db = new sqlite3.Database("./Database/task.sqlite");

// parse incoming requests
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS Tasks (
    TasksID INTEGER PRIMARY KEY,
    TaskTitle TEXT,
    TaskDescription TEXT,
    Importance TEXT,
    DueDate TIMESTAMP,
    TypeID INTEGER
)`);

// const newTableRoutes = require('./type.js'); // เชื่อมโยงไปยังไฟล์ใหม่

// // Use routes for new table
// app.use('/newtable', newTableRoutes); // ใช้เส้นทางสำหรับตารางใหม่

// Create a task
app.post("/tasks", (req, res) => {
  const { TaskTitle, TaskDescription, Importance, DueDate, TypeID } = req.body;
  db.run(
    `INSERT INTO Tasks (TaskTitle, TaskDescription, Importance, DueDate, TypeID) VALUES (?, ?, ?, ?, ?)`,
    [TaskTitle, TaskDescription, Importance, DueDate, TypeID],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.send("Task created successfully");  
    },
  );
});

// Read all tasks
app.get("/tasks", (req, res) => {
  db.all(`SELECT * FROM Tasks`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    res.json(rows);
  });
});

// Read a task by ID
app.get("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM Tasks WHERE TasksID = ?`, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    if (!row) {
      return res.status(404).send("Task not found");
    }
    res.json(row);
  });
});

// Update a task by ID
app.put("/tasks/:id", (req, res) => {
  const { TaskTitle, TaskDescription, Importance, DueDate, TypeID } = req.body;
  const { id } = req.params;
  db.run(
    `UPDATE Tasks SET TaskTitle=?, TaskDescription=?, Importance=?, DueDate=?, TypeID=? WHERE TasksID=?`,
    [TaskTitle, TaskDescription, Importance, DueDate, TypeID, id],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.send("Task updated successfully");
    },
  );
});

// Delete a task by ID
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM Tasks WHERE TasksID=?`, [id], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    res.send("Task deleted successfully");
  });
});
// Run server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

