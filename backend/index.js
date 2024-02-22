const express = require('express');
const app = express();
http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); 
const uuid = require("uuid")

app.use(cors()); 

const server = http.createServer(app); 
var colors = ["red", "green", "purple", "yellow", "teal"]
const runningGroups = {}


function getNeighbours(i, j, size)
{
    var possible = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]
    var correct = []
    for(var i = 0; i < 4; i++)
    {
        if(possible[i][0] >= 0 && possible[i][0] < size && possible[i][1] >= 0 && possible[i][1] < size)
        {
            correct.push(possible[i])
        }
    }
    return correct
}

function getMaximum(i, j, size)
{
    var cornerX = 0
    var cornerY = 0
    if(i == 0  || i == (size - 1))
        cornerX = 1
    if(j == 0 || j == (size - 1))
        cornerY = 1

    var s = cornerX + cornerY
    if(s == 0)
        return 4
    else if(s == 1)
        return 3
    else
        return 2
}

function userMove(i, j, color, size, gridData) 
{
    gridData[i][j][0] = color
    gridData[i][j][1] += 1

    var q = [[i, j, gridData[i][j][1]]]
    while(q.length != 0)
    {
        var c = q.shift()
        var x = c[0], y = c[1], count = c[2]
        if(count >= getMaximum(x, y, size))
        {
            gridData[x][y][1] -= getMaximum(x, y, size)
            var color = gridData[x][y][0]
            if(gridData[x][y][1] == 0)
              gridData[x][y][0] = ''

            var neighBours = getNeighbours(x, y, size)
            for(var n = 0; n < neighBours.length; n++)
            {
                var nx = neighBours[n][0], ny = neighBours[n][1]
                gridData[nx][ny][0] = color
                gridData[nx][ny][1] += 1
                var i = 0;
                for(; i < q.length; i++)
                  {
                      if(q[i][0] == nx && q[i][1] == ny)
                      {
                        q[i][2] = gridData[nx][ny][1]
                        break
                      }
                  }
                if(i == q.length)
                {
                  q.push([nx, ny, gridData[nx][ny][1]])
                }
            }
        }
    }
    return gridData
}

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function getIndex(element, arr)
{
  for(var i = 0; i < arr.length; i++)
  {
    if(arr[i] == element)
      return i
  }
  return -1
}

function checkColor(grid, color)
{
  var c = 0
  for(var i = 0; i < grid.length; i++)
  {
    for(var j = 0; j < grid.length; j++)
    {
      if(grid[i][j][0] == color)
        c += 1
    }
  }
  return c
}

function updateLostStatus(roomID, grid)
{
  var socketList = runningGroups[roomID][3]
  for(var i = 0; i < socketList.length; i++)
  {  
    if(runningGroups[roomID][5][socketList[i]])
      continue
    var col = colors[i]
    if(runningGroups[roomID][4][socketList[i]])
    {
      var c = checkColor(grid, col)
      if(c === 0)
        runningGroups[roomID][5][socketList[i]] = true
    }
  }
}

function getNextIndex(roomID, sockerID)
{
  var ind = getIndex(sockerID, runningGroups[roomID][3])
  for(var i = ind + 1; i < runningGroups[roomID][3].length; i++)
  {
    var soc = runningGroups[roomID][3][i]
    if(!runningGroups[roomID][5][soc])
      return i
  }

  for(var i = 0; i < ind; i++)
  {
    var soc = runningGroups[roomID][3][i]
    if(!runningGroups[roomID][5][soc])
      return i
  }
  return ind
}

function possibleCells(grid, color)
{
    var p = []
    for(var i = 0; i < grid.length; i++)
    {
      for(var j =0; j < grid.length; j++)
      {
          if(grid[i][j][0] == color || grid[i][j][0] == '')
            p.push([i, j])
      }
    }
    return p
}

