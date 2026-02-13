import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import userReducer from '@/features/user/userSlice';
import questionReducer from '@/features/questions/questionSlice';
import statsReducer from '@/features/stats/statsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    questions: questionReducer,
    stats: statsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
