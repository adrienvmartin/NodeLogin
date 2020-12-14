const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' })


const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        message: 'Please enter an email/password'
      })
    } 

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      console.log(results);
      if (!results || !(await bcrypt.compare(password, results[0].password))) {
        return res.status(401).render('login', {
          message: 'Email or password is incorrect'
        })
      } else {
        const id = results[0].id;
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions);
        res.status(200).redirect("/");
      }
    })

  } catch (err) {
    console.log(err);
}
};

exports.register = (req, res) => {
  console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;

  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
    if (error) {
      console.log(error)
    }

    if (result.length > 0) {
      return res.render('register', {
        message: 'That email is already in use'
      })
    } else if (password !== passwordConfirm) {
      return res.render('register', {
        message: 'Passwords do not match'
      })
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO users SET ?', {
      name: name,
      email: email,
      password: hashedPassword
    }, (error, results) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Results: " + results);
          return res.render('register', {
            message: 'User registered'
          });
        }
    })
  });
  
};
