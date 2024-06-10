import {createSlice} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '@/utils/types'

const initialState: AuthState = {
    userId: null,
    email: null,
    username: null,
    token: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        login: (state, action: PayloadAction<AuthState>) =>{
            state.userId = action.payload.userId
            state.email = action.payload.email
            state.username = action.payload.username
            state.token = action.payload.token
        },
        logout: (state) => {
            state.userId = null
            state.username = null
            state.token = null
        }
    }
})

export const { login, logout } = authSlice.actions


export default authSlice.reducer