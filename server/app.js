const express = require('express');
const db = require('./db');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const albumRoutes = require('./routes/albumRoutes');
const photoRoutes = require('./routes/photoRoutes');
const userRoutes = require('./routes/userRoutes');
const checkBlocked = require('./middleware/checkBlocked');

const app = express();

app.use(cors());
app.use(express.json());
app.use(checkBlocked);

app.use('/', authRoutes);
app.use('/', todoRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/albums', albumRoutes);
app.use('/photos', photoRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Server + MySQL Working!');
});



app.listen(3000, () => {
    console.log('Server running on port 3000');
});