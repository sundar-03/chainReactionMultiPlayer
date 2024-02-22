import { configureStore } from '@reduxjs/toolkit'
import { stateReducer } from "./reducers/stateReducer"

const store = configureStore({reducer: stateReducer})

export default store