import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { WebSocketContext } from '../context/WebSocketProvider';

const ChatRoom = ({ partnerName, senderId, receiverId, workspaceId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useContext(WebSocketContext);

    // Fetch chat history from backend
    useEffect(() => {
        fetch(`http://localhost:4000/chat/${workspaceId}/${senderId}/${receiverId}`)
            .then((res) => res.json())
            .then((data) => {
                setMessages(data);
            })
            .catch((err) => console.error("Error fetching chat history:", err));
    }, [workspaceId, senderId, receiverId]);

    // Listen for new messages via websockets
    useEffect(() => {
        if (!socket) return;
        const messageHandler = (data) => {
            // data: { sender_id, message, timestamp }
            setMessages(prev => [...prev, data]);
        };
        socket.on('receive_message', messageHandler);
        return () => {
            socket.off('receive_message', messageHandler);
        };
    }, [socket]);

    const handleSend = () => {
        if (newMessage.trim() === '') return;
        const messagePayload = {
            workspace_id: workspaceId,
            sender_id: senderId,
            receiver_id: receiverId,
            message: newMessage,
        };

        // Send the message to the backend
        fetch('http://localhost:4000/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Optionally update the chat immediately (optimistic update)
                    setMessages(prev => [...prev, { sender_id: senderId, message: newMessage, timestamp: new Date() }]);
                    setNewMessage('');
                }
            })
            .catch(err => console.error("Error sending message:", err));
    };

    return (
        <Paper
            elevation={3}
            sx={{
                padding: 2,
                backgroundColor: '#222',
                color: '#fff',
                // minHeight: '80vh',
                height: '80vh', 
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Chat with {partnerName}
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2, pr: 2, pl: 2 }}>
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            marginBottom: 1,
                            textAlign: msg.sender_id === senderId ? 'right' : 'left'
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                display: 'inline-block',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender_id === senderId ? '#5050ff' : '#444'
                            }}
                        >
                            {msg.message}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ display: 'block', marginTop: 0.5, color: '#aaa' }}
                        >
                            {new Date(msg.timestamp).toLocaleString()}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box sx={{ display: 'flex' }}>
                <TextField
                    variant="outlined"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    fullWidth
                    sx={{ backgroundColor: '#333', input: { color: '#fff' } }}
                />
                <Button
                    variant="contained"
                    sx={{ marginLeft: 1, bgcolor: '#5050ff' }}
                    onClick={handleSend}
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default ChatRoom;
