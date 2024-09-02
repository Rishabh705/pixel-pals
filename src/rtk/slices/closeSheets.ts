import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Slice } from "@reduxjs/toolkit";

// Define the initial state and type
const initialState: boolean = false;

const closeSheetsSlice: Slice<boolean> = createSlice({
    name: 'closeSheets',
    initialState,
    reducers: {
        // Action to set the state
        setCloseSheets: (state, action: PayloadAction<boolean>) => {
            return action.payload;
        }
    }
});

export const { setCloseSheets } = closeSheetsSlice.actions;

export default closeSheetsSlice.reducer;
