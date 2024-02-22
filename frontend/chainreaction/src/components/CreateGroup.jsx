import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../assets/style.css';
import { useDispatch } from "react-redux";
import { changeRoomID, changeCount, changeTotalPlayer, changeSize} from "../actions/actions";

function CreateGroup({socket})
{
    let navigate = useNavigate(); 
    const dispatch = useDispatch();
    const returnToHome = (e) => 
        {
            navigate('/');
        }
    const [playerData, changePlayerData] = useState(2)
    const [sizeData, changeSizeData] = useState(5)
    
    const player = [3, 4, 5]
    const size = [6, 7, 8]

    const onPlayerChange = (event) => {
        changePlayerData(event.target.value);
    }

    const onSizeChange = (event) => {
        changeSizeData(event.target.value);
    }

    

    const submission = (e) =>
    {
        socket.emit('createGroup', { playerData, sizeData })
        dispatch(changeSize(sizeData))
        socket.on('roomInfo', (data) => {
          dispatch(changeCount(data.currentPlayer))
          dispatch(changeRoomID(data.roomID))
          dispatch(changeTotalPlayer(data.playerData))
          })
        navigate('/waiting')
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
                    Player
                </div>
                <div className="value">
                    <select onChange={onPlayerChange}>
                        <option>{playerData}</option>
                        {player.map((option, index) => {
                            return (
                                <option key={index}>
                                    {option}
                                </option>
                            )
                        })}
                    </select>
                </div>
             </div>
             <div className="fieldInfo"> 
                <div className="field">
                    Size
                </div>
                <div className="value">
                <select onChange={onSizeChange}>
                        <option>{sizeData}</option>
                        {size.map((option, index) => {
                            return (
                                <option key={index}>
                                    {option}
                                </option>
                            )
                        })}
                    </select>
                </div>
             </div>
             <br />
             <button onClick={submission}>
                Submit
             </button>
        </div>
    )
    
}

export default CreateGroup