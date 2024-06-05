import { SocketMessage } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Slice } from "@reduxjs/toolkit";

const initialState:SocketMessage[] = []

export const socketChatSlice:Slice<SocketMessage[]> = createSlice({
    name: 'socketMsg',
    initialState,
    reducers:{
        setSocketChat: (state, action: PayloadAction<SocketMessage>) =>{
            return [...state, action.payload]
        }
    }
})

export const { setSocketChat } = socketChatSlice.actions


export default socketChatSlice.reducer