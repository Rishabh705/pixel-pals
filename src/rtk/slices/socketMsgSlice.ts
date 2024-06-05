import { SocketMessage } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Slice } from "@reduxjs/toolkit";

const initialState:SocketMessage[] = []

export const socketMsgSlice:Slice<SocketMessage[]> = createSlice({
    name: 'socketMsg',
    initialState,
    reducers:{
        setSocketMsg: (state, action: PayloadAction<SocketMessage>) =>{
            const lastMessage = state.length > 0 ? state[state.length - 1] : null;
            if (lastMessage && lastMessage.chatId === action.payload.chatId) {
                return [...state, action.payload];
            } else {
                return [action.payload];
            }
        }
    }
})

export const { setSocketMsg } = socketMsgSlice.actions


export default socketMsgSlice.reducer