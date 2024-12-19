import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Modal,
    TextField,
    Card,
    CardContent,
    Menu,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { Home, AddCircle, Logout, Notifications, AccountCircle, Close } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Three dots icon

const drawerWidth = 240;

const YoutuberDashboard = () => {
    // const [showForm, setShowForm] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceDescription, setWorkspaceDescription] = useState('');
    const [workspaces, setWorkspaces] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); // State for the menu anchor element
    const [selectedWorkspace, setSelectedWorkspace] = useState(null); // To store the workspace being selected

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // Show Snackbar
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    // Fetch workspaces
    const fetchWorkspaces = async () => {
        try {
            const response = await fetch('http://localhost:4000/workspaces', {
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setWorkspaces(data.workspaces);
            } else {
                // alert('Failed to fetch workspaces');
                showSnackbar('Failed to fetch workspaces', 'error');
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            // alert('An error occurred while fetching workspaces.');
            showSnackbar('An error occurred while fetching workspaces.', 'error');
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // Handle workspace creation
    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/workspaces/create', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: workspaceName, description: workspaceDescription }),
            });

            const data = await response.json();
            if (response.ok) {
                // alert('Workspace created successfully!');
                showSnackbar('Workspace created successfully!', 'success');
                setOpenModal(false);
                fetchWorkspaces();
                setWorkspaceName('');
                setWorkspaceDescription('');
            } else {
                // alert(`Error: ${data.error}`);
                showSnackbar(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error creating workspace:', error);
            // alert('An error occurred during workspace creation.');
            showSnackbar('An error occurred during workspace creation.', 'error');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:4000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                // window.location.href = '/';
                showSnackbar('Logged out successfully', 'success'); // Show success message
                setTimeout(() => {
                    window.location.href = '/'; // Redirect after 0.5 seconds
                }, 1000);
            } else {
                // alert('Logout failed');
                showSnackbar('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            showSnackbar('An error occurred during logout.', 'error');
        }
    };


    // Handle menu click (open/close)
    const handleMenuClick = (event, workspace) => {
        setAnchorEl(event.currentTarget); // Open the menu
        setSelectedWorkspace(workspace); // Set the workspace for which the menu is opened
    };

    // Handle menu close
    const handleMenuClose = () => {
        setAnchorEl(null); // Close the menu
    };

    // Handle delete action
    //  const handleDeleteWorkspace = async () => {
    //     if (selectedWorkspace) {
    //         try {
    //             const response = await fetch(`http://localhost:4000/workspaces/${selectedWorkspace.id}/delete`, {
    //                 method: 'DELETE',
    //                 credentials: 'include',
    //             });
    //             if (response.ok) {
    //                 alert('Workspace deleted successfully');
    //                 fetchWorkspaces();
    //             } else {
    //                 alert('Failed to delete workspace');
    //             }
    //         } catch (error) {
    //             console.error('Error deleting workspace:', error);
    //             alert('An error occurred while deleting the workspace.');
    //         }
    //     }
    //     setAnchorEl(null); // Close the menu after deleting
    // };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar with Icons */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        WeConnect
                    </Typography>
                    <IconButton color="inherit">
                        <Notifications />
                    </IconButton>
                    <IconButton color="inherit">
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <List>
                        {/* <ListItem button>
                            <ListItemIcon><Home /></ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem> */}
                        <ListItem button onClick={() => setOpenModal(true)} >
                            <ListItemIcon><AddCircle /></ListItemIcon>
                            <ListItemText primary="Create Workspace" />
                        </ListItem>
                    </List>
                    <Box sx={{ flexGrow: 1 }} />
                    <List>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><Logout /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {/* Show 'No Workspace' or Workspace Cards */}
                {workspaces.length === 0 ? (
                    <Box textAlign="center" mt={5}>
                        <Typography variant="h5">No Workspace Created</Typography>
                        <IconButton onClick={() => setOpenModal(true)} sx={{ mt: 2 }}>
                            <AddCircle sx={{ fontSize: 50 }} />
                        </IconButton>
                    </Box>
                ) : (
                    <Box display="flex" flexWrap="wrap" gap="20px">
                        {workspaces.map((workspace) => (
                            <Card key={workspace.id} sx={{ width: 250, position: 'relative' }}>
                                <IconButton
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    onClick={(event) => handleMenuClick(event, workspace)} // Open menu when clicked
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <CardContent>
                                    <Typography variant="h6" sx={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>{workspace.name}</Typography>
                                    <Typography variant="body2" sx={{ marginBottom: '16px', marginTop: '10px' }}>{workspace.description}</Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => window.location.href = `/workspace/${workspace.id}`}
                                    >
                                        Enter Workspace
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Floating Form (Modal) */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    component="form"
                    onSubmit={handleCreateWorkspace}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: 400,
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Create Workspace</Typography>
                        <IconButton onClick={() => setOpenModal(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                    <TextField
                        label="Workspace Name"
                        fullWidth
                        margin="normal"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        required
                    />
                    <TextField
                        label="Workspace Description"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        value={workspaceDescription}
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </Box>
            </Modal>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {/* <MenuItem onClick={handleDeleteWorkspace}>Delete</MenuItem> */}
                <MenuItem>Delete</MenuItem>
            </Menu>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default YoutuberDashboard;
