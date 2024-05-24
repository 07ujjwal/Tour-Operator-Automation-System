const dotenv = require('dotenv');
const app = require('./app');
const mongoosh = require('mongoose');

dotenv.config({ path: './configurations.env' });

mongoosh
  .connect(process.env.DATABASE, {})
  .then(() => console.log('Connected to MongoDB Data Base'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas', err));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
