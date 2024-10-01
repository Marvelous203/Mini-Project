import React, { useState } from "react";
import axios from "axios";
import { User } from "../types";
import "../components/UserList";

interface UserSearchProps {
  setFilteredUsers: (users: User[], noData: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  setFilteredUsers,
  searchTerm,
  setSearchTerm,
}) => {
  const [, setAllUsers] = useState<User[]>([]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      try {
        const response = await axios.get(`https://reqres.in/api/users?page=1`);
        const totalPages = response.data.total_pages;

        const requests = [];
        for (let page = 1; page <= totalPages; page++) {
          requests.push(axios.get(`https://reqres.in/api/users?page=${page}`));
        }

        const responses = await Promise.all(requests);
        const users = responses.flatMap((res) => res.data.data);
        setAllUsers(users); // Store all users for filtering

        // Filter based on search term
        const filtered = users.filter(
          (user: User) =>
            user.first_name.toLowerCase().includes(term.toLowerCase()) ||
            user.last_name.toLowerCase().includes(term.toLowerCase())
        );

        if (filtered.length > 0) {
          setFilteredUsers(filtered, false);
        } else {
          setFilteredUsers([], true);
        }
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    } else {
      setFilteredUsers([], false);
    }
  };

  return (
    <input
      className="input-filter"
      type="text"
      placeholder="Search by first or last name..."
      value={searchTerm}
      onChange={handleSearchChange}
    />
  );
};

export default UserSearch;
