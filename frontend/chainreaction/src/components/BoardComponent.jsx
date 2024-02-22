import React, { useState, useEffect, useRef} from 'react'
import { useDispatch } from "react-redux";
import { changeBoX,changeColor, changePlayer} from "../actions/actions";
import store from "../store"


function BoardComponent({socket})
{
    function initializeRad()
    {
        var boardHeight = Math.round(window.innerHeight*0.6)
        var boardWidth = Math.round(window.innerWidth*0.6)
        var size = store.getState().size
        var cellHeight = boardHeight/size
        var cellWidth = boardWidth/size

        return Math.min(cellHeight, cellWidth)/8
    }

    const [rad, changeRad] = useState(initializeRad())

    const [data, changeData] = useState({
        player: store.getState().player,
        color: store.getState().color,
        boxData: store.getState().boxData
      })
      store.subscribe(() => {
        
        changeData({
            player: store.getState().player,
            color: store.getState().color,
            boxData: store.getState().boxData
        })
      })
    const dispatch = useDispatch();

    
    function fillRectangle(startX, startY, context, boxWidth, boxHeight, borderColour, boxColour)
    {
        context.strokeStyle = borderColour
        context.strokeRect(startX, startY, boxWidth, boxHeight)
        context.fillStyle = boxColour 
        context.fillRect(startX + 1, startY + 1, boxWidth - 2, boxHeight - 2)
    }

    function fillCircle(x, y, context, radius, ballColour)
    {
        context.fillStyle = ballColour
        context.beginPath()
        context.arc(x, y, radius, 0, 2 * Math.PI)
        context.fill()
    }

    function fillTwoCircle(x, y, context, radius, ballColour, angle)
    {
        fillCircle(x + (radius*Math.cos(angle)), y + (radius*Math.sin(angle)), context,radius, ballColour)
        fillCircle(x + (radius*Math.cos(Math.PI + angle)), y + (radius*Math.sin(Math.PI + angle)), context, radius, ballColour)
    }

    function fillThreeCircle(x, y, context, radius, ballColour, angle)
    {
        //x, y is center here. 
        var dist = (2*radius)/Math.sqrt(3)

        fillCircle(x + (dist*Math.cos(angle)), y + (dist*Math.sin(angle)), context,radius, ballColour)
        fillCircle(x + (dist*Math.cos(angle + ((2*Math.PI)/3))), y + (dist*Math.sin(angle + ((2*Math.PI)/3))), context, radius, ballColour)
        fillCircle(x + (dist*Math.cos(angle + ((4*Math.PI)/3))), y + (dist*Math.sin(angle + ((4*Math.PI)/3))), context, radius, ballColour)
    }

    function handleAnimation(deg)
    {
        var can = document.getElementById("canvas")
        var boxData = store.getState().boxData
        if(can)
        {
            var context = can.getContext('2d')
            deg = deg%360
            for(var i = 0; i < boxData.length; i++)
            {
                var x = boxData[i].x, y = boxData[i].y
                var rx = boxData[i].rx, ry= boxData[i].ry
                context.clearRect(x, y, rx - x, ry - y)
                fillRectangle(x, y, context, rx - x, ry - y,"white", "black")
            }
            for(var i = 0; i < boxData.length; i++)
            {  
                if(boxData[i].count == 1)
                    fillCircle(boxData[i].cx, boxData[i].cy, context, rad, boxData[i].color)
                
                if(boxData[i].count == 2)
                    fillTwoCircle(boxData[i].cx, boxData[i].cy, context, rad, boxData[i].color, boxData[i].sa + deg)

                if(boxData[i].count == 3)
                    fillThreeCircle(boxData[i].cx, boxData[i].cy, context, rad, boxData[i].color, boxData[i].sa + deg)
            }
            deg += 0.05
            requestAnimationFrame(function() {
                handleAnimation(deg)
            })
        }
    }

    function handleClick(rects, x, y, w, h) {
        var isCollision = false, i = 0;
        for (var len = rects.length; i < len; i++) {
            var left = rects[i].x, right = rects[i].x + w;
            var top = rects[i].y, bottom = rects[i].y + h;
            if (right >= x
                && left <= x
                && bottom >= y
                && top <= y) {
                isCollision = rects[i]
                break
            }
        }
        return [isCollision, i]
    }

    function getGrid()
    {
        var grid = []
        var boxData = store.getState().boxData
        var size = store.getState().size
        for(var i = 0; i < size; i++)
        {
            var t = []
            for(var j = 0; j < size; j++)
            {
                var k = (i*size) + j
                t.push([boxData[k].color, boxData[k].count])
            }
            grid.push(t)
        }
        return grid
    }

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

    function userMove(i, color) 
    {
        //make a request to backend and store the new updated grid
        var boxData = store.getState().boxData
        var size = store.getState().size
        var bx = parseInt(boxData[i].boxInfo.split('|')[0], 10)
        var by = parseInt(boxData[i].boxInfo.split('|')[1], 10)
        var grid = getGrid()
        var roomID = store.getState().roomID
        socket.emit("sendMove", {
            grid, bx, by, color, size, roomID
        })
    }

    useEffect(() => { 
        //receive the moves and update next player, color
        socket.on('receiveMove', (res) => {
            dispatch(changeBoX(convertAndStore(res.boxData)))
            dispatch(changePlayer(res.player))
            dispatch(changeColor(res.color))
        })
        
      }, [socket])

    const canvClick = (e) => {
        var boxData = store.getState().boxData
        var size = store.getState().size
        var cellHeight = document.getElementById("canvas").clientHeight/size
        var cellWidth = document.getElementById("canvas").clientWidth/size
        var rect = handleClick(boxData, e.offsetX, e.offsetY,  cellWidth, cellHeight )
        if (rect[0]) {
            if(socket.id === store.getState().player)
            {
                if(boxData[rect[1]].color == "" || boxData[rect[1]].color == store.getState().color)
                        userMove(rect[1], store.getState().color)
            }     
        }
    }

    useEffect(() => 
    {
        console.log("In use effect ")   
        document.getElementById("canvas").height = document.getElementById("canvas").clientHeight
        document.getElementById("canvas").width = document.getElementById("canvas").clientWidth
        var size = store.getState().size
        var cellHeight = document.getElementById("canvas").clientHeight/size
        var cellWidth = document.getElementById("canvas").clientWidth/size
        var context = document.getElementById("canvas").getContext('2d')
        var boxData = store.getState().boxData
        for(var i = 0; i < boxData.length; i+=1)
        { 
            fillRectangle(boxData[i].x, boxData[i].y, context, cellWidth, cellHeight, "white", "black")
        }
        requestAnimationFrame(function() {
            handleAnimation(1)
        })
        document.getElementById("canvas").removeEventListener('click', canvClick, false)
        document.getElementById("canvas").addEventListener('click', canvClick, false)    

    }, [])

    return (
        <div className="tableArea">
            <div className='moveStatus'>
                <div>
                {
                (data.player === socket.id)?"Your move":"Please wait for your move"
                }
                </div>
            </div>
            <div className='wrapCanvas'>
            <canvas className='canvasClass' id="canvas" />
            </div>
        </div>
    )
}

export default BoardComponent