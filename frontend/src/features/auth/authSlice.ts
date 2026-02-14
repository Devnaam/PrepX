import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils/storage';
import { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: storage.getUser(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response: any = await authService.register(data);

      // Extract user and token from the data property
      const { user, token } = response.data;

      console.log('✅ Register response:', { user, token: token?.substring(0, 20) });

      storage.setToken(token);
      storage.setUser(user);

      return { user, token };
    } catch (error: any) {
      console.error('❌ Register error:', error);
      return rejectWithValue(error.error?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response: any = await authService.login(credentials);

      // Extract user and token from the data property
      const { user, token } = response.data;

      console.log('✅ Login successful:', {
        hasUser: !!user,
        hasToken: !!token,
        username: user?.username,
        isAdmin: user?.isAdmin,
        userKeys: Object.keys(user || {}),
      });

      storage.setToken(token);
      storage.setUser(user);

      return { user, token };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return rejectWithValue(error.error?.message || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching current user...');
      const response: any = await authService.getCurrentUser();
      const { user } = response.data;

      console.log('✅ Current user fetched:', {
        username: user?.username,
        isAdmin: user?.isAdmin,
        userKeys: Object.keys(user || {}),
      });

      storage.setUser(user);
      return user;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      storage.clearAll();
      return rejectWithValue(error.error?.message || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    // Continue with logout even if API call fails
  }
  storage.clearAll();
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('📦 Register fulfilled, setting state:', {
          user: action.payload.user?.username,
          isAdmin: action.payload.user?.isAdmin,
        });
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('📦 Login fulfilled, setting state:', {
          user: action.payload.user?.username,
          isAdmin: action.payload.user?.isAdmin,
        });
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log('📦 Get current user fulfilled:', {
          user: action.payload?.username,
          isAdmin: action.payload?.isAdmin,
        });
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        console.log('📦 Get current user rejected, clearing state');
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      console.log('📦 Logout fulfilled');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
