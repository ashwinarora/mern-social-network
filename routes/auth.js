const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
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
                    from: 'Social Network by Ashwin Arora <socialnetwork@ashwinarora.com>',
                    replyTo: 'contact@ashwinarora.com',
                    subject: 'Welcome to Social Network',
                    html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html><head><META http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body><div style="margin:0;padding:0;background-color:#c9dada"><table bgcolor="#c9dada" cellpadding="0" cellspacing="0" style="table-layout:fixed;vertical-align:top;min-width:320px;border-spacing:0;border-collapse:collapse;background-color:#c9dada;width:100%" valign="top" width="100%"><tbody><tr style="vertical-align:top" valign="top"><td style="word-break:break-word;vertical-align:top" valign="top"><div style="background-color:transparent"><div style="min-width:320px;max-width:670px;word-wrap:break-word;word-break:break-word;Margin:0 auto;background-color:#ffffff"><div style="border-collapse:collapse;display:table;width:100%;background-color:#ffffff"><div style="min-width:320px;max-width:670px;display:table-cell;vertical-align:top;width:670px"><div style="width:100%!important"><div style="border-top:0px solid transparent;border-left:0px solid transparent;border-bottom:0px solid transparent;border-right:0px solid transparent;padding-top:5px;padding-bottom:5px;padding-right:0px;padding-left:0px"><div align="center" style="padding-right:0px;padding-left:0px"> <a href="https://ashwinarora.com/" style="outline:none" target="_blank"> <img align="center" alt="ashwinarora.com" border="0" src="https://drive.google.com/uc?export=view&amp;id=1_nljVbo8fSHCsBfOHhIgBXeR-AukmZN0" style="text-decoration:none;height:auto;border:0;width:100%;max-width:134px;display:block" title="ashwinarora.com" width="134"></a></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="font-size:14px;line-height:1.2;word-break:break-word;margin:0">Dear ${name},</p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Thank you for showing interest in my project, you have signed up successfully.</span></p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">I would love to connect with you. You can reach me at <a href="mailto:contact@ashwinarora.com" rel="noopener" style="text-decoration:underline;color:#1205ee" target="_blank">contact@ashwinarora.com</a> or simply reply to this email. You can also <a href="https://www.linkedin.com/in/ashwin-arora/" rel="noopener" style="text-decoration:underline;color:#1205ee" target="_blank">connect with me</a> on LinkedIn.</span></p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Yours Truly</span></p><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Ashwin Arora</span></p><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px"><a href="http://ashwinarora.com/" rel="noopener" style="color:#1205ee" target="_blank">ashwinarora.com</a></span></p></div></div></div></div></div></div></div></div></td></tr></tbody></table></div></body></html>`
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
                    from: 'Social Network by Ashwin Arora <socialnetwork@ashwinarora.com>',
                    cc: 'contact@ashwinarora.com',
                    replyTo: 'contact@ashwinarora.com',
                    subject: 'Password Reset | Social Network',
                    html:`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html><head><META http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body><div style="margin:0;padding:0;background-color:#c9dada"><table bgcolor="#c9dada" cellpadding="0" cellspacing="0" style="table-layout:fixed;vertical-align:top;min-width:320px;border-spacing:0;border-collapse:collapse;background-color:#c9dada;width:100%" valign="top" width="100%"><tbody><tr style="vertical-align:top" valign="top"><td style="word-break:break-word;vertical-align:top" valign="top"><div style="background-color:transparent"><div style="min-width:320px;max-width:670px;word-wrap:break-word;word-break:break-word;Margin:0 auto;background-color:#ffffff"><div style="border-collapse:collapse;display:table;width:100%;background-color:#ffffff"><div style="min-width:320px;max-width:670px;display:table-cell;vertical-align:top;width:670px"><div style="width:100%!important"><div style="border-top:0px solid transparent;border-left:0px solid transparent;border-bottom:0px solid transparent;border-right:0px solid transparent;padding-top:5px;padding-bottom:5px;padding-right:0px;padding-left:0px"><div align="center" style="padding-right:0px;padding-left:0px"> <a href="https://ashwinarora.com/" style="outline:none" target="_blank"> <img align="center" alt="ashwinarora.com" border="0" src="https://drive.google.com/uc?export=view&amp;id=1_nljVbo8fSHCsBfOHhIgBXeR-AukmZN0" style="text-decoration:none;height:auto;border:0;width:100%;max-width:134px;display:block" title="ashwinarora.com" width="134"></a></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="font-size:14px;line-height:1.2;word-break:break-word;margin:0">Greetings!</p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">We have received your request to reset the password. If you did not make this request, please reach us at <a href="mailto:contact@ashwinarora.com" rel="noopener" style="color:#1205ee" target="_blank">contact@ashwinarora.com</a> or simply reply to this email.</span></p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Click the button below to reset your password</span></p></div></div><div align="center" style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"> <a href="https://socialnetwork-ashwin.herokuapp.com/reset/${token}" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#3aaee0;border-radius:4px;width:auto;width:auto;border-top:1px solid #3aaee0;border-right:1px solid #3aaee0;border-bottom:1px solid #3aaee0;border-left:1px solid #3aaee0;padding-top:5px;padding-bottom:5px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;text-align:center;word-break:keep-all" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:12px;display:inline-block"><span style="line-height:24px;word-break:break-word">Reset Password</span></span></a></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">If the button does not work, please copy and paste the following link into your browser <a href="https://socialnetwork-ashwin.herokuapp.com/reset/${token}" rel="noopener" style="color:#1205ee" target="_blank">https://socialnetwork-ashwin.herokuapp.com/reset/${token}</a>.</span></p></div></div><div style="color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px"><div style="line-height:1.2;font-size:12px;color:#555555;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Yours Truly</span></p><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px">Ashwin Arora</span></p><p style="line-height:1.2;word-break:break-word;font-size:14px;margin:0"><span style="font-size:14px"><a href="http://ashwinarora.com/" rel="noopener" style="color:#1205ee" target="_blank">ashwinarora.com</a></span></p></div></div></div></div></div></div></div></div></td></tr></tbody></table></div></body></html>`
                })
                res.json({message:"Check your Email"})
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
