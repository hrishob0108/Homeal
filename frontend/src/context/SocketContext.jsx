import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
                setUser(storedUser);
            }
        };

        checkUser();
        const interval = setInterval(checkUser, 1000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (user) {
            const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
            const newSocket = io(socketUrl); 
            setSocket(newSocket);

            newSocket.emit('join_room', user._id);

            return () => newSocket.close();
        } else {
            setSocket(null);
        }
    }, [user ? user._id : null]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
