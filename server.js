const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB Atlas connection
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://gt11:gtx123@cluster0.km5cz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.log(err));

// Order schema and model
const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    contactNumber: String,
    product: String,
    price: Number,
    status: String,
    date: Date
});

const Order = mongoose.model('Order', orderSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/addOrder', (req, res) => {
    res.render('addOrder');
});

app.get('/viewOrders', (req, res) => {
    const filterDate = req.query.date ? new Date(req.query.date) : new Date();
    Order.find({ date: { $gte: filterDate.setHours(0, 0, 0, 0), $lt: filterDate.setHours(23, 59, 59, 999) } })
        .then(orders => {
            res.render('viewOrders', { orders, filterDate: req.query.date || '' });
        })
        .catch(err => console.log(err));
});

app.post('/addOrder', (req, res) => {
    const order = new Order({
        customerName: req.body.customerName,
        address: req.body.address,
        contactNumber: req.body.contactNumber,
        product: req.body.product,
        price: req.body.price,
        status: 'Scheduled for Delivery',
        date: new Date()
    });
    order.save()
        .then(() => res.redirect('/viewOrders'))
        .catch(err => console.log(err));
});

app.post('/updateOrder', (req, res) => {
    Order.findById(req.body.id)
        .then(order => {
            order.status = req.body.status;
            return order.save();
        })
        .then(() => res.redirect('/viewOrders'))
        .catch(err => console.log(err));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
