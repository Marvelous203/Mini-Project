// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import UserList from './components/UserList';
import './styles/UserList.scss';
import './styles/App.scss'

const App: React.FC = () => {
    return (
        <div className='bg-app'>
        <Provider store={store}>
            
            <div className="app">
                <h1>&#8226; User Management System &#8226;</h1>
                <UserList />
            </div>
        </Provider>
        </div>
    );
};

export default App;
