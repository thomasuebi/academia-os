// store.js
import { createStore, combineReducers } from "redux"
import tabsReducer from "./tabsReducer"

const rootReducer = combineReducers({
  tabs: tabsReducer,
  // other reducers
})

const store = createStore(rootReducer)

export default store
