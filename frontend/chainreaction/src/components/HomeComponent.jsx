
import '../assets/style.css';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { changeSize, initializeBoxData, changeRoomID, changeBoX, changePlayer, changeColor} from "../actions/actions";
import store from "../store"

function HomeComponent({socket})
{
    let navigate = useNavigate(); 
    const dispatch = useDispatch();
    function convertAndStore(grid)
    {
        var newBoxData = []
        var boxData = store.getState().boxData
        var size = store.getState().size
        for(var i = 0; i < size; i++)
        {
            for(var j = 0; j < size; j++)
            {

                newBoxData.push({
                "x" : boxData[(i*size) + j].x,
                "y": boxData[(i*size) + j].y,
                "rx": boxData[(i*size) + j].rx,
                "ry": boxData[(i*size) + j].ry, 
                "boxInfo": boxData[(i*size) + j].boxInfo,
                 "sa": boxData[(i*size) + j].sa,
                 "cx": boxData[(i*size) + j].cx,
                 "cy": boxData[(i*size) + j].cy,
                 "color": grid[i][j][0],
                 "count": grid[i][j][1],
                })
            }
        }
        return newBoxData
    }

    const play = (e) => 
        {
            socket.emit("playWithAI")
            socket.on('receiveAI', (res) => {
                dispatch(changeRoomID(res.roomID))
                dispatch(changeSize(res.size))
                dispatch(initializeBoxData(res.size, Math.round(window.innerWidth*0.6), Math.round(window.innerHeight*0.6)))
                dispatch(changeBoX(convertAndStore(res.boxData)))
                dispatch(changePlayer(res.player))
                dispatch(changeColor(res.color))
                navigate('/play')
            })
            
        }

    const joinGroup = (e) => 
        {
            navigate('/joinGroup');
        }
    
    const createGroup = (e) => 
        {
            navigate('/createGroup');
        }
    
        return (
        <div className='menu'>
                    <div>
                        <h1>
                            <i>
                                <b>
                                    CHAIN REACTION
                                </b>
                            </i>
                        </h1>
                    </div>

                    <div>
                        <div>
                            <button onClick={play}>
                                Play with Computer
                            </button>
                        </div>
                        <br />
                        <div>
                            <button onClick={joinGroup}>
                                Join Group
                            </button>
                        </div>
                        <br />
                        <div >
                            <button onClick={createGroup}>
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
    )
}

export default HomeComponent