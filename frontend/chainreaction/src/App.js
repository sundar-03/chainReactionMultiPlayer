import React from 'react'

import io from 'socket.io-client'

import { BrowserRouter, Routes, Route } from "react-router-dom"
import PlayComponent from './components/PlayComponent'
import HomeComponent from './components/HomeComponent'
import CreateGroup from './components/CreateGroup'
import WaitingComponent from './components/WaitingComponent'
import JoinGroup from './components/JoinGroup'

import { Provider } from "react-redux"
import store from "./store"

const socket = io.connect('http://localhost:8989')

function App() {

  return (
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomeComponent socket={socket}/>}/>
        <Route path='/play' element={<PlayComponent socket={socket}/>} />
        <Route path='/waiting' element={<WaitingComponent socket={socket}/>} />
        <Route path='/createGroup' element={<CreateGroup socket={socket}/>} />
        <Route path='/joinGroup' element={<JoinGroup socket={socket}/>} />
      </Routes>
  </BrowserRouter>
    </Provider>
    
  );
}

export default App;
