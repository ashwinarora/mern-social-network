import React, { useState, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { UserContext } from '../../App'
import M from 'materialize-css'
import Helpbox from './Helpbox'

const Signin = () => {
    const { state, dispatch } = useContext(UserContext)
    const history = useHistory()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const PostData = () => {
        console.log({ email, password })
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            return M.toast({ html: 'Invalid Email', classes: "#e53935 red darken-1" })
        }
        fetch('/signin', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password,
                email
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.error) {
                    M.toast({ html: data.error, classes: "#e53935 red darken-1" })
                } else {
                    localStorage.setItem('jwt', data.token)
                    localStorage.setItem('user', JSON.stringify(data.user))
                    dispatch({ type: 'USER', payload: data.user })
                    M.toast({ html: "Signed Success", classes: "#00c853 green accent-4" })
                    history.push('/')
                }
            }).catch(error => {
                console.log(error)
            })
    }

    return (
        <div className="mycard ">
            <div className="card auth-card input-field grey darken-4 white-text">
                <h2 style={{marginTop: "-1rem"}}>Social Network</h2>
                <input
                    text="text"
                    id="input-email"
                    placeholder="E-mail"
                    className="input-white validate"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                />
                <input
                    type="password"
                    text="password"
                    placeholder="Password"
                    className="input-white validate"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                />
                <button
                    className="btn waves-effect waves-light #64b5f6 blue darken-1 blue-button"
                    onClick={PostData}
                >Sign In</button>
                <h6><Link to="/reset">Forgot Password?</Link></h6>
                <h6><Link to="/signup">Create a new Account</Link></h6>
            </div>
            <Helpbox />
        </div>
    )
}

export default Signin