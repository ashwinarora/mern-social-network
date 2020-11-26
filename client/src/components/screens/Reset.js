import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import M from 'materialize-css'
import Helpbox from './Helpbox'

const Reset = () => {
    const history = useHistory()
    const [email, setEmail] = useState('')

    const PostData = () => {
        console.log({ email })
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            return M.toast({ html: 'Invalid Email', classes: "#e53935 red darken-1" })
        }
        fetch('/reset-password', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    M.toast({ html: data.error, classes: "#e53935 red darken-1" })
                } else {
                    M.toast({ html: data.message, classes: "#00c853 green accent-4" })
                    history.push('/signin')
                }
            }).catch(error => {
                console.log(error)
            })
    }

    return (
        <div className="mycard ">
            <div className="card auth-card input-field grey darken-4 white-text">
                <h2 style={{marginTop: "-1rem"}} >Social Network</h2>
                <input
                    text="text"
                    id="input-email"
                    placeholder="E-mail"
                    className="input-white validate"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                />
                
                <button
                    className="btn waves-effect waves-light #64b5f6 blue darken-1 blue-button"
                    onClick={PostData}
                >Reset Password</button>
                
            </div>
            <Helpbox />
        </div>
    )
}

export default Reset