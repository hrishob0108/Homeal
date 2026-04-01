import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const user = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5001'); // Valid since cors origin is *
            setSocket(newSocket);

            newSocket.emit('join_room', user._id);

            return () => newSocket.close();
        }
    }, [user ? user._id : null]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
