import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Button, Box, Snackbar, Alert, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { AccountCircle, Notifications, ExitToApp, Lock, LockOpen, Add, CheckCircle } from '@mui/icons-material';

const drawerWidth = 240;

const WorkspacePage = () => {
    const { id } = useParams();
    const location = useLocation();
    const [workspace, setWorkspace] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [activeSection, setActiveSection] = useState('grantAccess'); // Default active section
    const [editorEmail, setEditorEmail] = useState('');
    const [editors, setEditors] = useState([]); // State to hold editors
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
                    if (data.length === 0) {
                        // No editors, but this is not an error.
                        // console.log('No editors found, but it is not an error.');
                        setEditors([]); 
                       
                    } else {
                        setEditors(data); // Set editors data
                    }
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

        // Check for success state in the URL
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('success') === 'true') {
            setSnackbar({ open: true, message: 'Access granted successfully!', severity: 'success' });
        }
    }, [id, location.search]);

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
                setSnackbar({ open: true, message: 'Editor added successfully!', severity: 'success' });
                setEditorEmail(''); // Clear the input field
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to add editor', severity: 'error' });
            }
        } catch (error) {
            console.error('Error adding editor:', error);
            setSnackbar({ open: true, message: 'An error occurred.', severity: 'error' });
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
                // return <Typography variant="h5">Add editors here!</Typography>;
                return (
                    <Box>
                        <Typography variant="h5">Add an Editor to {workspace.name}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                            <TextField
                                label="Editor Email"
                                variant="outlined"
                                value={editorEmail}
                                onChange={(e) => setEditorEmail(e.target.value)}
                                sx={{ marginBottom: 2, width: '50%' }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleEditorSubmit}
                                sx={{ marginTop: 2, width: '50%' }}
                            >
                                Add Editor
                            </Button>
                        </Box>

                        {/* Display Editors in Table */}
                        <Typography variant="h6" sx={{ marginTop: 3 }}>Editors List</Typography>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="editor table">
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
                                                <Button variant="contained" color="error" size="small">Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Box>
                );
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
        </Box>
    );
};

export default WorkspacePage;
