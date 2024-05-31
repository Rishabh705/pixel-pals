import { SocketMessage } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState:SocketMessage[] = []

export const socketMsgSlice = createSlice({
    name: 'socketMsg',
    initialState,
    reducers:{
        setSocketMsg: (state, action: PayloadAction<SocketMessage>) =>{
            return [...state, action.payload]
        }
    }
})

export const { setSocketMsg } = socketMsgSlice.actions


export default socketMsgSlice.reducer