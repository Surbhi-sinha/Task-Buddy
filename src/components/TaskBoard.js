import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../services/firebase";
import { useAuth } from '../context/AuthContext';
import TaskModal from './TaskModal';
import { useTasks } from '../context/TaskContext';
import '../styles/TaskBoard.css';

const TaskBoard = () => {
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

  const [newTask, setNewTask] = useState({ title: '', dueDate: '', status: 'TO-DO', category: 'WORK' });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user, logout } = useAuth();
  const [draggedTask, setDraggedTask] = useState(null);
  const navigate = useNavigate();
  const dropdownRefs = useRef({});
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
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = (id) => {
    deleteTask(id);
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

  const handleUpdateTask = () => {
    updateTask(editingTask);
    setEditingTask(null);
  };

  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedTask(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedTask && draggedTask.status !== status) {
      changeTaskStatus(draggedTask.id, status);
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
    <div className="task-board-container">
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
        <Link to="/tasklist">List</Link>
        <Link to="/taskboard" className="active">Board</Link>
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
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <path
                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 14L11.1 11.1"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="    Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-task-btn" onClick={openCreateModal}>ADD TASK</button>
        </div>
      </div>

      <div className="board-columns">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <div
            key={status}
            className={`board-column ${status.toLowerCase()}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <h3 className={`status-label ${status.toLowerCase()}`}>{status}</h3>
            </div>
            <div className="column-content">
              {statusTasks.length > 0 ? (
                statusTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-card"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="task-card-header">
                      <h4 className="task-title">{task.title}</h4>
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
                    <div className="task-card-content">
                      <div className={`task-category ${task.category.toLowerCase()}`}>
                        {task.category}
                      </div>
                      <div className="task-due-date">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tasks-message">
                  No Tasks in {status.replace('-', ' ').toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="TO-DO">TO-DO</option>
                <option value="IN-PROGRESS">IN-PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
              <button className="add-btn" onClick={handleAddTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={editingTask.dueDate}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
              >
                <option value="TO-DO">TO-DO</option>
                <option value="IN-PROGRESS">IN-PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={editingTask.category}
                onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>
              <button className="update-btn" onClick={handleUpdateTask}>Update Task</button>
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

export default TaskBoard;