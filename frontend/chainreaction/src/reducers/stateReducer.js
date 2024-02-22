const initialState = {
    count: 0,
    color: "",
    player: "",
    size: 0,
    roomID: "",
    totalPlayer: 0,
    boxData: {}
  };
  
export const stateReducer = (state = initialState, action) => 
{
  if (action.type === 'count/changeCount') {
      return {
        ...state,
        count: action.payload
      }
    }
  if (action.type === 'initialColor/changeColor') {
    return {
      ...state,
      color: action.payload
    }
  }
  if (action.type === 'player/changePlayer') {
    return {
      ...state,
      player: action.payload
    }
  }
  if (action.type === 'size/changeSize') {
    return {
      ...state,
      size: action.payload
    }
  }
  
  if (action.type === 'roomID/changeRoomID') {
    return {
      ...state,
      roomID: action.payload
    }
  }
  if (action.type === 'totalPlayer/changeTotalPlayer') {
    return {
      ...state,
      totalPlayer: action.payload
    }
  }
  if(action.type === "boxData/initializeBox")
  {
    return {
      ...state,
      boxData: action.payload
    }
  }

  if(action.type === "boxData/changeBoxData")
  {
    return {
      ...state,
      boxData: action.payload
    }
  }
    return state
};