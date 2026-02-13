import { createSlice } from '@reduxjs/toolkit';

interface StatsState {
  // We'll expand this later
}

const initialState: StatsState = {};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
});

export default statsSlice.reducer;
