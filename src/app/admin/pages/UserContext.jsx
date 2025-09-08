"use client";
import React, { createContext, useContext, useState } from "react";

// User Type Definition
export const initialUsers = [
  {
    id: 1,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    name: "Ali Raza",
    email: "ali@email.com",
    phone: "+923001234567",
    role: "Admin",
    createdAt: "2024-07-01"
  },
  {
    id: 2,
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Sara Ahmed",
    email: "sara@email.com",
    phone: "+923004567890",
    role: "Editor",
    createdAt: "2024-07-02"
  }
];

// Context Create
const UserContext = createContext({
  users: [],
  setUsers: () => {},
  addUser: () => {},
});

// Provider Component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: users.length ? users[users.length - 1].id + 1 : 1,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setUsers((prev) => [...prev, newUser]);
  };

  return (
    <UserContext.Provider value={{ users, setUsers, addUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for accessing context
export const useUserList = () => useContext(UserContext);
