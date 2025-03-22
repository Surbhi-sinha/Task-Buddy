// src/components/TaskModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import '../styles/TaskModal.css';

const TaskModal = ({ isOpen, onClose, task = null, mode = 'create' }) => {
  const { addTask, updateTask, addFileActivity } = useTasks();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: '',
    category: 'Work',
    activities: []
  });
  const [attachments, setAttachments] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);
  const fileInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [previousValues, setPreviousValues] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: '',
    category: ''
  });

  // Initialize form with task data if editing
  useEffect(() => {
    if (task && mode === 'edit') {
      const currentTask = {
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        status: task.status || '',
        category: task.category || 'Work',
        activities: task.activities || []
      };
      
      setTaskData(currentTask);
      setPreviousValues({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        status: task.status || '',
        category: task.category || 'Work'
      });
      setCharacterCount(task.description?.length || 0);
    } else {
      // Reset form for create mode
      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        status: '',
        category: 'Work',
        activities: []
      });
      setPreviousValues({
        title: '',
        description: '',
        dueDate: '',
        status: '',
        category: 'Work'
      });
      setCharacterCount(0);
    }
  }, [task, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
    
    if (name === 'description') {
      setCharacterCount(value.length);
    }
  };
  
  const handleDateInputClick = () => {
    dateInputRef.current?.showPicker();
  };

  // Format date for activity display
  const formatActivityDate = (date = new Date()) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    
    return `${month} ${day} at ${hours}:${minutes} ${ampm}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSubmit = () => {
    if (!taskData.title.trim()) return;

    if (mode === 'edit' && task) {
      // Create a copy of activities
      let updatedActivities = [...taskData.activities];
      const now = new Date();
      const timestamp = now.toISOString();
      const displayTime = formatActivityDate(now);
      
      // Track title changes
      if (previousValues.title && previousValues.title !== taskData.title) {
        updatedActivities.push({
          type: 'title',
          message: `You changed title from "${previousValues.title}" to "${taskData.title}"`,
          timestamp,
          displayTime
        });
      }
      
      // Track description changes - only if there's a meaningful change
      if (previousValues.description !== taskData.description) {
        // Only add activity if:
        // 1. Previous description was empty and new one isn't (added description)
        // 2. Both previous and new descriptions exist but are different (updated description)
        if ((!previousValues.description && taskData.description) || 
            (previousValues.description && taskData.description && previousValues.description !== taskData.description)) {
          updatedActivities.push({
            type: 'description',
            message: previousValues.description 
              ? `You updated the description`
              : `You added a description`,
            timestamp,
            displayTime
          });
        }
      }
      
      // Track due date changes
      if (previousValues.dueDate && previousValues.dueDate !== taskData.dueDate) {
        updatedActivities.push({
          type: 'dueDate',
          message: `You changed due date from ${formatDateForDisplay(previousValues.dueDate)} to ${formatDateForDisplay(taskData.dueDate)}`,
          timestamp,
          displayTime
        });
      }
      
      // Track category changes
      if (previousValues.category && previousValues.category !== taskData.category) {
        updatedActivities.push({
          type: 'category',
          message: `You changed category from ${previousValues.category} to ${taskData.category}`,
          timestamp,
          displayTime
        });
      }
      
      // Track status changes
      if (previousValues.status && previousValues.status !== taskData.status) {
        updatedActivities.push({
          type: 'status',
          message: `You changed status from ${previousValues.status.toLowerCase()} to ${taskData.status.toLowerCase()}`,
          timestamp,
          displayTime
        });
      }
      
      // Update task with new activities
      updateTask({
        ...taskData,
        activities: updatedActivities
      });
    } else {
      // For new tasks, add creation activity
      const now = new Date();
      const newActivities = [{
        type: 'created',
        message: 'You created this task',
        timestamp: now.toISOString(),
        displayTime: formatActivityDate(now)
      }];
      
      addTask({
        ...taskData,
        activities: newActivities
      });
    }
    onClose();
  };

  const handleAttachmentUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);

    // Add file upload activity if in edit mode
    if (mode === 'edit' && taskData.id) {
      const now = new Date();
      const newActivities = [...taskData.activities];
      
      files.forEach(file => {
        newActivities.push({
          type: 'file',
          message: 'You uploaded file',
          fileName: file.name,
          timestamp: now.toISOString(),
          displayTime: formatActivityDate(now)
        });
      });
      
      // Update the task data with new activities
      setTaskData({
        ...taskData,
        activities: newActivities
      });
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Sort activities by timestamp (newest first)
  const sortedActivities = taskData.activities && taskData.activities.length > 0 
    ? [...taskData.activities].sort((a, b) => 
        new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`task-modal ${mode === 'edit' ? 'task-modal-edit' : ''}`}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create Task' : 'Edit Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {mode === 'edit' ? (
          <div className="task-container">
            <div className="task-content">
              <div className="col-md-7 task-form">
                <div className="modal-body">
                  <div className="form-group">
                    <input
                      type="text"
                      name="title"
                      placeholder="Task title"
                      value={taskData.title}
                      onChange={handleChange}
                      className="task-title-input"
                    />
                  </div>

                  <div className="form-group description-group">
                    <div className="description-label">
                      <span className="description-icon">☰</span> Description
                    </div>
                    <div className="rich-text-toolbar">
                      <button className="toolbar-btn bold-btn">B</button>
                      <button className="toolbar-btn italic-btn">I</button>
                      <button className="toolbar-btn strikethrough-btn">S</button>
                      <span className="toolbar-divider"></span>
                      <button className="toolbar-btn list-btn">≡</button>
                      <button className="toolbar-btn numbered-list-btn">☰</button>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={taskData.description}
                      onChange={handleChange}
                      className="task-description-input"
                    />
                    <div className="character-count">{characterCount}/300 characters</div>
                  </div>

                  <div className="form-row">
                    <div className="form-group category-group">
                      <label>Task Category*</label>
                      <div className="category-options">
                        <label className={`category-option ${taskData.category === 'Work' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="category"
                            value="Work"
                            checked={taskData.category === 'Work'}
                            onChange={handleChange}
                          />
                          <span>Work</span>
                        </label>
                        <label className={`category-option ${taskData.category === 'Personal' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="category"
                            value="Personal"
                            checked={taskData.category === 'Personal'}
                            onChange={handleChange}
                          />
                          <span>Personal</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Due on*</label>
                      <div className="date-input-wrapper" onClick={handleDateInputClick}>
                        <input
                          ref={dateInputRef}
                          type="date"
                          name="dueDate"
                          value={taskData.dueDate}
                          onChange={handleChange}
                        />
                        <span className="calendar-icon">📅</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Task Status*</label>
                      <div className="status-select-wrapper">
                        <select
                          name="status"
                          value={taskData.status}
                          onChange={handleChange}
                        >
                          <option value="" disabled>Choose</option>
                          <option value="TO-DO">TO-DO</option>
                          <option value="IN-PROGRESS">IN-PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                        <span className="dropdown-icon">▼</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Attachment</label>
                    <div className="attachment-area">
                      <div className="upload-prompt">
                        Drop your files here to <button className="upload-link" onClick={handleAttachmentUpload}>Upload</button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {attachments.length > 0 && (
                        <div className="attachments-list">
                          {attachments.map((file, index) => (
                            <div key={index} className="attachment-item">
                              <span>{file.name}</span>
                              <button onClick={() => removeAttachment(index)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-5 activity-section">
                <div className="activity-header">Activity</div>
                <hr />
                <div className="activity-log">
                  {sortedActivities.length > 0 ? (
                    sortedActivities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="row activity-row">
                          <div className="col-md-6 activity-message">{activity.message}</div>
                          <div className="col-md-6 activity-time">{activity.displayTime}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">No activity recorded yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="modal-body">
              <div className="form-group">
                <input
                  type="text"
                  name="title"
                  placeholder="Task title"
                  value={taskData.title}
                  onChange={handleChange}
                  className="task-title-input"
                />
              </div>

              <div className="form-group description-group">
                <div className="description-label">
                  <span className="description-icon">☰</span> Description
                </div>
                <div className="rich-text-toolbar">
                  <button className="toolbar-btn bold-btn">B</button>
                  <button className="toolbar-btn italic-btn">I</button>
                  <button className="toolbar-btn strikethrough-btn">S</button>
                  <span className="toolbar-divider"></span>
                  <button className="toolbar-btn list-btn">≡</button>
                  <button className="toolbar-btn numbered-list-btn">☰</button>
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={taskData.description}
                  onChange={handleChange}
                  className="task-description-input"
                />
                <div className="character-count">{characterCount}/300 characters</div>
              </div>

              <div className="form-row">
                <div className="form-group category-group">
                  <label>Task Category*</label>
                  <div className="category-options">
                    <label className={`category-option ${taskData.category === 'Work' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="category"
                        value="Work"
                        checked={taskData.category === 'Work'}
                        onChange={handleChange}
                      />
                      <span>Work</span>
                    </label>
                    <label className={`category-option ${taskData.category === 'Personal' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="category"
                        value="Personal"
                        checked={taskData.category === 'Personal'}
                        onChange={handleChange}
                      />
                      <span>Personal</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Due on*</label>
                  <div className="date-input-wrapper" onClick={handleDateInputClick}>
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="dueDate"
                      value={taskData.dueDate}
                      onChange={handleChange}
                    />
                    <span className="calendar-icon">📅</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Task Status*</label>
                  <div className="status-select-wrapper">
                    <select
                      name="status"
                      value={taskData.status}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Choose</option>
                      <option value="TO-DO">TO-DO</option>
                      <option value="IN-PROGRESS">IN-PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                    <span className="dropdown-icon">▼</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Attachment</label>
                <div className="attachment-area">
                  <div className="upload-prompt">
                    Drop your files here to <button className="upload-link" onClick={handleAttachmentUpload}>Upload</button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {attachments.length > 0 && (
                    <div className="attachments-list">
                      {attachments.map((file, index) => (
                        <div key={index} className="attachment-item">
                          <span>{file.name}</span>
                          <button onClick={() => removeAttachment(index)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>CANCEL</button>
          <button className="create-btn" onClick={handleSubmit}>
            {mode === 'create' ? 'CREATE' : 'UPDATE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;