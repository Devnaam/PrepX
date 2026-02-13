import { createSlice } from '@reduxjs/toolkit';

interface QuestionState {
  // We'll expand this later
}

const initialState: QuestionState = {};

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {},
});

export default questionSlice.reducer;
