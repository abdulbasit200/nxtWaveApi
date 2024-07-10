// console.log('Hello from app.js... here is the code.');
const express = require('express');
const {connectToDb, getDb} = require('./db');
// Initialize the app
const app = express();
// Set up middleware
// Parse incoming JSON
app.use(express.json());

let db;

connectToDb((err) => {
	if (!err){
		app.listen(3001, () => {
			console.log('Server is runnig on port 3001')
		});
		db = getDb();
 	}
});

// app.listen(3001, () => {
// 	console.log('Server is running on port 3001');
// })

// Creating our RESTful API endpoints
// Defining the API routes here
// Reading multiple students
app.get('/api/students', (req, res) => {
	// We have 120 records in our database, now we can't really send all of them at once
	// So we will use pagination (limit and skip)
	// If somebody is requesting ://localhost:3001/api/students?p=0
    const page = req.query.p || 0;
    const studentsPerPage = 10;
    let students = [];
    db.collection('students')
    .find()
    .sort({ id: 1 })
    .skip(page * studentsPerPage)
    .limit(studentsPerPage)
    .forEach(student => students.push(student))
    .then(() => {
        res.status(200).json(students)
    })
    .catch(() => {
        res.status(500).json({msg: 'Error getting users'})
    })
})

// Reading a student
app.get('/api/students/:id', (req, res) => {
    const studentID = parseInt(req.params.id);
    if (!isNaN(studentID)){
		// show the student info
        db.collection('students')
        .findOne({id: studentID})
		.then((student) => {
			if (student){
				res.status(200).json(student)
			} else {
				res.status(404).json({msg: 'Err: id not found'})
			}
		})
		.catch(() => {
			res.status(500).json({msg: 'Error getting student info'})
		})
	} else {
		// show an error
		res.status(400).json({msg: 'Err: id must be a number'})
	}
})

// Creating a student
app.post('/api/students', (req, res) => {
	const studnet = req.body;
	db.collection('students')
    .insertOne(studnet)
    .then((result) => {
        res.status(200).json(result);
    })
    .catch(() => {
        res.status(500).json({msg: 'Error creating student'})
    })
})

// Updating a student
app.patch('/api/students/:id', (req, res) => {
	let updates = req.body;
	const studentID = parseInt(req.params.id);
    if (!isNaN(studentID)){
		// update the student info
        db.collection('students')
        .updateOne(
			{id: studentID},
			{$set: updates}
		)
		.then((result) => {
			res.status(200).json({result})
		})
		.catch(() => {
			res.status(500).json({msg: 'Error updating student info'})
		})
	} else {
		// show an error
		res.status(400).json({msg: 'Err: id must be a number'})
	}
})

// Deleting a student
app.delete('/api/students/:id', (req, res) => {
	const studentID = parseInt(req.params.id);
    if (!isNaN(studentID)){
		// delete the student info
        db.collection('students')
        .deleteOne({id: studentID})
		.then((result) => {
			res.status(200).json({result})
		})
		.catch(() => {
			res.status(500).json({msg: 'Error deleting student info'})
		})
	} else {
		// show an error
		res.status(400).json({msg: 'Err: id must be a number'})
	}
})