require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const parchiTypeRoutes = require('./routes/parchiTypes');
const ticketRoutes = require('./routes/tickets');
const reportRoutes = require('./routes/reports');
const membershipRoutes = require('./routes/memberships');
const membershipTypeRoutes = require('./routes/membershipTypes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parchi-types', parchiTypeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/membership-types', membershipTypeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
