import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import socketMsgReducer from './slices/socketMsgSlice'


export const store = configureStore({
    reducer: {
        auth: authReducer,
        socketMsgs: socketMsgReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
