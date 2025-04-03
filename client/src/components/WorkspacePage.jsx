import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Button, Box, Snackbar, Alert, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Menu, MenuItem, Badge, CircularProgress, Collapse } from '@mui/material';
import { ExitToApp, Lock, LockOpen, Add, CheckCircle, CloudUpload, ListAlt, ExpandLess, ExpandMore, Menu as MenuIcon } from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from "@mui/icons-material/Notifications";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UploadVideo from './UploadVideo';
import ListVideos from './ListVideos';
import ApproveVideos from './ApproveVideos';
import ChatRoom from './ChatRoom';

const drawerWidth = 240;

const isNotificationExpired = (notificationDate) => {
    const notificationTime = new Date(notificationDate).getTime();
    const currentTime = new Date().getTime();
    const expiryTime = 3 * 24 * 60 * 60 * 1000;
    return (currentTime - notificationTime) > expiryTime;
};

const WorkspacePage = () => {
    const { id } = useParams();
    const location = useLocation();
    const [workspace, setWorkspace] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [editorEmail, setEditorEmail] = useState('');
    const [editors, setEditors] = useState([]);
    const [acceptedEditors, setAcceptedEditors] = useState([]); 
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(null);
    const [isApproveVideosOpen, setIsApproveVideosOpen] = useState(false);
    const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const navigate = useNavigate();

    const darkTheme = {
        background: '#000000', 
        paper: '#111111',
        primary: '#5050ff', 
        text: '#FFFFFF', 
        border: '#333333' 
    };

    const theme = createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        color: darkTheme.text,
                        borderColor: darkTheme.border
                    }
                }
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: 4
                    }
                }
            }
        }
    });

    useEffect(() => {
        if (!id || !userRole || userRole !== 'editor') return;

        const checkAccess = async () => {
            try {
                const response = await fetch(`http://localhost:4000/workspace/check-access/${id}`, {
                    credentials: 'include',
                });
                const data = await response.json();

                if (!data.hasAccess) {
                    setAccessDenied(true);
                    setSnackbar({
                        open: true,
                        message: 'You have been removed from this workspace',
                        severity: 'error'
                    });
                    setTimeout(() => {
                        navigate('/editor/dashboard');
                    }, 3000);
                }
            } catch (error) {
                console.error('Error checking workspace access:', error);
            }
        };

        // Check access every 5(5000) seconds
        const intervalId = setInterval(checkAccess, 7200000);

        // Initial check
        checkAccess();

        return () => clearInterval(intervalId);
    }, [id, userRole, navigate]);

    const fetchEditors = async () => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/editors`, { credentials: 'include' });
            const data = await response.json();
            if (response.ok) {
                if (data.length === 0) {
                    setEditors([]);

                } else {
                    setEditors(data);
                }
            } else {
                setSnackbar({ open: true, message: 'Failed to fetch editors', severity: 'error' });
            }
        } catch (error) {
            console.error('Error fetching editors:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
        }
    };

    const fetchAcceptedEditors = async () => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/accepted-editors`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setAcceptedEditors(data.length === 0 ? [] : data);
            } else {
                setSnackbar({ open: true, message: 'Failed to fetch accepted editors', severity: 'error' });
            }
        } catch (error) {
            console.error('Error fetching accepted editors:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
        }
    };

    const fetchWorkspaceDetails = async () => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            console.log('Fetched workspace details:', data);
            if (response.ok) {
                setWorkspace(data.workspace);
                if (data.workspace.oauth_token) {
                    setHasAccess(true);
                }
                setUserRole(data.userRole)
            } else if (response.status === 403) {
                setAccessDenied(true);
                setTimeout(() => {
                    if (data.userRole === 'youtuber') {
                        // window.location.href = '/youtuber/dashboard';
                        navigate('/youtuber/dashboard');
                    } else {
                        // window.location.href = '/editor/dashboard';
                        navigate('/editor/dashboard');
                    }
                }, 3000);
            }
            else {
                setSnackbar({ open: true, message: 'Failed to fetch workspace details', severity: 'error' });
            }
        } catch (error) {
            console.error('Error fetching workspace details:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/details`, {
                credentials: 'include',
            });
            const data = await response.json();
            console.log('Fetched current user details:', data);
            if (response.ok) {
                setCurrentUser(data.currentUser);
            } else {
                console.error('Failed to fetch current user details');
            }
        } catch (error) {
            console.error('Error fetching current user details:', error);
        }
    };

    useEffect(() => {
    
        fetchEditors();
        fetchAcceptedEditors();
        fetchWorkspaceDetails();
        fetchCurrentUser();

        // Check for success state in the URL
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('success') === 'true') {
            setSnackbar({ open: true, message: 'Access granted successfully!', severity: 'success' });
            searchParams.delete('success');
            const newSearch = searchParams.toString();
            const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
            window.history.replaceState(null, '', newUrl);
        }

    }, [id, location.search]);

    useEffect(() => {

        if (userRole === 'youtuber') {
            setActiveSection('grantAccess');
        } else if (userRole) {
            setActiveSection('uploadVideo');
        }

    }, [userRole]);

    useEffect(() => {

        const fetchNotifications = async () => {
            try {
                const endpoint = userRole === 'youtuber'
                    ? `http://localhost:4000/youtuber/notifications/${id}`
                    : `http://localhost:4000/editor/notifications/${id}`;

                const response = await fetch(endpoint, { credentials: 'include' });
                const data = await response.json();
                if (response.ok) {
                    const validNotifications = data.filter(notification => !isNotificationExpired(notification.created_at));
                    setNotifications(validNotifications);

                    // Get the last seen notification time from localStorage
                    const storedLastSeenTime = localStorage.getItem('lastSeenNotificationTime');
                    const parsedLastSeenTime = storedLastSeenTime ? parseInt(storedLastSeenTime, 10) : 0;

                    // Check for new notifications since the last seen time
                    const latestNotification = validNotifications.find(
                        (notification) => new Date(notification.created_at).getTime() > parsedLastSeenTime
                    );
                    const unread = validNotifications.filter(notification => new Date(notification.created_at).getTime() > parsedLastSeenTime).length;
                    setUnreadCount(unread);
                } else {
                    console.error('Failed to fetch notifications');
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (userRole) {
            fetchNotifications();
            const intervalId = setInterval(fetchNotifications, 7200000); // Fetch every 2 hours
            return () => clearInterval(intervalId);
        }

    }, [userRole, id]);

    const handleNotificationClick = (event) => {
        if (notificationAnchor) {
            setNotificationAnchor(null);
        } else {
            setNotificationAnchor(event.currentTarget);
            markNotificationsAsSeen();
        }
    };

    const markNotificationsAsSeen = () => {
        const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            seen: true,
        }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
        const currentTime = new Date().getTime();
        setLastSeenNotificationTime(currentTime);
        localStorage.setItem('lastSeenNotificationTime', currentTime.toString());
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const renderNotifications = () => (
        <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            disablePortal
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                    <MenuItem key={index}>
                        {notification.message}
                    </MenuItem>
                ))
            ) : (
                <MenuItem>No new notifications</MenuItem>
            )}
        </Menu>
    );

    const handleGrantAccess = () => {
        console.log('Redirecting with workspaceId:', id);
        window.location.href = `http://localhost:4000/auth/youtube/login?workspaceId=${id}`;
    };

    const handleRevokeAccess = async () => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/revoke-access`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Access revoked successfully', severity: 'success' });
                setHasAccess(false);
            } else {
                setSnackbar({ open: true, message: 'Failed to revoke access', severity: 'error' });
            }
        } catch (error) {
            console.error('Error revoking access:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
        }
    };

    const handleEditorSubmit = async () => {
        if (!editorEmail) {
            setSnackbar({ open: true, message: 'Please enter an email', severity: 'error' });
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/add-editor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: editorEmail }),
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setSnackbar({ open: true, message: 'Request sent successfully!', severity: 'success' });
                setEditorEmail('');
                await fetchEditors();
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to add editor', severity: 'error' });
            }
        } catch (error) {
            console.error('Error adding editor:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
        }
    };

    // Add a function to handle deleting an editor
    const handleDeleteEditor = async (editorId) => {
        try {
            const response = await fetch(`http://localhost:4000/workspace/${id}/editor/${editorId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setSnackbar({ open: true, message: data.message, severity: 'success' });
                // Remove the deleted editor from the state
                setEditors((prevEditors) => prevEditors.filter((editor) => editor.id !== editorId));
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to remove editor', severity: 'error' });
            }
        } catch (error) {
            console.error('Error removing editor:', error);
            setSnackbar({ open: true, message: 'An error occurred while removing the editor.', severity: 'error' });
        }
    };


    const renderContent = () => {
        switch (activeSection) {
            case 'grantAccess':
                return userRole === 'youtuber' ? (
                    <Box>
                        <Typography variant="h5" sx={{ color: darkTheme.text }}>
                            {hasAccess ? "Revoke Access as you wish!" : "Grant Access to proceed!"}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={hasAccess ? handleRevokeAccess : handleGrantAccess}
                            sx={{ marginTop: 2, bgcolor: darkTheme.primary }}
                        >
                            {hasAccess ? 'Revoke Access' : 'Grant Access'}
                        </Button>
                    </Box>
                ) : null;
            case 'addEditor':
                return userRole === 'youtuber' ? (
                    <Box>
                        <Typography variant="h5" sx={{ color: darkTheme.text }}>Add an Editor to {workspace.name}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                            <TextField
                                label="Editor Email"
                                variant="outlined"
                                value={editorEmail}
                                onChange={(e) => setEditorEmail(e.target.value)}
                                sx={{
                                    marginBottom: 2, width: '50%', '& .MuiOutlinedInput-root': {
                                        color: darkTheme.text, // This sets the input text color
                                        '& fieldset': {
                                            borderColor: darkTheme.border,
                                        },
                                        '&:hover fieldset': {
                                            borderColor: darkTheme.primary,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: darkTheme.primary,
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: darkTheme.text, // This sets the label color
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                                        opacity: 1,
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: darkTheme.text, // Color when focused and floating
                                    },
                                    '& .MuiInputLabel-shrink': {
                                        color: darkTheme.text, // Color when shrunk (floating)
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleEditorSubmit}
                                sx={{ marginTop: 2, width: '50%', bgcolor: darkTheme.primary }}
                            >
                                Add Editor
                            </Button>
                        </Box>

                        {/* Display Editors in Table */}
                        <Typography variant="h6" sx={{ marginTop: 3, color: darkTheme.text }}>Editors List</Typography>
                        <ThemeProvider theme={theme}>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650, bgcolor: darkTheme.paper, }} aria-label="editor table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Sr.No.</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {editors.map((editor, index) => (
                                            <TableRow key={editor.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{editor.email}</TableCell>
                                                <TableCell>{editor.status}</TableCell>
                                                <TableCell>
                                                    {editor.status === 'Pending' ? (
                                                        <Typography variant="body2" sx={{ color: darkTheme.text }}>No actions available</Typography>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleDeleteEditor(editor.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </ThemeProvider>

                    </Box>
                ) : null;
            case 'approveVideos':
                return userRole === 'youtuber' ? (<ApproveVideos />) : null;

            case 'uploadVideo':
                return userRole !== 'youtuber' ? (<UploadVideo />) : null;

            case 'listVideos':
                return userRole !== 'youtuber' ? (<ListVideos />) : null;

            case 'chat':
                // For editor chatting with youtuber
                return (
                    <ChatRoom
                        partnerName={workspace?.owner_name || "Youtuber"}
                        senderId={currentUser?.id}
                        receiverId={workspace?.owner_id}
                        workspaceId={workspace?.id}
                    />
                );

            case 'exit':
                if (userRole === 'youtuber') {
                    // window.location.href = '/youtuber/dashboard';
                    navigate('/youtuber/dashboard');
                } else {
                    // window.location.href = '/editor/dashboard';
                    navigate('/editor/dashboard');
                }
                return null;

            default:
                if (activeSection.startsWith('approveVideos-')) {
                    const editorId = activeSection.split('-')[1];
                    return userRole === 'youtuber' ? (
                        <ApproveVideos editorId={editorId} />
                    ) : null;
                }
                if (activeSection.startsWith('chat-')) {
                    const editorId = activeSection.split('-')[1];
                    const partner = acceptedEditors.find(editor => editor.id.toString() === editorId);
                    const partnerName = partner ? partner.email : "Editor";
                    return (
                        <ChatRoom
                            partnerName={partnerName}
                            senderId={currentUser?.id}
                            receiverId={partner ? partner.id : null}
                            workspaceId={workspace?.id}
                        />
                    );
                }
                return null;
        }
    };

    if (accessDenied) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: 2
                }}
            >
                <Typography variant="h4" color="error">
                    Access Denied
                </Typography>
                <Typography variant="h6" sx={{ color: darkTheme.text }}>
                    You do not have permission to access this workspace.
                </Typography>
                <Typography variant="body1" sx={{ color: darkTheme.text }}>
                    Redirecting to dashboard...
                </Typography>
                <CircularProgress sx={{ mt: 2, color: darkTheme.primary }} />
            </Box>
        );
    }

    if (!workspace) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: darkTheme.primary }} />
            </div>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: darkTheme.paper,
                borderBottom: `1px solid ${darkTheme.border}`,
            }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        edge="start"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {workspace.name}
                    </Typography>
                    <IconButton color="inherit" onClick={handleNotificationClick}>
                        <Badge
                            badgeContent={unreadCount > 0 ? unreadCount : null}
                            color="error"
                        >
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {renderNotifications()}
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        bgcolor: darkTheme.paper,
                        borderRight: `1px solid ${darkTheme.border}`,
                        color: darkTheme.text,
                        position: 'fixed',
                        height: '100vh',
                        transition: 'width 0.2s',
                        whiteSpace: 'nowrap',
                        width: drawerOpen ? drawerWidth : 0,
                        overflowX: 'hidden'
                    },
                }}
                open={drawerOpen}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
                    <List>
                        {userRole === 'youtuber' && (
                            <>
                                <ListItem
                                    button
                                    selected={activeSection === 'grantAccess'}
                                    onClick={() => setActiveSection('grantAccess')}
                                    sx={{
                                        backgroundColor: activeSection === 'grantAccess' ? 'rgba(0, 0, 255, 0.1)' : 'transparent'
                                    }}
                                >
                                    <ListItemIcon>
                                        {hasAccess ? <Lock sx={{ color: darkTheme.primary }} /> : <LockOpen sx={{ color: darkTheme.primary }} />}
                                    </ListItemIcon>

                                    <ListItemText primary={hasAccess ? "Revoke Access" : "Grant Access"} />
                                </ListItem>
                                <ListItem
                                    button
                                    selected={activeSection === 'addEditor'}
                                    onClick={() => setActiveSection('addEditor')}
                                    sx={{
                                        backgroundColor: activeSection === 'addEditor' ? 'rgba(0, 0, 255, 0.1)' : 'transparent'
                                    }}
                                >
                                    <ListItemIcon>
                                        <Add sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Add Editor" />
                                </ListItem>
                                <ListItem
                                    button
                                    onClick={() => {
                                        setIsApproveVideosOpen(!isApproveVideosOpen);

                                    }}
                                >
                                    <ListItemIcon>
                                        <CheckCircle sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Approve Videos" />

                                    <IconButton size="small">
                                        {isApproveVideosOpen ? <ExpandLess sx={{ color: darkTheme.text }} /> : <ExpandMore sx={{ color: darkTheme.text }} />}
                                    </IconButton>

                                </ListItem>
                                <Collapse in={isApproveVideosOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {acceptedEditors.length > 0 ? (
                                            acceptedEditors.map((editor) => (
                                                <ListItem
                                                    key={editor.id}
                                                    button
                                                    sx={{
                                                        pl: 4,
                                                        backgroundColor: activeSection === `approveVideos-${editor.id}` ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                                    }}
                                                    onClick={() => {
                                                        setActiveSection(`approveVideos-${editor.id}`);
                                                    }}
                                                >
                                                    <ListItemText primary={editor.email} onClick={() => {
                                                        setActiveSection('approveVideos');
                                                    }} />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem sx={{ pl: 4 }}>
                                                <ListItemText
                                                    primary="No editors present"
                                                    sx={{
                                                        color: darkTheme.text,
                                                    }}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Collapse>
                                {/* Chat Room section for youtuber */}
                                <ListItem
                                    button
                                    onClick={() => setIsChatRoomOpen(!isChatRoomOpen)}
                                >
                                    <ListItemIcon>
                                        <ChatIcon sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Chat Room" />
                                    <IconButton size="small">
                                        {isChatRoomOpen ? <ExpandLess sx={{ color: darkTheme.text }} /> : <ExpandMore sx={{ color: darkTheme.text }} />}
                                    </IconButton>
                                </ListItem>
                                <Collapse in={isChatRoomOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {acceptedEditors.length > 0 ? (
                                            acceptedEditors.map((editor) => (
                                                <ListItem
                                                    key={editor.id}
                                                    button
                                                    sx={{
                                                        pl: 4,
                                                        backgroundColor: activeSection === `chat-${editor.id}` ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                                    }}
                                                    onClick={() => setActiveSection(`chat-${editor.id}`)}
                                                >
                                                    <ListItemText primary={editor.email} />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem sx={{ pl: 4 }}>
                                                <ListItemText primary="No editors available" sx={{ color: darkTheme.text }} />
                                            </ListItem>
                                        )}
                                    </List>
                                </Collapse>
                            </>
                        )}
                        {userRole !== 'youtuber' && (
                            <>
                                <ListItem
                                    button
                                    selected={activeSection === 'uploadVideo'}
                                    onClick={() => setActiveSection('uploadVideo')}
                                    sx={{
                                        backgroundColor: activeSection === 'uploadVideo' ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>
                                        <CloudUpload sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Upload Video" />
                                </ListItem>
                                <ListItem
                                    button
                                    selected={activeSection === 'listVideos'}
                                    onClick={() => setActiveSection('listVideos')}
                                    sx={{
                                        backgroundColor: activeSection === 'listVideos' ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>
                                        <ListAlt sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="List of Videos" />
                                </ListItem>
                                {/* Chat Room for editor */}
                                <ListItem
                                    button
                                    selected={activeSection === 'chat'}
                                    onClick={() => setActiveSection('chat')}
                                    sx={{
                                        backgroundColor: activeSection === 'chat' ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>
                                        <ChatIcon sx={{ color: darkTheme.primary }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Chat Room" />
                                </ListItem>
                            </>
                        )}
                    </List>
                    <Box sx={{ flexGrow: 1 }} />
                    <List>
                        <ListItem
                            button
                            selected={activeSection === 'exit'}
                            onClick={() => setActiveSection('exit')}
                        >
                            <ListItemIcon>
                                <ExitToApp sx={{ color: darkTheme.text }} />
                            </ListItemIcon>
                            <ListItemText primary="Exit" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer >
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: darkTheme.background,
                    p: 3,
                    marginTop: 8,
                    transition: 'margin-left 0.2s',
                    marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
                }}
            >
                {renderContent()}
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box >
    );
};

export default WorkspacePage;
