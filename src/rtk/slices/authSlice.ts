import {createSlice} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '@/utils/types'

const initialState: AuthState = {
    userId: null,
    email: null,
    username: null,
    accessToken: null,

}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        login: (state, action: PayloadAction<AuthState>) =>{
            state.userId = action.payload.userId
            state.email = action.payload.email
            state.username = action.payload.username
            state.accessToken = action.payload.accessToken
        },
        logout: (state) => {
            state.userId = null
            state.email = null
            state.username = null
            state.accessToken = null
        }
    }
})

export const { login, logout } = authSlice.actions



export default authSlice.reducer

