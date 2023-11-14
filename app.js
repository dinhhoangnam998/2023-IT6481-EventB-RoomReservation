require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cors = require('cors');
app.use(cors());

// endpoints
app.use('/api/users', require('./src/routes/user'));
app.use('/api/rooms', require('./src/routes/room'));
app.use('/api/reservations', require('./src/routes/reservation'));

const { handleError } = require("./src/errors/handle-errors-middleware");
app.use(handleError);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

const { init } = require('./init');
init()
