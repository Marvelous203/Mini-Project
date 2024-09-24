import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store'; 
import { fetchUsers, setCurrentPage, deleteUser, updateUser } from '../components/UserSlice';
import { User } from '../types';
import '../styles/UserList.scss';
import '../styles/Modal.scss'; 
import UserManagement from './UserManager';
import axios from 'axios';

const UserList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error, currentPage } = useAppSelector((state) => state.users); 
    const [totalPages, setTotalPages] = useState<number>(0); 

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<{ first_name: string; email: string }>({
        first_name: '',
        email: ''
    });
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 


    // Fetch số trang từ API trước, sau đó fetch tất cả user từ các trang
    useEffect(() => {
        const fetchTotalPages = async () => {
            const response = await axios.get(`https://reqres.in/api/users?page=1`);
            setTotalPages(response.data.total_pages);
        };

        const fetchAllUsers = async () => {
            const users: User[] = [];
            for (let page = 1; page <= totalPages; page++) {
                const response = await axios.get(`https://reqres.in/api/users?page=${page}`);
                users.push(...response.data.data);
            }
            setAllUsers(users);
            setFilteredUsers(users); 
        };

        fetchTotalPages().then(fetchAllUsers); // Sau khi fetch totalPages xong thì fetch allUsers
    }, [totalPages]);

  //Khi User được selected thì fetch UserDetails
    const fetchUserDetails = async (id: number) => {
        try {
            const response = await axios.get(`https://reqres.in/api/users/${id}`);
            setUserDetails(response.data.data); // Set fetched user details
            setIsModalOpen(true); // Open the modal
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleViewUser = (user: User) => {
        fetchUserDetails(user.id); // Fetch details for the selected user
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setUserDetails(null); // Clear user details
        setSelectedUser(null); // Clear selected user information
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        filterUsers(e.target.value);
    };

    // Filter users based on the first name and the last name
    const filterUsers = (term: string) => {
        const filtered = allUsers.filter((user: User) =>
            user.first_name.toLowerCase().includes(term.toLowerCase()) ||
            user.last_name.toLowerCase().includes(term.toLowerCase()) 
        );
        setFilteredUsers(filtered);
    };

    const handleDeleteUser = (id: number) => {
        dispatch(deleteUser(id));
    };

    const handleUpdateUser = (user: User) => {
        setSelectedUser(user);
        setUserData({ first_name: user.first_name, email: user.email });
        setIsModalOpen(true);
    };

    const handleSubmitUpdate = async () => {
        if (selectedUser) {
            const updatedUserData = { ...userData };
            const response = await dispatch(updateUser({ id: selectedUser.id, userData: updatedUserData }));
            
            if (response.meta.requestStatus === 'fulfilled') {
                dispatch(fetchUsers(currentPage)); // Refetch users from api
            }
            setSelectedUser(null);
            setUserData({ first_name: '', email: '' });
            alert("Updated");
        }
    };

    // Pagination: show 6 users per page
    const usersPerPage = 6;
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div className="user-list">

            <input
                type="text"
                placeholder="Tìm kiếm người dùng"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            {loading && <div>Loading...</div>}
            {error && <div className="error">{error}</div>}
            <UserManagement />
            {/* Update User Form */}
            { isModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Update User</h3>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={userData.first_name}
                        onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                    <button onClick={handleSubmitUpdate}>Submit Update</button>
                    <button className='btn-close' onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}

            <div>
                {currentUsers.map((user: User) => (
                    <div className='card' key={user.id}>
                      <div className='card-b'>
                        <img className='img-i' src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                        <p className='fullname-p'>Full Name: {user.first_name} {user.last_name}</p>
                        {user.email ? (
                            <p className='email-p'>Email: {user.email}</p>
                        ) : (
                            <p>Job: {user.job}</p>
                        )}
                        <div className='btn-crud'>
                        <button className='view' onClick={() => handleViewUser(user)}>View</button>
                        <button className='update' onClick={() => handleUpdateUser(user)}>Update</button>
                        <button className='delete' onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </div>
                        </div>
                    </div>
                ))}
                {/* Modal for User Details */}
            {isModalOpen && userDetails && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>User Details</h3>
                        <img src={userDetails.avatar} alt={`${userDetails.first_name} ${userDetails.last_name}`} />
                        <p>First Name: {userDetails.first_name}</p>
                        <p>Last Name: {userDetails.last_name}</p>
                        <p>Email: {userDetails.email}</p>
                        <button className='btn-close' onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > usersPerPage && (
                <div className='btn-pagination'>
                    <button className='prev' onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <button className='next' onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={indexOfLastUser >= filteredUsers.length}>
                        Next
                    </button>
                </div>
            )}
            <div className='page'>Current Page: {currentPage} | Total Pages : {totalPages} | Total Users: {filteredUsers.length}</div>
        </div>
    );
};

export default UserList;
