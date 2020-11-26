const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model('Post')

router.get('/allpost', requireLogin, (req, res) => {
    Post.find()
    .populate('postedBy', '_id name pic')
    .populate("comments.postedBy", "_id name")
    .sort('-createdAt')
    .then(posts => {
        res.json({posts})
    }).catch(err => {
        console.log(err)
    })
})

router.get('/followedPosts', requireLogin, (req, res) => {
    Post.find({postedBy: {$in: req.user.following}})
    .populate('postedBy', '_id name pic')
    .populate("comments.postedBy", "_id name")
    .sort('-createdAt')
    .then(posts => {
        res.json({posts})
    }).catch(err => {
        console.log(err)
    })
})

router.post('/createpost', requireLogin, (req, res) => {
    console.log('new post')
    const { title, body, pic } = req.body
    if(!title || !body){
        return res.status(422).json({error: 'Please add title and body'})
    }
    req.user.password = undefined
    if(!pic){
        const post = new Post({
            title,
            body,
            postedBy: req.user
        })
        post.save()
        .then(result => {
            res.json({post: result})
        }).catch(err => {
            console.log(err)
        })
    } else{
        const post = new Post({
            title,
            body,
            photo: pic,
            postedBy: req.user
        })
        post.save()
        .then(result => {
            res.json({post: result})
        }).catch(err => {
            console.log(err)
        })
    }
})

router.get('/mypost', requireLogin, (req, res) => {
    console.log(req.user._id)
    Post.find({postedBy: req.user._id})
    .populate('PostedBy', '_id name pic')
    .populate("comments.postedBy", "_id name")
    .then(mypost => {
        res.json({mypost})
    }).catch(err => {
        console.log(err)
    })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {likes: req.user._id}
    }, {
        new: true
    }).exec((err, result) => {
        if(err) {
            return res.status(422).json({error : err})
        } else {
            res.json(result)
        }
    })
})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {likes: req.user._id}
    }, {
        new: true
    }).exec((err, result) => {
        if(err) {
            return res.status(422).json({error : err})
        } else {
            res.json(result)
        }
    })
})

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    }, {
        new: true
    })
    .populate("comments.postedBy", "_id name")
    .populate('postedBy', '_id name pic')
    .exec((err, result) => {
        if(err) {
            return res.status(422).json({error : err})
        } else {
            res.json(result)
        }
    })
})

router.delete('/deletePost/:postId', requireLogin, (req, res) => {
    console.log('delete clicked')
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")
    .exec((err, post) => {
        if( err || !post){
            console.log({err, post})
            return res.status(422).json({error: err})
        }
        if (post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then( result => {
                console.log('deleted')
                res.json(result)
            })
            .catch( err => {
                console.log(err)
            })
        } else {
            console.log('unexpected error')
        }
    })
})

module.exports = router
