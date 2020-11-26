const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    expireToken: String,
    pic:{
        type: String,
        default: "https://cdn.vox-cdn.com/thumbor/YKll2AJSVqmLtCgVPhEYyx6BSyo=/305x0:620x300/920x613/filters:focal(416x93:514x191):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/54012879/twitter_eggandgumdrop.0.jpg"
    },
    followers: [{type: ObjectId, ref: 'User'}],
    following: [{type: ObjectId, ref: 'User'}]
})

mongoose.model('User', userSchema)
