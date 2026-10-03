import React from 'react'
import { GUEST_EMAIL } from '../../noContact'

function Helpbox() {
    return (
        <div className="helpbox">
            <h5>For Your Convenience</h5>
            <div>Feel free you to use the following credentials to explore this application.</div>
            <h6>{`E-mail: ${GUEST_EMAIL}`}</h6>
            <h6>Password: guest@123</h6>
        </div>
    )
}

export default Helpbox
