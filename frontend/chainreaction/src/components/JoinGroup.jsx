import { useNavigate } from "react-router-dom"
import { useState } from "react"
import '../assets/style.css'
import { useSelector, useDispatch } from "react-redux";
import { changeRoomID, changeCount, changeTotalPlayer} from "../actions/actions";
import store from "../store";

function JoinGroup({socket})
{
    let navigate = useNavigate(); 
    const returnToHome = (e) => 
        {
            navigate('/');
        }
    const [groupData, changeGroupData] = useState("")
    const dispatch = useDispatch();
    
    const onGroupChange = (event) => {
        changeGroupData(event.target.value);
    }
    

    const submission = (e) =>
    {
        socket.emit('joinGroup', { groupData })
        socket.on("status", (data) => {
            if(data.status !== "No")
                navigate('/waiting')
        })
        // socket.on('roomInfo', (data) => {
        //     dispatch(changeCount(data.currentPlayer))
        //     dispatch(changeRoomID(data.roomID))
        //     dispatch(changeTotalPlayer(data.playerData))  
        // })
        
    }
    return (
        <div className="playContainer">
            <div className="heading">
                <div className="appName">
                    CHAIN REACTION
                </div>
                <div>
                    <button className="returnButton" onClick={returnToHome}>
                        Back To Home
                    </button>
                </div>
            </div>
             <div className="fieldInfo"> 
                <div className="field">
                    Group
                </div>
                <div className="value">
                <input type="text" onChange={onGroupChange} value={groupData} required/>
                </div>
             </div>
             <br />
             <button onClick={submission}>
                Submit
             </button>
        </div>
    )
    
}

export default JoinGroup