const express = require('express');
const Sequelize = require('sequelize');
const app = express();

app.use(express.json());

// Annound where database is 
const sequelize = new Sequelize('database','username','password' , {
  host: 'localhost' ,
  dialect: 'sqlite',
  storage: '.library.db'
});

// DataBase of Tasks
const Task = sequelize.define('tasks',{
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  discription:{
    type: Sequelize.STRING,
    allowNull:false
  },
  duedate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  type_id:{
    type: Sequelize.INTEGER,
    allowNull: false
  }
  
});

//Database of TypeTask
const Type = sequelize.define('types',{
  type_id:{
    type: Sequelize.INTEGER,
    autoIncrement:true,
    primaryKey: true
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  totalTask: {
    type: Sequelize.INTEGER,
    allowNull: true,
  }
});

// สร้างตารางใหม่ในฐานข้อมูล
sequelize.sync().then(() => {
  // เพิ่มข้อมูลในตาราง types
  Type.bulkCreate([
    { type_id: 1, category: 'work' },
    { type_id: 2, category: 'general' },
    { type_id: 3, category: 'healthy' },
    { type_id: 4, category: 'hobby' }
  ]).then(() => {
    console.log('add to type sucess');
  }).catch(error => {
    console.error('adding to type is eror:', error);
  });
});


app.get('/tasks',(req,res) => {
  Task.findAll().then(tasks => {
    res.json(tasks);
  }).catch(err => {
    res.status(500).send(err);
  });
});

// show task by id
app.get('/tasks/:id', (req,res) => {
  Task.findByPk(req.params.id).then(tasks => {
    if(!tasks){
      res.status(404).send('Task not found');

    }else{
      res.json(tasks);
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

//create task and update taks in Type
app.post('/tasks',(req,res) => {
  const {title,discription,importantce,duedate,type_id} = req.body ;
  Type.findByPk(type_id).then((Type) => {
    if(!Type){
      res.status(404).send("Type Not Found");
    }
    else{
      Type.update({totalTask: Type.totalTask +1}).then(() =>{
        Task.create(req.body).then(tasks => {
          res.send(tasks);
        }).catch(err => {
          res.status(500).send(err)
        });
      }).catch(err => {
        res.status(500).send(err)
      });
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Listening on port ${port}...`));