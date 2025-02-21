import { createSlice } from "@reduxjs/toolkit"

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applications: []
    },
    reducers: {
        setAllApplications: (state, action) => {
            state.applications = action.payload
        }
    }
})

export const {setAllApplications} = applicationSlice.actions
export default applicationSlice.reducer