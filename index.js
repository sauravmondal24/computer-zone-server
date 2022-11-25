const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
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

		app.get('/mainCategory', async (req, res) => {
			const query = {};
			const option = await mainCategoryCollection.find(query).toArray();
			res.send(option);
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
