const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// middle ware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xzekhbt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1
});

async function run() {
	try {
		// All collection
		const mainCategoryCollection = client
			.db('computerZone')
			.collection('MainCategoryData');
		const usersCollection = client.db('computerZone').collection('users');
		const allProductCollection = client
			.db('computerZone')
			.collection('allProduct');
		const buyerOrdersCollection = client
			.db('computerZone')
			.collection('buyerOrders');
		const paymentsCollection = client.db('computerZone').collection('payments');

		// Category API

		app.get('/mainCategory', async (req, res) => {
			const query = {};
			const option = await mainCategoryCollection.find(query).toArray();
			res.send(option);
		});

		// User API

		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// Admin role verify

		app.get('/users/admin/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email };
			const user = await usersCollection.findOne(query);
			res.send({ isAdmin: user?.role === 'admin' });
		});

		// Seller API
		app.get('/users/seller/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email };
			const user = await usersCollection.findOne(query);
			res.send({ isSeller: user?.role === 'seller' });
		});

		app.get('/users/seller', async (req, res) => {
			const query = { role: 'seller' };
			const users = await usersCollection.find(query).toArray();
			res.send(users);
		});

		app.delete('/users/seller/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const result = await usersCollection.deleteOne(filter);
			res.send(result);
		});
		// Buyer API
		app.get('/users/buyer', async (req, res) => {
			const query = { role: 'buyer' };
			const users = await usersCollection.find(query).toArray();
			res.send(users);
		});

		app.delete('/users/buyer/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const result = await usersCollection.deleteOne(filter);
			res.send(result);
		});
		// Add product API
		app.post('/addProduct', async (req, res) => {
			const product = req.body;
			const result = await allProductCollection.insertOne(product);
			res.send(result);
		});

		// ALl Products API

		app.get('/myProducts/:category', async (req, res) => {
			const filter = req.params.category;
			const query = { category: filter };
			const appleProduct = await allProductCollection.find(query).toArray();
			res.send(appleProduct);
		});

		app.get('/myProducts', async (req, res) => {
			const seller = req.query.seller;
			if (seller) {
				const filter = { seller: seller };
				const appleProduct = await allProductCollection.find(filter).toArray();
				return res.send(appleProduct);
			}
			const query = {};
			const result = await allProductCollection.find(query).toArray();
			res.send(result);
		});

		// Buyer Products API
		app.post('/buyerOrders', async (req, res) => {
			const orders = req.body;
			const result = await buyerOrdersCollection.insertOne(orders);
			res.send(result);
		});

		app.get('/buyerOrder', async (req, res) => {
			const query = {};
			const result = await buyerOrdersCollection.find(query).toArray();
			res.send(result);
		});

		app.delete('/buyerOrder/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const result = await buyerOrdersCollection.deleteOne(filter);
			res.send(result);
		});

		app.get('/buyerOrders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const order = await buyerOrdersCollection.findOne(query);
			res.send(order);
		});

		// Stripe Payment system

		app.post('/create-payment-intent', async (req, res) => {
			const buyerOrders = req.body;
			const price = buyerOrders.price;
			const amount = price * 100;

			const paymentIntent = await stripe.paymentIntents.create({
				currency: 'usd',
				amount: amount,
				payment_method_types: ['card']
			});
			res.send({
				clientSecret: paymentIntent.client_secret
			});
		});

		app.post('/payments', async (req, res) => {
			const payment = req.body;
			const result = await paymentsCollection.insertOne(payment);
			const id = payment.orderId;
			const filter = { _id: ObjectId(id) };
			const updatedDoc = {
				$set: {
					paid: true,
					transactionId: payment.transactionId
				}
			};
			const updatedResult = await buyerOrdersCollection.updateOne(
				filter,
				updatedDoc
			);
			res.send(result);
		});
	} finally {
	}
}
run().catch(console.log);

app.get('/', (req, res) => {
	res.send('Computer Zone server is running');
});

app.listen(port, () => {
	console.log(`Computer zone server is running on ${port} port`);
});
