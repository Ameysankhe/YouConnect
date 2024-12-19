import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Button, Box} from '@mui/material';
import { AccountCircle, Notifications, ExitToApp, Lock, LockOpen, Add, CheckCircle } from '@mui/icons-material';

const drawerWidth = 240;

const WorkspacePage = () => {
    const { id } = useParams();
    const [workspace, setWorkspace] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [activeSection, setActiveSection] = useState('grantAccess'); // Default active section

        useEffect(() => {
            console.log('Workspace ID from URL:', id);
            const fetchWorkspaceDetails = async () => {
                try {
                    const response = await fetch(`http://localhost:4000/workspace/${id}`, {
                        credentials: 'include',
                    });
                    const data = await response.json();
                    console.log('Fetched workspace details:', data);
                    if (response.ok) {
                        setWorkspace(data);
                        if (data.oauth_token) {
                            setHasAccess(true);
                        }
                    } else {
                        alert('Failed to fetch workspace details');
                    }
                } catch (error) {
                    console.error('Error fetching workspace details:', error);
                    alert('An error occurred.');
                }
            };

            fetchWorkspaceDetails();
        }, [id]);

        const handleGrantAccess = () => {
            console.log('Redirecting with workspaceId:', id); // Log before redirect
            window.location.href = `http://localhost:4000/auth/youtube/login?workspaceId=${id}`;
        };

        const handleRevokeAccess = async () => {
            try {
                const response = await fetch(`http://localhost:4000/workspace/${id}/revoke-access`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (response.ok) {
                    alert('Access revoked successfully');
                    setHasAccess(false);
                } else {
                    alert('Failed to revoke access');
                }
            } catch (error) {
                console.error('Error revoking access:', error);
                alert('An error occurred.');
            }
        };

        const renderContent = () => {
            switch (activeSection) {
                case 'grantAccess':
                    return (
                        <Box>
                            <Typography variant="h5">
                                {hasAccess ? "Revoke Access as you wish!" : "Grant Access to proceed!"}
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={hasAccess ? handleRevokeAccess : handleGrantAccess}
                                sx={{ marginTop: 2 }}
                            >
                                {hasAccess ? 'Revoke Access' : 'Grant Access'}
                            </Button>
                        </Box>
                    );
                case 'addEditor':
                    return <Typography variant="h5">Add editors here!</Typography>;
                case 'approveVideos':
                    return <Typography variant="h5">Approve videos here!</Typography>;
                case 'exit':
                    window.location.href = '/youtuber/dashboard';
                    return null;
                default:
                    return null;
            }
        };

        if (!workspace) {
            return <p>Loading...</p>;
        }

        return (
            <Box sx={{ display: 'flex' }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                            {workspace.name}
                        </Typography>
                        <IconButton color="inherit">
                            <Notifications />
                        </IconButton>
                        <IconButton color="inherit">
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <List>
                            <ListItem
                                button
                                selected={activeSection === 'grantAccess'}
                                onClick={() => setActiveSection('grantAccess')}
                                sx={{
                                    backgroundColor: activeSection === 'grantAccess' ? 'rgba(0, 0, 255, 0.1)' : 'transparent'
                                }}
                            >
                                <ListItemIcon>
                                    {hasAccess ? <Lock /> : <LockOpen />}
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
                                    <Add />
                                </ListItemIcon>
                                <ListItemText primary="Add Editor" />
                            </ListItem>
                            <ListItem
                                button
                                selected={activeSection === 'approveVideos'}
                                onClick={() => setActiveSection('approveVideos')}
                                sx={{
                                    backgroundColor: activeSection === 'approveVideos' ? 'rgba(0, 0, 255, 0.1)' : 'transparent'
                                }}
                            >
                                <ListItemIcon>
                                    <CheckCircle />
                                </ListItemIcon>
                                <ListItemText primary="Approve Videos" />
                            </ListItem>
                        </List>
                        <Box sx={{ flexGrow: 1 }} />
                        <List>
                            <ListItem
                                button
                                selected={activeSection === 'exit'}
                                onClick={() => setActiveSection('exit')}
                            >
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Exit" />
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        p: 3,
                        marginTop: 8,
                    }}
                >
                    {renderContent()}
                </Box>
            </Box>
        );
    };

    export default WorkspacePage;
