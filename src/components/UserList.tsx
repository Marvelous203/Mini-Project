import React, { useState, useEffect } from "react";
import { useAppDispatch, } from "../redux/store";
import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../components/UserSlice";
import { User } from "../types";
import "../styles/UserList.scss";
import "../styles/Modal.scss";
import UserManagement from "./UserManager";
import UserSearch from "./UserSearch";
import '../styles/UserDetailModal.scss'

import axios from "axios";

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{
    first_name: string;
    email: string;
  }>({ first_name: "", email: "" });
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [, setNoResults] = useState<boolean>(false); 


  const fetchUsersForCurrentPage = async (currentPage: number) => {
    console.log("Fetching data for page:", currentPage);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://reqres.in/api/users?page=${currentPage}`
      );
      console.log("API Response:", response.data); 
      setUsers(response.data.data); 
      setTotalPages(response.data.total_pages); 
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error("Error fetching users for the current page:", error);      
      setNoResults(true); 
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchUsersForCurrentPage(currentPage); 
      setNoResults(false); 

    }
  }, [currentPage, searchTerm]);

  const fetchUserDetails = async (id: number) => {
    setIsLoading(true); // Start loading for user details
    try {
      const response = await axios.get(`https://reqres.in/api/users/${id}`);
      setUserDetails(response.data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleViewUser = (user: User) => {
    fetchUserDetails(user.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserDetails(null);
    setSelectedUser(null);
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
      const response = await dispatch(
        updateUser({ id: selectedUser.id, userData: updatedUserData })
      );

      if (response.meta.requestStatus === "fulfilled") {
        dispatch(fetchUsers(currentPage)); 
      }
      setSelectedUser(null);
      setUserData({ first_name: "", email: "" });
      alert("Updated");
    }
  };
    // Custom function to set filtered users and check for results
    const handleSetFilteredUsers = (users: User[], noResults: boolean) => {
        setFilteredUsers(users);
        setNoResults(noResults);
      };

  // Pagination: show 6 users per page
  const usersPerPage = 6;
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = searchTerm
    ? filteredUsers.slice(startIndex, endIndex)
    : users;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1); // Increment the page number
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1); // Decrement the page number
    }
  };

  return (
    <div className="user-list">
      <UserSearch
        setFilteredUsers={handleSetFilteredUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {isLoading ? ( 
        <div className="loading">Loading Data ...</div>
      ) : (
        <>
          <UserManagement />
          {/* Update User Form */}
          {isModalOpen && selectedUser && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Update User</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  value={userData.first_name}
                  onChange={(e) =>
                    setUserData({ ...userData, first_name: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                />
                <button onClick={handleSubmitUpdate}>Submit Update</button>
                <button className="btn-close" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          )}
          <div className="cards-container">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: User) => (
                <div className="card" key={user.id}>
                  <div className="card-b">
                    <img
                      className="img-i"
                      src={user.avatar}
                      alt={`${user.first_name} ${user.last_name}`}
                    />
                    <p className="fullname-p">
                      Full Name: {user.first_name} {user.last_name}
                    </p>
                    {user.email ? (
                      <p className="email-p">Email: {user.email}</p>
                    ) : (
                      <p>Job: {user.job}</p>
                    )}
                    <div className="btn-crud">
                      <button className="view" onClick={() => handleViewUser(user)}>
                        View
                      </button>
                      <button
                        className="update"
                        onClick={() => handleUpdateUser(user)}
                      >
                        Update
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="err-data">No data response</div> 
            )}

            {/* Modal for User Details */}
            {isModalOpen && userDetails && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>User Details</h3>
                  <img
                    src={userDetails.avatar}
                    alt={`${userDetails.first_name} ${userDetails.last_name}`}
                  />
                  <p>First Name: {userDetails.first_name}</p>
                  <p>Last Name: {userDetails.last_name}</p>
                  <p>Email: {userDetails.email}</p>
                  <button className="btn-close" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="page">
                Current Page: {currentPage} | Total Pages: {totalPages}
            </div>
          {(!searchTerm || filteredUsers.length) && (
            <div className="btn-pagination">
              <button
                className="prev"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <button
                className="next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
            </>
      )}
  </div>
  );

};


export default UserList;
