const express = require('express')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose')
const { MONGO_URI } = require('./keys')

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
    console.log('Successfully Connected to MongoDB')
})

mongoose.connection.on('error', () => {
    console.log('Connection Failed to MongoDB')
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})
