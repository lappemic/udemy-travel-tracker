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
  let visitedCountriesCodes = [];

  db.query('SELECT country_code FROM visited_countries', (err, res) => {
    if (err) {
      console.log('Error executing query: ', err.stack);
    } else {
      const queryResult = res.rows;
      console.log('query result: ', queryResult);

      visitedCountriesCodes = queryResult.map(code => code.country_code);
      console.log('visitedCountriesCodes: ', visitedCountriesCodes);
    }
  });

  res.render('index.ejs', {
    countries: visitedCountriesCodes,
    total: visitedCountriesCodes.length,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
