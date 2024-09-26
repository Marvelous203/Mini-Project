import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { User } from '../types'; 
import '../styles/UserCreate.scss'

interface CreateUserProps {
    onUserCreated: (newUser: User) => void; // Callback
    closeModal: () => void; // Add closeModal prop
}

const CreateUser: React.FC<CreateUserProps> = ({ onUserCreated, closeModal }) => {
    const [name, setName] = useState<string>('');
    const [job, setJob] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUserData = { name, job };

        try {
            const response = await axios.post('https://reqres.in/api/users', newUserData);
            const createdUser: User = {
                id: response.data.id, 
                email: '', 
                first_name: name, 
                last_name: '', 
                avatar: '', 
                job: response.data.job,
            };

            onUserCreated(createdUser); 
            setMessage('User created successfully!');
            setError('');
            setName('');
            setJob('');
            closeModal(); // Close the modal after user creation
            alert('User created successfully!');
        } catch (err) {
            const axiosError = err as AxiosError<{ error: string }>; 
            setError(axiosError.response?.data?.error || 'An error occurred while creating the user. Please try again.');
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Job"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                required
            />
            <button className='btn-adduser' type="submit">Add New User</button>
            <button className='btn-close' type="submit" onClick={closeModal}>Close</button>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default CreateUser;
