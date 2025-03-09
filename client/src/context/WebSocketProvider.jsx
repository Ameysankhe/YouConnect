import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:4000", { withCredentials: true });

        newSocket.on("connect", async () => {
            console.log(`🟢 Connected: ${newSocket.id}`);
            try {
                // Fetch the authenticated user's info from the server
                const res = await axios.get("http://localhost:4000/auth/status", { withCredentials: true });
                // const userId = res.data.user.id;
                // if (userId) {
                //     newSocket.emit("register", userId);
                //     console.log(`Emitted register for user ${userId}`);
                // }
                if (res.data.loggedIn && res.data.user && res.data.user.id) {
                    const userId = res.data.user.id;
                    newSocket.emit("register", userId);
                    console.log(`Emitted register for user ${userId}`);
                }
            } catch (error) {
                console.error("Error fetching session user:", error);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};
