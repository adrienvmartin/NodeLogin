const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env' })

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE,
});

const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory));

// Parse URL-encoded bodies as submitted by HTML forms
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies as submitted by API clients
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

db.connect((err) => {
  if (err) {
    console.log(err);
  }
  else {
    console.log("MySQL Connected")
  }
 });

// Define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
