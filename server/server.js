// using express
const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http)
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Document = require("./model.js")






//Using CORS policy
const cors = require("cors");
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
dotenv.config()
const path = require("path")

// mongoose connection 
const data_connection = () => {
    mongoose.set("strictQuery", false);
    mongoose
        .connect(process.env.CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: true,
        })
        .then(console.log("Connected to MongoDB"))
        .catch((err) => console.log(err))
}

//connection to server
const port = process.env.PORT || 4000
data_connection();
http.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
);

app.use(express.json())



app.get('/', function (req, res) {
    res.send('Hello');
});



const defaultValue = ""

io.on("connect", socket => {

    console.log(socket.id)

    // get-document emit pe ye event fire hoga.....document_id client dega 
    socket.on("get-document", async documentId => {
        // document will be created with the given id 
        const document = await findOrCreateDocument(documentId)

        // Adds the socket to the given room or to the list of rooms....for ex ...if other person access the document
        socket.join(documentId)

        
        socket.emit("load-document", document.data)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) return

    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
}






module.exports = app;