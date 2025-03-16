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
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null); // New state for current user info
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
                    setUserRole(data.userRole);
                    setCurrentUser(data.user); // Expecting the user details in response
                } else if (response.status === 403) {
                    setAccessDenied(true);
                    setTimeout(() => {
                        navigate(data.userRole === 'youtuber' ? '/youtuber/dashboard' : '/editor/dashboard');
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

        const fetchEditors = async () => {
            try {
                const response = await fetch(`http://localhost:4000/workspace/${id}/editors`, { credentials: 'include' });
                const data = await response.json();
                if (response.ok) {
                    setEditors(data.length === 0 ? [] : data);
                } else {
                    setSnackbar({ open: true, message: 'Failed to fetch editors', severity: 'error' });
                }
            } catch (error) {
                console.error('Error fetching editors:', error);
                setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
            }
        };

        fetchWorkspaceDetails();
        fetchEditors();

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

    // ... (other existing useEffects for notifications remain unchanged)

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
                    // ... (existing Add Editor UI)
                    <Box>
                      {/* ... existing code ... */}
                    </Box>
                ) : null;
            case 'approveVideos':
                return userRole === 'youtuber' ? (<ApproveVideos />) : null;
            case 'uploadVideo':
                return userRole !== 'youtuber' ? (<UploadVideo />) : null;
            case 'listVideos':
                return userRole !== 'youtuber' ? (<ListVideos />) : null;
            case 'chat':
                // For an editor chatting with the youtuber:
                return (
                  <ChatRoom
                    partnerName="Youtuber"
                    senderId={currentUser?.id}
                    receiverId={workspace?.owner_id}
                    workspaceId={workspace?.id}
                  />
                );
            case 'exit':
                navigate(userRole === 'youtuber' ? '/youtuber/dashboard' : '/editor/dashboard');
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
                    const partner = editors.find(editor => editor.id.toString() === editorId);
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

    // ... (rendering of notifications and drawer remain unchanged)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* ... AppBar, Drawer, etc. ... */}
          <Box component="main" sx={{ flexGrow: 1, bgcolor: darkTheme.background, p: 3, marginTop: 8, transition: 'margin-left 0.2s', marginLeft: drawerOpen ? 0 : `-${drawerWidth}px` }}>
            {renderContent()}
          </Box>
          {/* Snackbar remains unchanged */}
        </Box>
    );
};

export default WorkspacePage;
