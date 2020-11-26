import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import M from 'materialize-css'
import Helpbox from './Helpbox'

const Signup = () => {
    const history = useHistory()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [image, setImage] = useState('')
    const [url, setUrl] = useState(undefined)

    useEffect(() => {
        if(url){
            uploadFields()
        }
    },[url])

    const PostData = () => {
        if(image){
            uploadImage()
        } else {
            uploadFields()
        }
        
    }

    const uploadFields = () => {
        console.log({name, email, password})
        if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
            return  M.toast({html: 'Invalid Email', classes: "#e53935 red darken-1"})
        }
        fetch('/signup', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                password,
                email,
                pic: url
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.error){
                M.toast({html: data.error, classes: "#e53935 red darken-1"})
            } else {
                M.toast({html: data.message, classes: "#00c853 green accent-4"})
                history.push('/signin')
            }
        }).catch( error => {
            console.log(error)
        })
    }

    const uploadImage = () => {
        const data = new FormData()
        data.append('file', image)
        data.append('upload_preset', 'insta-clone')
        data.append('cloud_name', 'dgxvqhybh')

        fetch('https://api.cloudinary.com/v1_1/dgxvqhybh/image/upload', {
            method: 'post',
            body: data
        })
        .then(res => res.json())
        .then(data => {
            setUrl(data.url)
        })
        .catch(err => {
            console.log(err)
        })
    }

    return (
        <div className="mycard">
            <div className="card auth-card input-field grey darken-4 white-text">
                <h2 style={{marginTop: "-1rem"}}>Social Network</h2>
                <input
                    text="text"
                    placeholder="Name"
                    className="input-white validate"
                    value={name}
                    onChange={(e) => {setName(e.target.value)}} 
                />
                <input
                    text="text"
                    placeholder="E-mail"
                    className="input-white validate"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}} 
                />
                <input
                    type="password"
                    text="password"
                    placeholder="Password" 
                    className="input-white validate"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}} 
                />
                <div className="file-field input-field">
                    <div className="btn #64b5f6 blue darken-1">
                        <span>Upload Image</span>
                        <input type="file" className="input-white validate" onChange={(e) => { setImage(e.target.files[0]) }} />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate input-white" type="text" />
                    </div>
                </div>
                <button
                    className="btn waves-effect waves-light #64b5f6 blue darken-1"
                    onClick={PostData}
                >Sign Up</button>
                <h6><Link to="/signin">Already have an account?</Link></h6>
            </div>
            <Helpbox />
        </div>
    )
}

export default Signup