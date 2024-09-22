import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Slice } from "@reduxjs/toolkit";

// Define the state type
// Define the state type
interface KeyState {
    publicKeys: Record<string, string>; // Use a plain object to store key-value pairs
}

// Define the initial state
const initialState: KeyState = {
    publicKeys: {} // Initialize as an empty object
};

const keySlice: Slice<KeyState> = createSlice({
    name: 'keys',
    initialState,
    reducers: {
        // Action to set the state
        setKeys: (state, action: PayloadAction<Record<string, string>>) => {
            state.publicKeys = action.payload; // Update the state with a plain object
        }
    }
});

export const { setKeys } = keySlice.actions;

export default keySlice.reducer;
