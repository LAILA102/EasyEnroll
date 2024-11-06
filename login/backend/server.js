const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  // Allows requests only from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    credentials: true  // If you need cookies or authentication
  }));

app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "Software",
    password: "software123",
    database: "students",

})

app.options('/login', cors());

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM app_students WHERE username = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) =>{
        if(err) return res.json("Error");
        if(data.length > 0){
            return res.json("Login Successfully")
        } else{
            return res.json("No Record")
        }
    })
})

app.listen(8081, () =>{
    console.log("Listening...");
}) 