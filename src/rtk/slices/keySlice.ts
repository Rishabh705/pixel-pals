import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Slice } from "@reduxjs/toolkit";

// Define the state type
// Define the state type
interface KeyState {
    encryptionKey: string; // Use a plain object to store key-value pairs
}

// Define the initial state
const initialState: KeyState = {
    encryptionKey: '' // Initialize as an empty object
};

const keySlice: Slice<KeyState> = createSlice({
    name: 'key',
    initialState,
    reducers: {
        // Action to set the state
        setKey: (state, action: PayloadAction<string>) => {
            state.encryptionKey = action.payload; // Update the state with a plain object
        }
    }
});

export const { setKey } = keySlice.actions;

export default keySlice.reducer;
