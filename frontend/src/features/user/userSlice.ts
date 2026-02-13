import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  // We'll expand this later
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

export default userSlice.reducer;
