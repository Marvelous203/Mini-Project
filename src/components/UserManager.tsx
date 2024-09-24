import React, { useState, useEffect } from 'react';
import CreateUser from './UserCreate'; 
import { User } from '../types'; 
import '../styles/UserManager.scss';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(() => {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : [];
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [userData, setUserData] = useState<{ first_name: string; job?: string;}>({
        first_name: '',
        job: '',

    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [isCreating, setIsCreating] = useState<boolean>(false); 

    
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    
    const handleAddUserClick = () => {
        setIsCreating(true); 
        setIsModalOpen(true); 
        setSelectedUser(null); 
    };

    
    const handleUserCreated = (newUser: User) => {
        setUsers([...users, newUser]);
        setIsModalOpen(false); 
    };

   
    const handleDeleteUser = (id: number) => {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
        alert("User deleted")
    };

   
    const handleUpdateUser = (user: User) => {
        setSelectedUser(user); 
        setIsCreating(false); 
        setUserData({ first_name: user.first_name, job: user.job }); 
        setIsModalOpen(true); // Open modal
    };

    // Handle closing modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setUserData({ first_name: '', job: '' }); 
    };

    // Submit update for the selected user
    const handleSubmitUpdate = () => {
        if (selectedUser) {
            const updatedUsers = users.map((user) =>
                user.id === selectedUser.id ? { ...user, ...userData } : user
            );
            setUsers(updatedUsers);
            setSelectedUser(null);
            setIsModalOpen(false); 
            setUserData({ first_name: '', job: ''}); 
            alert("Success")
        }
    };

    return (
        <div>
            {/* Add User Button */}
            <button onClick={handleAddUserClick}>Add User</button>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Conditionally render based on if we are creating or updating */}
                        {isCreating ? (
                            <>
                                <h3>Create New User</h3>
                                <CreateUser onUserCreated={handleUserCreated} closeModal={closeModal} /> {/* Pass closeModal here */}
                            </>
                        ) : (
                            <>
                                <h3>Update User</h3>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={userData.first_name}
                                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Job"
                                    value={userData.job}
                                    onChange={(e) => setUserData({ ...userData, job: e.target.value })}
                                />
                                <button onClick={handleSubmitUpdate}>Submit Update</button>
                                <button className='btn-close' onClick={closeModal}>Close</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Display list of users */}
            <h2 className="userlist">User List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.first_name} - {user.job}
                        <button onClick={() => handleUpdateUser(user)} className="button-gap">
                            Update
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="button-gap btn-delete">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement;
