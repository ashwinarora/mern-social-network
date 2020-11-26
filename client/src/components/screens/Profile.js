import React, { useState,useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import { Link } from 'react-router-dom'

const Profile = () => {
    const { state, dispatch } = useContext(UserContext)
    // const [pics, setPics] = useState([])
    const [data, setData] = useState([])
    const [image, setImage] = useState('')
    // const [url, setUrl] = useState('')

    useEffect( () => {
        fetch('/mypost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            // setPics(result.mypost)
            setData(result.mypost)
        })
    }, [])

    useEffect( () => {
        if(image){
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
                console.log(data)
                // localStorage.setItem("user", JSON.stringify({ ...state, pic:data.url}))
                // dispatch({type:"UPDATEPIC", payload: data.url})
                fetch('/updatepic', {
                    method: 'put',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem('jwt')
                    },
                    body: JSON.stringify({
                        pic: data.url
                    })
                })
                .then(res => res.json())
                .then( result => {
                    console.log({result})
                    localStorage.setItem("user", JSON.stringify({ ...state, pic:result.pic}))
                    dispatch({type:"UPDATEPIC", payload: result.pic})
                })
            })
            .catch(err => {
                console.log(err)
            })
        }
    }, [image])

    const updatePhoto = (file) => {
        setImage(file)
    }

    const likePost = (id) => {
        fetch('/like', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId: id
            })
        })
        .then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return  { ...item, likes: result.likes}
                } else {
                    return item
                }
            })
            setData(newData)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const unlikePost = (id) => {
        fetch('/unlike', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId: id
            })
        })
            .then(res => res.json())
            .then(result => {
                // console.log(result)
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        // return result
                        return  { ...item, likes: result.likes}
                    } else {
                        return item
                    }
                })
                setData(newData)
            })
            .catch(err => {
                console.log(err)
            })
    }

    const makeComment = (text, postId) => {
        fetch('/comment', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId,
                text
            })
        })
        .then(res => res.json() )
        .then(result => {
            // console.log(result)
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return result
                } else {
                    return item
                }
            })
            setData(newData)
            // commentInput.current.value = null
        })
        .catch( err => {
            console.log(err)
        })
    }

    const deletePost = (postId) => {
        console.log('delete clicked')
        fetch(`/deletePost/${postId}`, {
            method: 'delete',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
        .then( res => res.json() )
        .then( result => {
            console.log(result)
            const newData = data.filter(item => {
                return item._id !== result._id
            })
            setData(newData)
        })
    }

    return (
        <div style={{
            maxWidth: "60vw",
            margin: "0px auto"
        }}>
            <div style= {{
                margin: "18px 0px",
                borderBottom:"1px solid grey"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                }}>
                    <div>
                        <img alt={state ? state.name : 'loading'} style={{ width: "160px", height: "160px", borderRadius: "80px", objectFit: "cover" }}
                            src={state? state.pic : "loading"} />
                    </div>
                    <div className="white-text">
                        <h4>{state ? state.name : 'loading'}</h4>
                        <h6>{state ? state.email : 'loading'}</h6>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "108%"
                        }}>
                            <h6>{data.length} Posts</h6>
                            <h6>{state ? state.followers.length : 'loading'} Followers</h6>
                            <h6>{state ? state.following.length : 'loading'} Follwing</h6>
                        </div>
                    </div>
                </div>
                <div style={{margin: "10px"}} className="file-field input-field">
                    <div className="btn #64b5f6 blue darken-1">
                        <span>Update</span>
                        <input type="file" onChange={(e) => { updatePhoto(e.target.files[0]) }} />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate white-text" type="text" />
                    </div>
                </div>
            </div>
            
            {/* <div className="gallery">
            {
                pics.map(item => {
                    return (
                        <img className="item" src={item.photo} alt={item.title} key={item._id} />
                    )
                })
            }
            </div> */}
            <div className="home">
            {
                data.slice(0).reverse().map(item => {
                    return (
                        <div className="card home-card grey darken-4" key={item._id}>
                            <h5 style={{padding: "5px"}}>
                                <Link to={item.postedBy !== state._id ? `/profile/${item.postedBy}` : `/profile`} >
                                    <span>
                                        {/* <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px"}}
                                            src={item.postedBy.pic} alt="hello"
                                        /> */}
                                        <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px"}}
                                            src={state.pic} alt="hello"
                                        />
                                    </span>
                                    {/* <span className="white-text white-hover">{item.postedBy.name}</span> */}
                                    <span className="white-text white-hover">{state.name}</span>
                                </Link>
                                {
                                    item.postedBy == state._id
                                    && 
                                    <i
                                        className="material-icons white-text"
                                        style={{float: "right"}}
                                        onClick= {() => {deletePost(item._id)}}
                                    >delete</i>
                                }
                            </h5>
                            {/* <div className="card-image">
                                <img src={item.photo} />
                            </div> */}
                            <div className="card-content white-text">
                                <h6><b>{item.title}</b></h6>
                                <p>{item.body}</p>
                                
                                
                            </div>
                            <div className="card-image" style={{marginTop: "0.5rem"}} >
                                <img src={item.photo} alt="" style={{objectFit: "cover"}} />
                            </div>
                            <div className="card-content white-text">
                                <h6 style={{display:"inline-block"}}>{item.likes.length} likes</h6>
                                {/* <i className="material-icons" style={{ color: "red" }}>favorite</i> */}
                                {
                                    item.likes.includes(state._id)
                                    ?
                                    <i
                                    className="material-icons"
                                    style={{display:"inline", position: "relative", top: "5px", marginLeft: "5px"}}
                                    onClick={() => { unlikePost(item._id) }}
                                    >thumb_down</i>
                                    :
                                    <i
                                    className="material-icons"
                                    style={{display:"inline", position: "relative", top: "5px", marginLeft: "5px"}}
                                    onClick={() => { likePost(item._id) }}
                                    >thumb_up</i>
                                }
                                {
                                    item.comments.map( record => {
                                        return (
                                            <h6 key={record._id}>
                                                <Link to={record.postedBy._id !== state._id ? `/profile/${record.postedBy._id}` : `/profile`} >
                                                <span style={{fontWeight:"700", marginRight:"5px"}} className="white-text white-hover">
                                                    {record.postedBy.name}
                                                </span>
                                                </Link>
                                                {record.text}
                                            </h6>
                                        )
                                    })
                                }
                                <form
                                    onSubmit= {(e) => {
                                        e.preventDefault()
                                        makeComment(e.target[0].value, item._id)
                                        e.target[0].value = null
                                    }}
                                >
                                    <input type="text" className="input-white validate" placeholder="write a comment" />
                                </form>
                            </div>
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}

export default Profile