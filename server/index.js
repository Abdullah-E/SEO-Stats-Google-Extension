const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB not connected', err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))

app.use('/', require('./routes/authRoutes'));

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
