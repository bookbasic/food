const express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
const multer = require('multer');
const app = express();
app.use(express.json());
var port = "8080";
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })
/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log(file)
        console.log(req)
        cb(null, Date.now())
    }
})
const upload = multer({ storage: storage })
*/
var db;
MongoClient.connect("mongodb+srv://root:1234@cluster0.n0eqx.gcp.mongodb.net", function (error, client) {
    //MongoClient.connect("mongodb://localhost:27017", function (error, client) {
    if (error) throw error;
    db = client.db("food")
})
app.get('/api/alldata', (req, res) => {
    db.collection("category").aggregate([
        {
            $lookup: {
                from: "product",
                localField: "_id",
                foreignField: "category_id",
                as: "products",
            }
        }
    ]).toArray(function (err, result) {
        if (!err)
            res.json({
                status: "success",
                message: "alldata get successfully",
                data: result
            });
    });
});

app.get('/api/allshop', (req, res) => {
    db.collection("shop").find().toArray(function (err, result) {
        if (!err)
            res.json({
                status: "success",
                message: "alldata get successfully",
                data: result
            });
    });
});
app.get('/api/category/:id', (req, res) => {
    var find = {}
    if (req.params.id != "all") find._id = new ObjectID(req.params.id);
    console.log(find);
    db.collection("category").find(find).toArray(function (err, result) {
        if (!err)
            res.json({
                status: "success",
                message: "category get successfully",
                data: result
            });
    });
});
app.post('/api/category', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    db.collection("category").insertOne(req.body, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "category post successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.put('/api/category', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    var myquery = { _id: new ObjectID(req.body._id) };
    delete req.body._id;
    db.collection("category").updateOne(myquery, { $set: req.body }, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "category put successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.delete('/api/category/:id', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    var myquery = { _id: new ObjectID(req.params.id) };
    db.collection("category").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "category delete successfully",
            data: req.params.id
        });
    });
});

app.get('/api/product/:id', (req, res) => {
    var find = {}
    if (req.params.id != "all") find._id = new ObjectID(req.params.id);
    console.log(find);
    db.collection("product").find(find).toArray(function (err, result) {
        if (!err)
            res.json({
                status: "success",
                message: "product get successfully",
                data: result
            });
    });
});
app.post('/api/product', upload.single('file'), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    req.body.category_id = new ObjectID(req.body.category_id)
    if (req.file) req.body.path = req.file.path
    db.collection("product").insertOne(req.body, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "product post successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.put('/api/product', upload.single('file'), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    req.body.category_id = new ObjectID(req.body.category_id)
    var myquery = { _id: new ObjectID(req.body._id) };
    delete req.body._id;
    if (req.file) req.body.path = req.file.path
    db.collection("product").updateOne(myquery, { $set: req.body }, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "product put successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.delete('/api/product/:id', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    var myquery = { _id: new ObjectID(req.params.id) };
    db.collection("product").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "product delete successfully",
            data: req.params.id
        });
    });
});

app.post('/api/shop', upload.single('file'), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    req.body.category_id = new ObjectID(req.body.category_id)
    if (req.file) req.body.path = req.file.path
    db.collection("shop").insertOne(req.body, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "shop post successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.put('/api/shop', upload.single('file'), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    req.body.category_id = new ObjectID(req.body.category_id)
    var myquery = { _id: new ObjectID(req.body._id) };
    delete req.body._id;
    if (req.file) req.body.path = req.file.path
    db.collection("shop").updateOne(myquery, { $set: req.body }, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: " put successfully",
            data: result.insertedId
        });
    });
    //res.json(req.body);
});
app.delete('/api/shop/:id', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    var myquery = { _id: new ObjectID(req.params.id) };
    db.collection("shop").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "shop delete successfully",
            data: req.params.id
        });
    });
});

app.post('/api/order', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    db.collection("order").insertOne(req.body, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "order post successfully",
            data: result.insertedId
        });
    });
});
app.put('/api/order', upload.none(), (req, res) => {
    console.log(req.body);req.body.created_at=new Date()
    console.log(req.file);
    var myquery = { _id: new ObjectID(req.body._id) };
    delete req.body._id;
    db.collection("order").updateOne(myquery, { $set: req.body }, function (err, result) {
        if (err) throw err;
        res.json({
            status: "success",
            message: "order put successfully",
            data: result.insertedId
        });
    });
});

app.get('/app/:role', (req, res) => {
    var header = fs.readFileSync(__dirname + '/header.html');
    var func = fs.readFileSync(__dirname + '/func.js');
    var add='';
    //console.log(req.params.role)
    if(req.params.role!='shell')
        add="<style>.setup{display:none;}</style>"
    //var content = fs.readFileSync(__dirname + '/' + req.params.page + '');  
    var content = fs.readFileSync(__dirname + '/index.html');  

    var footer = fs.readFileSync(__dirname + '/footer.html');
    res.send(header + "<script>" + func + "</script>" + add + content + footer);
    //res.sendFile(__dirname + '/'+req.params.page+'');
});
app.get('/uploads/:page', (req, res) => {
    var content = fs.readFileSync(__dirname + '/uploads/' + req.params.page + '');
    res.send(content);
    //res.sendFile(__dirname + '/'+req.params.page+'');
});

app.listen(port, () => console.log(`Listening on port${port}...`));