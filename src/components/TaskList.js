import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../services/firebase";
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import TaskModal from './TaskModal';
import '../styles/TaskList.css';

const TaskList = () => {
  // Use the shared context
  const {
    tasks,
    filteredTasks,
    groupedTasks,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterDueDate,
    setFilterDueDate,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus
  } = useTasks();
  const { user, logout } = useAuth();
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', status: 'TO-DO', category: 'WORK' });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  // const [user, setUser] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({
    'TO-DO': false,
    'IN-PROGRESS': false,
    'COMPLETED': false
  });
  const navigate = useNavigate();
  const dropdownRefs = useRef({});
  const taskItemsRef = useRef({});
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTask, setSelectedTask] = useState(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(id => {
        if (dropdownRefs.current[id] && !dropdownRefs.current[id].contains(event.target)) {
          // Close the dropdown
          const taskElement = document.getElementById(`dropdown-${id}`);
          if (taskElement) {
            taskElement.classList.remove('show');
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddTask = () => {
    if (newTask.title.trim() === '') return;

    addTask(newTask);
    setNewTask({ title: '', dueDate: '', status: 'TO-DO', category: 'WORK' });
    setIsAddingTask(false);
  };

  // Function to open create task modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setModalOpen(true);
  };
  
  // Function to open edit task modal
  const openEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setModalOpen(true);
  };
  
  // Replace your existing handleEditTask function
  const handleEditTask = (task) => {
    openEditModal(task);
  };
  const handleDeleteTask = (id) => {
    deleteTask(id);
  };

  // const handleEditTask = (task) => {
  //   setEditingTask(task);
  // };

  const handleUpdateTask = () => {
    updateTask(editingTask);
    setEditingTask(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    changeTaskStatus(taskId, newStatus);
  };

  const handleCategoryChange = (taskId, newCategory) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      updateTask({ ...taskToUpdate, category: newCategory });
    }
  };

  const handleDueDateChange = (taskId, newDueDate) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      updateTask({ ...taskToUpdate, dueDate: newDueDate });
    }
  };

  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  };

  const handleTaskSelection = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    selectedTasks.forEach(taskId => {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (taskToUpdate) {
        updateTask({ ...taskToUpdate, status: newStatus });
      }
    });
    setBulkActionOpen(false);
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach(taskId => {
      deleteTask(taskId);
    });
    setSelectedTasks([]);
    setBulkActionOpen(false);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const toggleSectionCollapse = (status) => {
    setCollapsedSections({
      ...collapsedSections,
      [status]: !collapsedSections[status]
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.currentTarget.classList.add('dragging');
    // Store the task ID in the dataTransfer object
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedTask && draggedTask.id !== targetTask.id) {
      // This is just for visual reordering - in a real app you'd update order in the database
      // For now we'll just update the status if it's different
      if (draggedTask.status !== targetTask.status) {
        changeTaskStatus(draggedTask.id, targetTask.status);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  return (
    <div className="task-list-container">
      <header className="header">
        <div className="logo">
          <span className="icon">📋</span> TaskBuddy
        </div>
        <div className="user-info">
          {user && (
            <>
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              <span>{user.displayName}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </header>

      <div className="view-toggle">
        <Link to="/tasklist" className="active">List</Link>
        <Link to="/taskboard">Board</Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          <span>Filter by:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Category</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
          <select
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className="filter-select"
          >
            <option value="">Due Date</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
        <div className="search-add">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-task-btn" onClick={openCreateModal}>ADD TASK</button>
        </div>
      </div>

      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedTasks.length} Tasks Selected</span>
          <div className="bulk-actions-buttons">
            <button onClick={() => setBulkActionOpen(!bulkActionOpen)}>Status</button>
            <button onClick={handleBulkDelete} className="delete-btn">Delete</button>
            {bulkActionOpen && (
              <div className="bulk-status-dropdown">
                <button onClick={() => handleBulkStatusChange('TO-DO')}>TO-DO</button>
                <button onClick={() => handleBulkStatusChange('IN-PROGRESS')}>IN-PROGRESS</button>
                <button onClick={() => handleBulkStatusChange('COMPLETED')}>COMPLETED</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="task-list">
        <div className="task-header">
          <div className="checkbox-col"></div>
          <div className="task-name-col">Task name</div>
          <div className="due-date-col">Due on</div>
          <div className="task-status-col">Task Status</div>
          <div className="task-category-col">Task Category</div>
          <div className="actions-col"></div>
        </div>

        {['TO-DO', 'IN-PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className={`task-group ${status.toLowerCase()}`}>
            <div className="group-header" onClick={() => toggleSectionCollapse(status)}>
              <h3>{status} ({groupedTasks[status]?.length || 0})</h3>
              <button className="collapse-btn">
                {collapsedSections[status] ? '▼' : '▲'}
              </button>
            </div>

            {!collapsedSections[status] && (
              <div className="task-group-content">
                {status === 'TO-DO' && !isAddingTask && (
                  <button className="add-task-inline" onClick={openCreateModal}>
                    + ADD TASK
                  </button>
                )}

                {status === 'TO-DO' && isAddingTask && (
                  <div className="add-task-form">
                    <input
                      type="text"
                      placeholder="Task Title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="task-title-input"
                    />
                    <input
                      type="date"
                      placeholder="Add date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="task-date-input"
                    />
                    <div className="task-status-select">
                      <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      >
                        <option value="TO-DO">TO-DO</option>
                        <option value="IN-PROGRESS">IN-PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                    <div className="task-category-select">
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      >
                        <option value="Work">WORK</option>
                        <option value="Personal">PERSONAL</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button className="add-btn" onClick={handleAddTask}>ADD</button>
                      <button className="cancel-btn" onClick={() => setIsAddingTask(false)}>CANCEL</button>
                    </div>
                  </div>
                )}

                {groupedTasks[status]?.length > 0 ? (
                  <div className="task-items-container">
                    {groupedTasks[status].map(task => (
                      <div
                        key={task.id}
                        className="task-item"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, task)}
                        ref={el => taskItemsRef.current[task.id] = el}
                      >
                        <div className="checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleTaskSelection(task.id)}
                            className="task-checkbox"
                          />
                        </div>
                        <div className="task-name-col">
                          <div className="task-circle"></div>
                          {task.title}
                        </div>
                        <div className="due-date-col">
                          {formatDate(task.dueDate)}
                        </div>
                        <div className="task-status-col">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`status-dropdown ${task.status.toLowerCase()}`}
                          >
                            <option value="TO-DO">TO-DO</option>
                            <option value="IN-PROGRESS">IN-PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>
                        <div className="task-category-col">
                          {task.category}
                        </div>
                        <div className="actions-col">
                          <button
                            className="more-btn"
                            onClick={() => toggleDropdown(task.id)}
                          >...</button>
                          <div
                            id={`dropdown-${task.id}`}
                            className="dropdown"
                            ref={el => dropdownRefs.current[task.id] = el}
                          >
                            <button className="edit-btn" onClick={() => handleEditTask(task)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-tasks-message">
                    No Tasks in {status}
                  </div>
                )}

                {status === 'IN-PROGRESS' && groupedTasks[status]?.length > 5 && (
                  <div className="load-more">
                    <button className="load-more-btn">Load more</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingTask && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="edit-task-title"
            />
            <input
              type="date"
              value={editingTask.dueDate}
              onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
              className="edit-task-date"
            />
            <select
              value={editingTask.status}
              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
              className="edit-task-status"
            >
              <option value="TO-DO">TO-DO</option>
              <option value="IN-PROGRESS">IN-PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <select
              value={editingTask.category}
              onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
              className="edit-task-category"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
            <div className="modal-actions">
              <button className="update-btn" onClick={handleUpdateTask}>Update</button>
              <button className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <TaskModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  );
};

export default TaskList;