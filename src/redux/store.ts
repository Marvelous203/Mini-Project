// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../components/UserSlice'; // Ensure this path is correct
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const store = configureStore({
    reducer: {
        users: userReducer,
    },
    
});

// Define RootState and AppDispatch types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
