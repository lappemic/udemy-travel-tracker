import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'WhyPostgres?',
  port: 5432,
});
db.connect();

app.get('/', async (req, res) => {
  const result = await db.query('SELECT country_code FROM visited_countries');
  let visitedCountriesCodes = [];
  result.rows.map(code => visitedCountriesCodes.push(code.country_code));

  res.render('index.ejs', {
    countries: visitedCountriesCodes,
    total: visitedCountriesCodes.length,
  });
});

app.post('/add', async (req, res) => {
  // Get new Country input
  const newCountry = req.body.country;

  // Get all country Codes
  const countryCodesResult = await db.query('SELECT id, country_code, country_name FROM countries');

  // Get all visited Countries
  const visitedCountriesResult = await db.query('SELECT country_code FROM visited_countries');
  let visitedCountriesCodes = [];
  visitedCountriesResult.rows.map(code => visitedCountriesCodes.push(code.country_code));

  // Get the countryCode of the newCountry
  let newCountryCode;

  try {
    // Get the countryCode of the newCountry
    newCountryCode = countryCodesResult.rows.find(
      country => country.country_name === newCountry
    ).country_code;

    if (!newCountryCode) {
      throw new Error('Country code not found.');
    }
  } catch (error) {
    // Handle the error
    console.error('Error finding country code:', error);
  }

  // Check if the newCountryCode is already in the visitedCountriesCodes
  try {
    if (visitedCountriesCodes.includes(newCountryCode)) {
      console.log('Country already exists');
      res.redirect('/');
    } else {
      console.log('Country does not exist');
      await db.query('INSERT INTO visited_countries (country_code) VALUES ($1)', [newCountryCode]);
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error:', error);
    // res.status(500).send('An error occurred');
    res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
