// tabsReducer.js
import Workflow from "../Components/Workflow"
import { ADD_TAB, REMOVE_TAB, RENAME_TAB } from "./actionTypes"

const initialState = [
  { label: "New Workflow", children: <Workflow tabKey='1' />, key: "1" },
]

const tabsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ADD_TAB:
      return [...state, action.payload]
    case REMOVE_TAB:
      return state.filter((tab) => tab.key !== action.payload)
    case RENAME_TAB:
      return state.map((tab) =>
        tab.key === action.payload.key
          ? { ...tab, label: action.payload.newLabel }
          : tab
      )
    default:
      return state
  }
}

export default tabsReducer
