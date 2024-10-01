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
    creatingUser: boolean;  // New loading state for creating user
    updatingUser: boolean;  // New loading state for updating user
    deletingUser: boolean;  // New loading state for deleting user
}

const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    creatingUser: false,
    updatingUser: false,
    deletingUser: false,
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

// Delete user
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
                state.users = action.payload.data; 
                state.totalPages = action.payload.total_pages; 
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })

            // Create user
            .addCase(createUser.pending, (state) => {
                state.creatingUser = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.creatingUser = false;
                state.users.push(action.payload); 
            })
            .addCase(createUser.rejected, (state, action) => {
                state.creatingUser = false;
                state.error = action.error.message || 'Failed to create user';
            })

            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.deletingUser = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.deletingUser = false;
                state.users = state.users.filter(user => user.id !== action.payload); 
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.deletingUser = false;
                state.error = action.error.message || 'Failed to delete user';
            })

            // Update user
            .addCase(updateUser.pending, (state) => {
                state.updatingUser = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.updatingUser = false;
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = {
                        ...state.users[index],
                        ...action.payload, 
                        updatedAt: new Date().toISOString() 
                    };
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updatingUser = false;
                state.error = action.error.message || 'Failed to update user';
            });
    },
});

export const { setCurrentPage, setError } = userSlice.actions;
export default userSlice.reducer;
