import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import M from 'materialize-css'

const Signin = () => {
    const history = useHistory()
    const [password, setPassword] = useState('')
    const { token } = useParams()
    
    const PostData = () => {
        fetch('/new-password', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password,
                token
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.error) {
                    M.toast({ html: data.error, classes: "#e53935 red darken-1" })
                } else {
                    M.toast({ html: data.message , classes: "#00c853 green accent-4" })
                    history.push('/signin')
                }
            }).catch(error => {
                console.log(error)
            })
    }

    return (
        <div className="mycard auth-page">
            <div className="card auth-card input-field">
                <h2 className="auth-title">Social Network</h2>
                <input
                    type="password"
                    text="password"
                    placeholder="Enter new Password"
                    className="input-white validate"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                />
                <button
                    className="btn waves-effect waves-light btn-primary auth-btn"
                    onClick={PostData}
                >Update Password</button>
            </div>
        </div>
    )
}

export default Signin