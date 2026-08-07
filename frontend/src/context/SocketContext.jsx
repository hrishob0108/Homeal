import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });
    const socketRef = useRef(null);

    useEffect(() => {
        const checkUser = () => {
            try {
                const storedUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('user')) || null;
                const currentId = user ? String(user._id || user.id || '') : '';
                const storedId = storedUser ? String(storedUser._id || storedUser.id || '') : '';
                if (storedId !== currentId || JSON.stringify(storedUser) !== JSON.stringify(user)) {
                    setUser(storedUser);
                }
            } catch (err) {
                console.error("SocketProvider user check error:", err);
            }
        };

        checkUser();
        const interval = setInterval(checkUser, 1000);
        return () => clearInterval(interval);
    }, [user]);

    const collegeName = user && user.collegeName ? String(user.collegeName).trim() : '';

    useEffect(() => {
        const userId = user ? String(user._id || user.id || '').trim() : '';
        if (userId) {
            const rawApiUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const socketUrl = rawApiUrl.replace(/\/api\/?$/, '');
            
            console.log(`[SocketProvider] Initializing connection to: ${socketUrl} for user: ${userId}`);
            
            const newSocket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            }); 
            
            socketRef.current = newSocket;
            setSocket(newSocket);

            const handleJoin = () => {
                console.log(`[SocketProvider] Emitting join_room for user: ${userId}`);
                newSocket.emit('join_room', userId);

                if (collegeName) {
                    console.log(`[SocketProvider] Emitting join_college_room for college: ${collegeName}`);
                    newSocket.emit('join_college_room', collegeName);
                }
            };

            newSocket.on('connect', handleJoin);
            newSocket.on('reconnect', handleJoin);

            if (newSocket.connected) {
                handleJoin();
            }

            return () => {
                newSocket.off('connect', handleJoin);
                newSocket.off('reconnect', handleJoin);
                newSocket.close();
                socketRef.current = null;
            };
        } else {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            setSocket(null);
        }
    }, [user ? String(user._id || user.id || '').trim() : '', collegeName]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
