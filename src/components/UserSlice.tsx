import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../types';

interface UserResponse {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: User[];
}

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}

const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
};

// Fetch users
export const fetchUsers = createAsyncThunk<UserResponse, number>(
    'users/fetchUsers',
    async (page: number) => {
        const response = await axios.get(`https://reqres.in/api/users?page=${page}`);
        return response.data;
    }
);

// Create user
export const createUser = createAsyncThunk<User, { name: string; job: string }>(
    'users/createUser',
    async (userData) => {
        const response = await axios.post('https://reqres.in/api/users', userData);
        return response.data; // Return the created user
    }
);

// Fix the delete user API call in `deleteUser`:
export const deleteUser = createAsyncThunk<number, number>(
  'users/deleteUser',
  async (id: number) => {
      await axios.delete(`https://reqres.in/api/users/${id}`);
      return id; // Return the deleted user's id
  }
);
// Update user
export const updateUser = createAsyncThunk<User, { id: number; userData: Partial<User> }>(
  'users/updateUser',
  async ({ id, userData }) => {
      const response = await axios.put(`https://reqres.in/api/users/${id}`, userData);
      return response.data; // Return the updated user
  }
);


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data; // Set users from the API response
                state.totalPages = action.payload.total_pages; // Set total pages from the response
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })

            // Create user
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.push(action.payload); // Add the new user to the list
            })

            // Delete user
            .addCase(deleteUser.fulfilled, (state, action) => {
              state.users = state.users.filter(user => user.id !== action.payload); // Remove the deleted user from the list
          })
            // In your UserSlice.ts
            .addCase(updateUser.fulfilled, (state, action) => {
              const index = state.users.findIndex(user => user.id === action.payload.id);
              if (index !== -1) {
                  state.users[index] = {
                      ...state.users[index],
                      ...action.payload, // Ensure to merge the updated fields
                      updatedAt: new Date().toISOString() // Set updatedAt to current date/time
                  };
              }
            });  
    },
});

export const { setCurrentPage, setError } = userSlice.actions;
export default userSlice.reducer;
