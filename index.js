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
  task_id: {
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
    type: Sequelize.DATEONLY, // ใช้ Sequelize.DATEONLY แทน Sequelize.DATE เพื่อเก็บวันที่เท่านั้น
    allowNull: false,
   
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

//dateabse of assignment
const Assignment = sequelize.define('assignments',{
  assign_id:{
    type: Sequelize.INTEGER,
    autoIncrement:true,
    primaryKey: true
  },
  task_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  }
  
});

const User = sequelize.define('user', {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true // Ensure email is unique
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});




sequelize.sync()
// //สร้างตารางใหม่ในฐานข้อมูล
// sequelize.sync().then(() => {
//   // เพิ่มข้อมูลในตาราง types
//   Type.bulkCreate([
//     { type_id: 1, category: 'work' },
//     { type_id: 2, category: 'general' },
//     { type_id: 3, category: 'healthy' },
//     { type_id: 4, category: 'hobby' }
//   ]).then(() => {
//     console.log('add to type sucess');
//   }).catch(error => {
//     console.error('adding to type is eror:', error);
//   });
// });


app.get('/tasks',(req,res) => {
  Task.findAll().then(tasks => {
    res.json(tasks);
  }).catch(err => {
    res.status(500).send(err);
  });
});

// show task by id
app.get('/tasks/:task_id', (req,res) => {
  Task.findByPk(req.params.task_id).then(tasks => {
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
  const {title, discription, duedate, type_id} = req.body ;
  Type.findByPk(type_id)
    .then((Type) => {
      if(!Type){
        res.status(404).send("Type Not Found");
      }
      else{
        Type.update({totalTask: Type.totalTask + 1})
          .then(() =>{
            const moment = require('moment');

            // Convert duedate to English format before creating the task
            //const formattedDueDate = moment(duedate).format('DD MMMM YY');
            
            // Create the task with the formatted duedate
            Task.create({
              title: title,
              discription: discription,
              duedate: duedate,
              type_id: type_id
            }).then(tasks => {
              res.send(tasks);
              
            }).catch(err => {
              res.status(500).send(err);
            });
          }).catch(err => {
            res.status(500).send(err);
          });
      }
    }).catch(err => {
      res.status(500).send(err);
    });
});



// show Task follow type_id (if use serch task_id == 1 that shoud show optity of task of type id =1)

// app.get('/taksintypes/:task_id', (req,res) => {
//   const {type_id}= req.params;
//   Type.findByPk(type_id).then(() => {
//     Task.findAll({where: {type_id : type_id}}).then((tasks)=>{
//       res.json(tasks);
//     }).catch (err => {
//       res.status(500).send(err);
//     });
//   }).catch (err => {
//     res.status(500).send(err);
//   })
// })
app.get('/tasksintypes/:type_id', (req, res) => {
  const { type_id } = req.params;
  Task.findAll({ where: { type_id: type_id } })
    .then((tasks) => {
      res.json(tasks);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});


//to Edit or Update tasks
app.put('/tasks/:task_id', (req,res) => {
  Task.findByPk(req.params.task_id).then(tasks => {
    if(!tasks) {
      res.status(400).send('Tasks not found');
    }else {
      tasks.update(req.body).then(() => {
        res.send(tasks);
      }).catch(err => {
        res.status(500).send(err);
      });
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

//for delete a tasks
app.delete('/tasks/:task_id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.task_id);
    if (!task) {
      return res.status(404).send('Task not found');
    }

    const typeId = task.type_id;
    const type = await Type.findByPk(typeId);
    if (!type) {
      return res.status(404).send('Type not found');
    }

    await type.update({ totalTask: type.totalTask - 1 });

    await task.destroy();

    // Delete related assignments
    await Assignment.destroy({ where: { task_id: req.params.task_id } });

    res.send({});
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});



//Type
//page to show all Type

app.get('/types',(req,res) => {
  Type.findAll().then(types => {
    res.json(types);
  }).catch(err => {
    res.status(500).send(err);
  });
});


//page to show type by id
app.get('/types/:id' , (req,res) => {
  Type.findByPk(req.params.id).then(types => {
    if(!types){
      res.status(404).send('Types not found');
    }else{
      res.json(types);
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

//to create new type
app.post('/types',(req,res) => {
  Type.create(req.body).then(types => {
    res.send(types);
  }).catch(err => {
    res.status(500).send(err);
  });
});

//update TYPE
app.put('/types/:id' , (req,res) =>{
  Type.findByPk(req.params.id).then(types => {
    if(!types) {
      res.status(400).send('Type not found');
    } else {
      types.update(req.body).then(() =>{
        res.send(types);
      }).catch(err => {
        res.status(500).send(err);
      });
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

//delete a types

app.delete('/types/:id' , (req,res) => {
  Type.findByPk(req.params.id).then(types => {
    if(!types){
      res.status(404).send('Types not found !');

    }else{
      types.destroy().then(() => {
        res.send({});
      }).catch(err => {
        res.status(500).send(err);
      });
    }
  }).catch(err=> {
    res.status(500).send(err);
  });
});


//ASIGN

app.get('/assignments', (req, res) => {
  Assignment.findAll().then(assignments => {
    res.json(assignments);
  }).catch(err => {
    res.status(500).send(err);
  });

});

app.get('/assignments/:assign_id', (req, res) => {
  Assignment.findByPk(req.params.assign_id).then(assignments => {
    if (!assignments) {
      res.status(404).send('Assignment not found');
    } else {
      res.json(assignments);
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

// Create a new Assignment
app.post('/assignments', (req, res) => {
  Assignment.create(req.body).then(assignment => {
    res.send(assignment);
  }).catch(err => {
    res.status(500).send(err);
  });
});

app.put('/assignments/:assign_id', (req, res) => {
  Assignment.findByPk(req.params.assign_id).then(assignment => {
    if (!assignment) {
      res.status(400).send('Assignment not found');
    } else {
      assignment.update(req.body).then(() => {
        res.send(assignment);
      }).catch(err => {
        res.status(500).send(err);
      });
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});


app.delete('/assignments/:assign_id', (req, res) => {
  const assignId = req.params.assign_id;

  Assignment.findByPk(assignId)
    .then(assignment => {
      if (!assignment) {
        return res.status(404).send('Assignment not found');
      } else {
        const taskId = assignment.task_id;
        const userId = assignment.user_id;
        
        // ค้นหาและลบเเถวที่มี task_id และ user_id เหมือนกับ assignment ที่ต้องการลบ
        Assignment.destroy({ where: { task_id: taskId, user_id: userId } })
          .then(() => {
            // ลบ assignment ที่ต้องการ
            assignment.destroy().then(() => {
              res.send({});
            }).catch(err => {
              res.status(500).send(err);
            });
          })
          .catch(err => {
            res.status(500).send(err);
          });
      }
    })
    .catch(err => {
      res.status(500).send(err);
    });
});



//USER
app.get('/users', (req, res) => {
  User.findAll()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

// Get user by UserID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByPk(id)
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        res.json(user);
      }
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

// Create a new user
app.post('/users', (req, res) => {
  const { username, email, password } = req.body;
  User.create({ username, email, password })
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

// Update a user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByPk(id)
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        const { username, email, password } = req.body;
        user.update({ username, email, password })
          .then(() => {
            res.send(user);
          })
          .catch(err => {
            res.status(500).send(err);
          });
      }
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByPk(id)
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        user.destroy()
          .then(() => {
            res.send({});
          })
          .catch(err => {
            res.status(500).send(err);
          });
      }
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

//เเสดงว่าuserคนนี้มีกี่งาน
app.get('/usersontasks/:user_id', (req, res) => {
  const { user_id } = req.params;

  // Find all assignments for the specified user
  Assignment.findAll({ where: { user_id: user_id } })
    .then(assignments => {
      // If no assignments found for the user, send an empty array
      if (assignments.length === 0) {
        res.json([]);
      } else {
        // Extract task IDs from assignments
        const taskIds = assignments.map(assignment => assignment.task_id);

        // Find tasks associated with the extracted task IDs
        Task.findAll({ where: { task_id: taskIds } })
          .then(tasks => {
            
            res.json(tasks);
          })
          .catch(err => {
            res.status(500).send(err);
          });
      }
    })
    .catch(err => {
      res.status(500).send(err);
    });
});


const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Listening on port ${port}...`));