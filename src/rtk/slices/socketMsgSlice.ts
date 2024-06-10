import { SocketMessage } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Slice } from "@reduxjs/toolkit";

const initialState:SocketMessage[] = []

export const socketMsgSlice: Slice<SocketMessage[]> = createSlice({
    name: 'socketMsg',
    initialState,
    reducers: {
      setSocketMsg: (state, action: PayloadAction<SocketMessage>) => {
        const lastMessage = state.length > 0 ? state[state.length - 1] : null;
        if (lastMessage && lastMessage.chat_id === action.payload.chat_id) {
          return [...state, action.payload];
        } else {
          return [action.payload];
        }
      },
      clear: () => [] // Explicitly returning an empty array to clear the state
    }
  });
export const { setSocketMsg, clear } = socketMsgSlice.actions


export default socketMsgSlice.reducer