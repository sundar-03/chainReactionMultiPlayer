const changeCount = (count) => {
    return {
      type: 'count/changeCount',
      payload: count
    };
  };
  
const changeColor = (color) => {
    return {
      type: 'initialColor/changeColor',
      payload: color
    };
  };

const changePlayer = (player) => {
    return {
      type: 'player/changePlayer',
      payload: player
    };
  };

const changeSize = (size) => {
    return {
      type: 'size/changeSize',
      payload: size
    };
  };

  const changeRoomID = (roomID) => {
    return {
      type: 'roomID/changeRoomID',
      payload: roomID
    };
  };

const changeTotalPlayer = (totalPlayer) => {
    return {
      type: 'totalPlayer/changeTotalPlayer',
      payload: totalPlayer
    };
  };

function initializeBox(boardWidth, boardHeight, size)
{
  var cellHeight = boardHeight/size
  var cellWidth = boardWidth/size
  var boxes = []
  
  
  for(var j = 0; Math.round(boardHeight -j) != 0; j+=cellHeight)
  {   
      for(var i = 0; Math.round(boardWidth - i) != 0; i+=cellWidth)
      { 
          boxes.push({"x" : i, "y": j, "rx": i + cellWidth, "ry": j + cellHeight , 
          "boxInfo": (j/cellHeight).toString() + "|" + (i/cellWidth).toString(),
           "sa": Math.random()*90,
           "cx": i + (cellWidth/2),
           "cy": j + (cellHeight/2),
           "color": "",
           "count": 0,
          })
      }
  }
  return boxes
}

const initializeBoxData = (size, canvasWidth, canvasHeight) => {
  return {
    type: "boxData/initializeBox",
    payload: initializeBox(canvasWidth, canvasHeight, size)
  }
}

const changeBoX = (grid) => {
  return {
    type: "boxData/changeBoxData",
    payload: grid
  }
}

export { changeColor, changeCount, changePlayer, changeSize, changeRoomID, changeTotalPlayer, initializeBoxData, changeBoX};