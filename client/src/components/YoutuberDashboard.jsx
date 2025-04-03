import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
  Popover,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  AddCircle,
  Logout,
  Notifications,
  AccountCircle,
  Close,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { AuthContext } from "../App";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const drawerWidth = 240;

const YoutuberDashboard = () => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const darkTheme = {
    background: "#000000", //black
    paper: "#111111", // very dark grey
    primary: "#5050ff", // vibrant shade of blue
    text: "#FFFFFF", // white
    border: "#333333", // dark grey
  };

  // Fetch user info on component mount
  useEffect(() => {
    fetch("http://localhost:4000/auth/user-info", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        showSnackbar("Failed to fetch user info", "error");
      });
  }, []);

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("http://localhost:4000/workspaces", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setWorkspaces(data.workspaces);
        setLoading(false);
      } else {
        showSnackbar("Failed to fetch workspaces", "error");
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      showSnackbar("An error occurred while fetching workspaces.", "error");
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Handle workspace creation
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/workspaces/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showSnackbar("Workspace created successfully!", "success");
        setOpenModal(false);
        fetchWorkspaces();
        setWorkspaceName("");
        setWorkspaceDescription("");
      } else {
        showSnackbar(`Error: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      showSnackbar("An error occurred during workspace creation.", "error");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        showSnackbar("Logged out successfully", "success");
        setIsAuthenticated(false);
        // setTimeout(() => {
        //     // window.location.href = '/';
        //     navigate("/");
        // }, 1000);
        navigate("/");
      } else {
        showSnackbar("Logout failed", "error");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      showSnackbar("An error occurred during logout.", "error");
    }
  };

  // Handle menu click
  const handleMenuClick = (event, workspace) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedWorkspace(workspace);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle AccountCircle icon click (Popover)
  const handlePopoverOpen = (event) => {
    setPopoverAnchorEl(event.currentTarget);
  };

  const handleCloseModal = () => {
    setWorkspaceName("");
    setWorkspaceDescription("");
    setOpenModal(false);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };

  // Handle delete action
  const handleDeleteWorkspace = async () => {
    if (workspaceToDelete) {
      try {
        const response = await fetch(
          `http://localhost:4000/workspace/${workspaceToDelete.id}/delete`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          showSnackbar("Workspace deleted successfully", "success");
          fetchWorkspaces();
        } else {
          showSnackbar(data.message || "Failed to delete workspace", "error");
        }
      } catch (error) {
        console.error("Error deleting workspace:", error);
        showSnackbar(
          "An error occurred while deleting the workspace.",
          "error"
        );
      }
    }
    setWorkspaceToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: darkTheme.background,
        minHeight: "100vh",
        color: darkTheme.text,
      }}
    >
      {/* AppBar with Icons */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: darkTheme.paper,
          borderBottom: `1px solid ${darkTheme.border}`,
          boxShadow: "none",
        }}
      >
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
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              color: darkTheme.text,
              fontWeight: "bold",
            }}
          >
            YouConnect
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" onClick={handlePopoverOpen}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Popover for AccountCircle */}
      <Popover
        open={Boolean(popoverAnchorEl)}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box p={2}>
          <Typography>Hello! {username}!</Typography>
        </Box>
      </Popover>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            bgcolor: darkTheme.paper,
            borderRight: `1px solid ${darkTheme.border}`,
            color: darkTheme.text,
            position: "fixed",
            height: "100vh",
            transition: "width 0.2s",
            whiteSpace: "nowrap",
            width: drawerOpen ? drawerWidth : 0,
            overflowX: "hidden",
          },
        }}
        open={drawerOpen}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <List>
            <ListItem button onClick={() => setOpenModal(true)}>
              <ListItemIcon>
                <AddCircle sx={{ color: darkTheme.primary }} />
              </ListItemIcon>
              <ListItemText primary="Create Workspace" />
            </ListItem>
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout sx={{ color: darkTheme.text }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: 8,
          transition: "margin-left 0.2s",
          marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
        }}
      >
        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress sx={{ color: darkTheme.primary }} />
          </Box>
        ) : (
          <>
            {workspaces.length === 0 ? (
              <Box textAlign="center" mt={5}>
                <Typography variant="h5" sx={{ color: darkTheme.text }}>
                  No Workspace Created
                </Typography>
                <IconButton onClick={() => setOpenModal(true)} sx={{ mt: 2 }}>
                  <AddCircle sx={{ fontSize: 50, color: darkTheme.text }} />
                </IconButton>
              </Box>
            ) : (
              <Box display="flex" flexWrap="wrap" gap="20px">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    sx={{
                      width: 250,
                      bgcolor: darkTheme.paper,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: 2,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <IconButton
                      sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                      onClick={(event) => handleMenuClick(event, workspace)} // Open menu when clicked
                    >
                      <MoreVertIcon sx={{ color: darkTheme.text }} />
                    </IconButton>
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        "&:last-child": { pb: 2 }, // Override MUI's default padding
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            borderBottom: `2px solid ${darkTheme.text}`,
                            paddingBottom: "4px",
                            color: darkTheme.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {workspace.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            marginTop: "10px",
                            color: "rgba(255,255,255,0.7)",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            textOverflow: "ellipsis",
                            height: "4.5em", // Approximately 3 lines of text
                            overflowWrap: 'break-word', // Add this line to break long words
                            wordBreak: 'break-word'    // Add this as a fallback
                          }}
                        >
                          {workspace.description}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "auto", pt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2, bgcolor: darkTheme.primary }}
                          // onClick={() => window.location.href = `/workspace/${workspace.id}`}
                          onClick={() => navigate(`/workspace/${workspace.id}`)}
                        >
                          Enter Workspace
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Floating Form (Modal) */}
      {/* <Modal open={openModal} onClose={() => setOpenModal(false)}> */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          component="form"
          onSubmit={handleCreateWorkspace}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: darkTheme.paper,
            border: `1px solid ${darkTheme.border}`,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 400,
            color: darkTheme.text,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Create Workspace</Typography>
            <IconButton onClick={handleCloseModal}>
              <Close sx={{ color: darkTheme.text }} />
            </IconButton>
          </Box>
          <TextField
            label="Workspace Name"
            fullWidth
            margin="normal"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkTheme.text,
                "& fieldset": {
                  borderColor: darkTheme.border,
                },
                "&:hover fieldset": {
                  borderColor: darkTheme.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkTheme.primary,
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                color: darkTheme.text,
                "& fieldset": {
                  borderColor: darkTheme.border,
                },
                "&:hover fieldset": {
                  borderColor: darkTheme.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkTheme.primary,
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
              },
            }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, bgcolor: darkTheme.primary }}
          >
            Submit
          </Button>
        </Box>
      </Modal>

      {/* Menu for workspace actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setWorkspaceToDelete(selectedWorkspace);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{}}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the workspace "
            {workspaceToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteWorkspace} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YoutuberDashboard;
