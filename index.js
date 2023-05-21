const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jki4viv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const categories = client.db('toys').collection('cattagory');
        const products = client.db('toys').collection('products');




        app.get('/categories', async(req, res) => {
            const toys = categories.find();
            const result = await toys.toArray();
            res.send(result)
        })

        app.get('/products', async(req, res) => {

            let limit = 0
            console.log(req.query?.limit)
            if (req.query?.limit) {
                limit = parseInt(req.query.limit)
            }
            let  searchQuery = ''
            if (req.query?.search){
                searchQuery = req.query.search
            }
            const regex = new RegExp(searchQuery, 'i');
            const toys = products.find({ name: { $regex: regex } }).limit(limit);
            const result = await toys.toArray();
            res.send(result)
        })
        app.get('/my-toys', async(req, res) => {

            let order = 1;
            if (req.query?.sort == 'asc'){
                order = 1;
            }else if (req.query?.sort == 'desc'){
                order = -1;
            }
            if(req.query?.email){
                query = {email:req.query.email}
                const toys = products.find(query).sort({price:order});
                const result = await toys.toArray();
                res.send(result)
            }else {
                res.send([])
            }


        })
        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await products.findOne(query);
            res.send(result)
        })

        app.post('/addToy', async(req, res) => {
                const toy = req.body;
                const result = await products.insertOne(toy);
                res.send(result)
            })
        app.patch('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const toy = req.body;
            const UpdatedToy = {
                $set: toy,
            };
            const result = await products.updateOne(filter, UpdatedToy)
            res.send(result)
        })

        app.get('/product-cat/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {category_id:id}
            const toys = products.find(filter);
            const result = await toys.toArray();
            res.send(result)
        })
        app.delete('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await products.deleteOne(query);
            res.send(result)
        })
            // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Teddy bear')
})

app.listen(port, () => {
    console.log('teddy bear', port)
})