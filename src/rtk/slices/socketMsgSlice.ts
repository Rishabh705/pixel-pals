import { SocketMessage } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState:SocketMessage[] = []

export const socketMsgSlice = createSlice({
    name: 'socketMsg',
    initialState,
    reducers:{
        setSocketMsg: (state, action: PayloadAction<SocketMessage>) =>{
            const index = state.findIndex(item => item.chatId === action.payload.chatId);
            if (index !== -1) {
                // If found, replace the item
                state[index] = action.payload;
            } else {
                // If not found, add the new item to the state
                state.push(action.payload);
            }
        }
    }
})

export const { setSocketMsg } = socketMsgSlice.actions


export default socketMsgSlice.reducer