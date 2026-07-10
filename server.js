const express = require('express');
const morgan = require('morgan')
const port = 3000;

const app = express();

app.use(morgan('common'))
app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});