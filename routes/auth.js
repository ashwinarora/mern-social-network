const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')

const transport = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.MAIL_KEY
    }
}))


// router.get('/protected', requireLogin, (req,res) => {
//     res.send('Hello user')
// })

router.post('/signup', async (req, res) => {
    const { name, email, password, pic } = req.body
    if (!email || !password || !name) {
        console.log(req.body)
        console.log('Incomplete information received')
        console.log({email, password, name})
        return res.status(422).json({ error: 'Incomplete Information' })
    }

    User.findOne({email: email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error: 'Email already exists'})
        }
        bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                name,
                pic
            })
            user.save()
            .then(user => {
                transport.sendMail({
                    to: user.email,
                    from: 'ashwin.social.network@outlook.com',
                    subject: 'Social Network Signup',
                    html: `<h3>Hi ${name}<br><br>Thank you for showing interest in my project, you have successfully signed up.<br><br>I would love to connect with you. You can reach me at ashwinarora48@gmail.com or +91 99587 10185. Please do not reply to this mail.<br><br>Regards,<br>Ashwin Arora<br>Developer of this Project</h3>`
                }).then( result => {
                    console.log(result)
                    console.log(`Email Sent to ${user.email}`)
                })
                res.json({message: 'Saved Successfully'})
            })
            .catch(err=> {
                console.log(err)
            })
        })
    })
    .catch(err => {
        console.log(err)
    })

    // same code as above, but with async await

    // try {
    //     const savedUser = await User.findOne({ email: email })
    //     if (savedUser) {
    //         console.log('User already exsists')
    //         console.log(savedUser)
    //         return res.status(422).json({ error: 'Email Already Exists' })
    //     }
    // } catch (err) {
    //     console.log(err)
    // }
    // try {
    //     const hashedPassword = await bcrypt.hash(password, 12)
    //     const user = new User({ email, password: hashedPassword, name })
    //     const newUser = await user.save()
    //     res.json({ message: 'User Added Successfully' })
    // } catch (err) {
    //     console.log(err)
    // }

})

router.post('/signin', (req,res) => {
    const { email, password} = req.body
    if(!email || !password){
        return res.status(422).json({error: 'Please provide email or password'})
    }
    User.findOne({email: email})
    .then( savedUser => {
        if(!savedUser){
            return res.status(422).json({error: 'Invalid Email or Password'})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                // res.json({message: 'Successfully Signed In'})
                const token = jwt.sign({_id: savedUser._id} , JWT_SECRET)
                const { _id, name, email, pic, followers, following } = savedUser
                res.json({
                    token,
                    user: {_id, name, email, pic, followers, following}
                })
            } else {
                return res.status(422).json({error: 'Invalid Email or Password'})
            }
        }).catch(err => {
            console.log(err)
        })
    })
})

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes( 32, (err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"Email not found"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transport.sendMail({
                    to:user.email,
                    from:"ashwin.social.network@outlook.com",
                    subject:"Password Reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="https://socialnetwork-ashwin.herokuapp.com/reset/${token}">link</a> to reset /password</h5>
                    `
                })
                res.json({message:"check your email"})
            })

        })
    })
})

router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12)
        .then( hashedpassword => {
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"Password Updated Successfully"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})

module.exports = router
