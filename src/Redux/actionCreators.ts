// actionCreators.js
import { ADD_TAB, REMOVE_TAB, RENAME_TAB } from "./actionTypes"

export const addTab = (tab: any) => ({
  type: ADD_TAB,
  payload: tab,
})

export const removeTab = (key: any) => ({
  type: REMOVE_TAB,
  payload: key,
})

// actionCreators.js
export const renameTab = (key: any, newLabel: any) => ({
  type: RENAME_TAB,
  payload: { key, newLabel },
})
