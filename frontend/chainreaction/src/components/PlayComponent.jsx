
import '../assets/style.css';
import { useNavigate } from "react-router-dom";
import BoardComponent from './BoardComponent';
import { useDispatch } from "react-redux";
import { changeRoomID, changeCount, changeTotalPlayer, changeColor, changePlayer, changeSize} from "../actions/actions";
import store from "../store"

function PlayComponent({socket})
{
    let navigate = useNavigate(); 
    const dispatch = useDispatch();
    
    const returnToHome = (e) => 
        {
            dispatch(changeColor(""))
            dispatch(changeCount(0))
            dispatch(changePlayer(""))
            dispatch(changeRoomID(""))
            dispatch(changeTotalPlayer(0))
            dispatch(changeSize(0))
            var roomID = store.getState().roomID
            socket.emit("cleanUp", {roomID})
            navigate('/');
        }

        return (
            <div className='flexContainer'>
                <div className='wholeContainer'>
                <div className='infoPart'>
                    <div className='gameInfo'>
                    PLAY WITH AI
                    </div>
                    <div className='moveStatus'>
                        {store.getState().roomID}
                    </div>
                    <div className='buttonInfo'>
                    <button onClick={returnToHome}>
                        Return to home
                    </button>
                    </div>
                    
                </div>
                {
                    store.getState().size !== 0 && 
                    <BoardComponent socket={socket} />
                }
                
            </div>
            </div>
            
    )
}

export default PlayComponent