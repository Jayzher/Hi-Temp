import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create a context to manage the socket instance
const SocketContext = createContext();

// Custom hook to access the socket instance
export const useSocket = () => useContext(SocketContext);

// SocketProvider component to manage the socket connection
export const SocketProvider = ({ url, options, children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize the socket connection
        const newSocket = io(url, options);
        setSocket(newSocket);

        // Clean up function to close socket connection
        return () => {
            newSocket.disconnect();
        };
    }, [url, options]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
