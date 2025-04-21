
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const pollRoutes = require('./routes/pollRoutes');
const authRoutes = require('./routes/authRoutes');
const socketHandler = require('./socket/socketHandler');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api', pollRoutes);
app.use('/api', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

socketHandler(io);


app.get('/', (req, res) => {
    res.send('Poll App API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});