function getDefaultGrid(size)
{
  var grid = []
  for(var i = 0; i < size; i++)
  {
    var r = []
    for(var j = 0; j < size; j++)
    {
      r.push(["", 0])
    }
    grid.push(r)
  }
  return grid
}

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("createGroup", (data) => {
    const {playerData, sizeData} = data
    const roomID = uuid.v4().toString()
    var id = socket.id
   
    runningGroups[roomID] = [playerData, sizeData, 1, [socket.id], {}, {}, false]
    runningGroups[roomID][4][id] = false
    runningGroups[roomID][5][id] = false
    socket.join(roomID)
    socket.emit("roomInfo", {
      "roomID": roomID,
      "currentPlayer": 1,
      "playerData": playerData
    })
  })

  socket.on("playWithAI", () => {
    const roomID = uuid.v4().toString()
    var r = Math.floor(Math.random()*2)
    var grid = []
    
    if(r == 0)
    { 
      //get empty grid (user first)
      runningGroups[roomID] = [2, 6, 1, [socket.id, "AI"], {}, {}, true]
      var id = socket.id
      runningGroups[roomID][4][id] = false
      runningGroups[roomID][5][id] = false
      runningGroups[roomID][4]["AI"] = false
      runningGroups[roomID][5]["AI"] = false
      grid = getDefaultGrid(6)
    }
    else
    {
      runningGroups[roomID] = [2, 6, 1, ["AI", socket.id], {}, {}, true]
      grid = getDefaultGrid(6)
      var id = socket.id
      runningGroups[roomID][4][id] = false
      runningGroups[roomID][5][id] = false
      runningGroups[roomID][4]["AI"] = true
      runningGroups[roomID][5]["AI"] = false
      var x = Math.floor(Math.random()*6)
      var y = Math.floor(Math.random()*6)
      grid[x][y][0] = colors[0]
      grid[x][y][1] = 1
    }
    socket.emit("receiveAI", {
      "roomID": roomID,
      "size": 6,
      "boxData": grid,
      "player": socket.id,
      "color": colors[r]
    })

  })

  socket.on("sendMove", (data) => {
    const {grid, bx, by, color, size, roomID} = data
    if(!runningGroups[roomID][6])
    {
      runningGroups[roomID][4][socket.id] = true
      var updatedGrid = userMove(bx, by, color, size, grid)
      updateLostStatus(roomID, updatedGrid)
  
      var nextIndex = getNextIndex(roomID, socket.id)
      var nextPlayer = runningGroups[roomID][3][nextIndex]
      var nextColor = colors[nextIndex]
      socket.to(roomID).emit('receiveMove', {
        "boxData": updatedGrid,
        "player": nextPlayer,
        "color": nextColor
      })
      socket.emit('receiveMove', {
        "boxData": updatedGrid,
        "player": nextPlayer,
        "color": nextColor
      })
    }
    else
    {
        runningGroups[roomID][4][socket.id] = true
        var updatedGrid = userMove(bx, by, color, size, [...grid])
        updateLostStatus(roomID, updatedGrid)
        if(!runningGroups[roomID][5]["AI"])
        { 
          
          // get a random possible move
          var ind = getIndex(socket.id, runningGroups[roomID][3])
          if(ind == 0)
            ind += 1
          else
            ind -= 1
          var c = colors[ind]
          var validCells = possibleCells(updatedGrid, c)
          var rCell = validCells[Math.floor(Math.random()*validCells.length)]
          var newGrid = userMove(rCell[0], rCell[1], c, size, [...updatedGrid])
          runningGroups[roomID][4]["AI"] = true
          updateLostStatus(roomID, newGrid)
          if(runningGroups[roomID][5][socket.id])
          {
            socket.emit('receiveMove', {
              "boxData": grid,
              "player": socket.id,
              "color": color
            })
          }
          else
          {
            socket.emit('receiveMove', {
              "boxData": newGrid,
              "player": socket.id,
              "color": color
            })
          }
        } 
        else
        {
          socket.emit('receiveMove', {
            "boxData": updatedGrid,
            "player": "AI",
            "color": color
          })
        }
    }
  })

  socket.on("startGame", (data) => {
    const  {roomID} = data
      socket.emit("playGame", {
        "size": runningGroups[roomID][1],
        "user": runningGroups[roomID][3][0],
        "color": colors[0]
      })
  })

  socket.on("joinGroup", (data) => {
    const roomID = data.groupData
    if(!runningGroups.hasOwnProperty(roomID))
    {
      socket.emit("status", {
        "status": "No"
      })
      
    }
    else
    {
      socket.emit("status", {
        "status": "Yes"
      })
      runningGroups[roomID][2] += 1
      runningGroups[roomID][3].push(socket.id)
      runningGroups[roomID][4][socket.id] = false
      runningGroups[roomID][5][socket.id] = false
      shuffle(runningGroups[roomID][3])
      socket.join(roomID)
      socket.to(roomID).emit("roomInfo", {
        "roomID": roomID,
        "currentPlayer": runningGroups[roomID][2],
        "playerData": runningGroups[roomID][0]
      })
      socket.emit("roomInfo", {
        "roomID": roomID,
        "currentPlayer": runningGroups[roomID][2],
        "playerData": runningGroups[roomID][0]
      })
    }
  })

  socket.on("cleanUp", (data) => {
    const {roomID} = data
    delete runningGroups[roomID]
  })
})

server.listen(8989, () => 'Server is running on port 3000');