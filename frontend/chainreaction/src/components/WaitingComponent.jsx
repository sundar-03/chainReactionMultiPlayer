import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeRoomID, changeCount, changeTotalPlayer, changeColor, changePlayer, changeSize, initializeBoxData} from "../actions/actions";
import store from "../store"

function WaitingComponent({socket})
{
    const dispatch = useDispatch();
    let navigate = useNavigate();
    // const [data, changeData] = useState({
    //   count: 0,
    //   roomID: "",
    //   total: 0
    // })

    // store.subscribe(() => {
    //   changeData({
    //     count: store.getState().count,
    //     roomID: store.getState().roomID,
    //     total: store.getState().totalPlayer
    //   })
    // })

    const count = useSelector(state => state.count)
    const roomID = useSelector(state => state.roomID)
    const total = useSelector(state => state.totalPlayer)
    
    useEffect(() => {
      if(count == total && count !== 0)
        {
          var roomID = store.getState().roomID
          
          socket.emit('startGame', {roomID})
          socket.on('playGame', (res) => {
            dispatch(changeSize(res.size))
            dispatch(changePlayer(res.user))
            dispatch(changeColor(res.color))
            dispatch(initializeBoxData(res.size, Math.round(window.innerWidth*0.6), Math.round(window.innerHeight*0.6)))
           navigate('/play')
          })
        }
    }, [count, total])

    useEffect(() => { 
        socket.on('roomInfo', (res) => {
          dispatch(changeCount(res.currentPlayer))
          dispatch(changeRoomID(res.roomID))
          dispatch(changeTotalPlayer(res.playerData))
        })
        return () => socket.off('roomInfo')
      }, [socket])

    return (
          <div className="waitingContainer">
             <div className="waitingElement">
              <div>
              <b><i>
                CHAIN REACTION
                </i></b>
              </div>
              
              <br />
              <div>
              Current Player Count: {count}
              </div>
                
                <br />
                <div>
                Room no: {roomID}
                </div>
                
                <br />
                <div>
                Total: {total}
                </div>
                
            </div>
          </div>
           
        )
}

export default WaitingComponent