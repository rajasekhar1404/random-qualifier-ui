import { useEffect, useState } from "react"
import SockJS from "sockjs-client"
import { over } from "stompjs";

const Dashboard = () => {

    const [isSelecting, setSelection] = useState(true)
    const [user, setUser] = useState({
        username: '',
        groupName : "",
        role: '',
        groupId : ""
    })

    const [groupUsers, setGroupUsers] = useState({
        users: [],
        groupName: '',
        qualifier: ''
    })

    const [qualifier, setQualifier] = useState('')
    
    let stompClient = null;
    const joinHandler = () => {
        let Sock = new SockJS('http://localhost:8080/randomQualifier')
        stompClient = over(Sock)
        stompClient.connect({}, onConnection, onError)
    }
    
    useEffect(() => {
        window.addEventListener('beforeunload', handleClose)
        return () => {
            window.removeEventListener('beforeunload', handleClose)
        }
    }, [])

    const handleClose = () => {
        if (stompClient) {
            stompClient.send('/app/close', {}, JSON.stringify(user))
            stompClient.disconnect()
        }
    }


    const joinGroup = () => {
        joinHandler()
    }

    const createGroup = () => {
        user.groupId = Math.round(Math.random(10) * 1000000)
        user.role = 'ADMIN'
        joinHandler()
    }

    const onConnection = () => {
        stompClient.subscribe('/qualifier/join', onGroupJoin)
        stompClient.subscribe('/qualifier/pickone', onPickOne)
        stompClient.send('/app/join', {}, JSON.stringify(user))
        stompClient.send('/app/pickone', {}, JSON.stringify(groupUsers))
    }

    const onGroupJoin = (payload) => {
        const data = JSON.parse(payload.body)
        console.log(data)
        setGroupUsers({
            qualifier: '',
            groupName: data.groupName,
            users: data[user.groupId]
        })
    }

    const onError = (err) => {
        console.log(err)
    }

    const changeHandler = (e) => {
        setUser({
            ...user,
            [e.target.name]:e.target.value
        })
    }

    const onPickOne = (paload) => {
        const data = JSON.parse(paload.body)
        if (data) {
            console.log(data)
            setQualifier(data.qualifier)
        }
    }
    const sendQualifer = () => {
        setUser(prev => ({
            ...prev,
            username: '',
        }))
        joinHandler()
    }
    
    return (
        <div>
                {
                    isSelecting ? <div className="create-form">
                            <label>Create Group</label><br/>
                            <input placeholder="Enter your name" name="username" onChange={changeHandler} required={true}/><br/>
                            <input placeholder="Enter your group name" name="groupName" onChange={changeHandler}/><br></br>
                        <button onClick={() => {
                            createGroup()
                            setSelection(!isSelecting)
                        }}>Create</button><br/>
                        <label>Join Group</label><br/>
                        <input placeholder="Enter your name" name="username" onChange={changeHandler}/><br/>
                        <input placeholder="Enter group id" name="groupId" onChange={changeHandler}/><br/>
                        <button onClick={() => {
                            joinGroup()
                            setSelection(!isSelecting)
                        }}>Join</button>
                    </div> : <div className="users-container">
                        <div className="header-container">{`${groupUsers.groupName || 'Group Id: '}  ${user.groupId}`}
                        {
                            user.role === 'ADMIN' && <button onClick={sendQualifer}>Pick one</button>
                        }
                        </div>
                        {
                            groupUsers.users.map((user, index) => <div className="user-block" key={index}>
                                <span>{user}</span>
                            </div>)
                        }
                        {
                             qualifier
                        }
                    </div>
                }

        </div>
    )
}

export default Dashboard