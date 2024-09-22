import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import socketMsgReducer from './slices/socketMsgSlice'
import closeSheetsReducer from './slices/closeSheets'
import keysReducer from './slices/keySlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        socketMsgs: socketMsgReducer,
        closeSheets: closeSheetsReducer,
        keys: keysReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
