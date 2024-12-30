CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspace_editors (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    editor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Status: 'Pending', 'Accepted', 'Declined'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  editor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Editor receiving the notification
  message TEXT NOT NULL,  -- Notification message
  action_type VARCHAR(50),  -- Type of action ('invite')
  status VARCHAR(20) DEFAULT 'pending',  -- Status of the notification
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Time of creation
  expires_at TIMESTAMP,  -- Expiration time for the notification
  workspace_editor_id INT NOT NULL REFERENCES workspace_editors(id) ON DELETE CASCADE,  -- Link to workspace_editors table
  UNIQUE (editor_id, workspace_editor_id)  -- Prevent duplicate notifications for the same editor and invite
);

CREATE TABLE general_notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User receiving the notification
  recipient_role VARCHAR(20) NOT NULL, -- Role of the recipient ('editor' or 'youtuber')
  message TEXT NOT NULL, -- Notification message
  notification_type VARCHAR(50) NOT NULL, -- Type of notification (e.g., 'invite_response', 'video_upload', 'video_review', 'video_deletion')
  related_workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE, -- Associated workspace (if applicable)
  related_entity_id INT, -- ID of the related entity (e.g., workspace_editor_id, video_id)
  related_entity_type VARCHAR(50), -- Type of related entity (e.g., 'workspace_editor', 'video')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
  expires_at TIMESTAMP, -- Expiration time for the notification (optional)
  UNIQUE (recipient_id, notification_type, related_entity_id) -- Prevent duplicate notifications
);

-- There is also a session table


