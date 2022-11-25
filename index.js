const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

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
		const mainCategoryCollection = client
			.db('computerZone')
			.collection('MainCategoryData');
		const usersCollection = client.db('computerZone').collection('users');
		const allProductCollection = client
			.db('computerZone')
			.collection('allProduct');

		app.get('/mainCategory', async (req, res) => {
			const query = {};
			const option = await mainCategoryCollection.find(query).toArray();
			res.send(option);
		});

		app.get('/jwt', async (req, res) => {
			const email = req.query.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (user) {
				const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
					expiresIn: '1h'
				});
				return res.send({ accessToken: token });
			}
			console.log(user);
			res.status(403).send({ accessToken: '' });
		});

		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		app.get('/users/admin/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email };
			const user = await usersCollection.findOne(query);
			res.send({ isAdmin: user?.role === 'admin' });
		});
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
		app.get('/users/buyer', async (req, res) => {
			const query = { role: 'buyer' };
			const users = await usersCollection.find(query).toArray();
			res.send(users);
		});

		// Products api

		app.post('/addProduct', async (req, res) => {
			const product = req.body;
			const result = await allProductCollection.insertOne(product);
			res.send(result);
		});

		// app.get('/myProducts', async (req, res) => {
		// 	const query = {};
		// 	const result = await allProductCollection.find(query).toArray();
		// 	res.send(result);
		// });

		app.get('/myProducts/:category', async (req, res) => {
			const filter = req.params.category;
			const query = { category: filter };
			const appleProduct = await allProductCollection.find(query).toArray();
			res.send(appleProduct);
		});
		app.get('/myProducts', async (req, res) => {
			const seller = req.query.seller;
			console.log(seller);
			// console.log(filter);
			if (seller) {
				const filter = { seller: seller };
				const appleProduct = await allProductCollection.find(filter).toArray();
				res.send(appleProduct);
			}
			const query = {};
			const result = await allProductCollection.find(query).toArray();
			res.send(result);
		});

		// app.get('/myProducts', async (req, res) => {
		// 	const query = req.params.seller;
		// 	console.log(query);
		// 	// console.log(filter);
		// 	const filter = { seller: query };
		// 	const appleProduct = await allProductCollection.find(filter).toArray();
		// 	res.send(appleProduct);
		// });
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
