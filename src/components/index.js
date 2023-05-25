import { useState } from "react"
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

    let stompClint = null;
    const joinHandler = () => {
        let Sock = new SockJS('http://localhost:8080/randomQualifier')
        stompClint = over(Sock)
        stompClint.connect({}, onConnection, onError)
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
        stompClint.subscribe('/qualifier/join', onGroupJoin)
        stompClint.subscribe('/qualifier/picone', onPickOne)
        stompClint.send('/app/join', {}, JSON.stringify(user))
        stompClint.send('/app/pickone', {}, JSON.stringify(groupUsers))
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
            setGroupUsers({
                qualifier: data.qualifier,
                groupName: data.groupName,
                users: groupUsers.users
            })
        }
    }
    const sendQualifer = () => {
        joinHandler()
    }
    
    return (
        <div className="main-container">
                {
                    isSelecting ? <div className="form-container">
                        <input placeholder="Enter your name" name="username" onChange={changeHandler}/>
                        {/* <input placeholder="Enter your group name" name="groupName" onChange={changeHandler}/> */}
                        <input placeholder="Enter group id" name="groupId" onChange={changeHandler}/>
                        <button onClick={() => {
                                createGroup()
                                setSelection(!isSelecting)
                            }}>Create</button>
                        <button onClick={() => {
                                joinGroup()
                                setSelection(!isSelecting)
                            }}>Join</button>
                    </div> : <div className="main-container">
                        <div>{`${groupUsers.groupName}  ${user.groupId}`}</div>
                        {
                            user.role === 'ADMIN' && <button onClick={sendQualifer}>Pick one</button>
                        }
                        {
                            groupUsers.users.map((user, index) => <div key={index}>
                                <h4>{user}</h4>
                            </div>)
                        }
                        {
                            groupUsers.qualifier
                        }
                    </div>
                }

        </div>
    )
}

export default Dashboard