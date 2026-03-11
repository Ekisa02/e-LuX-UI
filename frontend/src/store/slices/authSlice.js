import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const result = await window.api.invoke('auth:status');
    return result;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData) => {
    return { user: userData };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await window.api.invoke('auth:logout');
    return {};
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastLogin: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.authenticated) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.lastLogin = new Date().toISOString();
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;