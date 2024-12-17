import React from 'react'

const EditorDashboard = () => {

  const handleLogout = async () => {
    try {
        const response = await fetch('http://localhost:4000/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message); // Show logout success message
            window.location.href = '/'; // Redirect to login page
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('An error occurred during logout');
    }
};

  return (
    <div>
      <h1>Editor Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default EditorDashboard;
