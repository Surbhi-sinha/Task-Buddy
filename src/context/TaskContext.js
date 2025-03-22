import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const TaskContext = createContext();

// Create a provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');

  // Load initial data
  useEffect(() => {
    const mockTasks = [
      { id: 1, title: 'Interview with Design Team', dueDate: '2024-12-19', status: 'TO-DO', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 10 at 9:30 am' }] },
      { id: 2, title: 'Team Meeting', dueDate: '2024-12-30', status: 'TO-DO', category: 'Personal', activities: [{ message: 'You created this task', displayTime: 'Dec 11 at 10:15 am' }] },
      { id: 3, title: 'Design a Dashboard page along with wireframes', dueDate: '2024-12-31', status: 'TO-DO', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 12 at 2:45 pm' }] },
      { id: 4, title: 'Morning Workout', dueDate: '2024-12-19', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 13 at 8:00 am' }] },
      { id: 5, title: 'Code Review', dueDate: '2024-12-19', status: 'IN-PROGRESS', category: 'Personal', activities: [{ message: 'You created this task', displayTime: 'Dec 14 at 11:20 am' }] },
      { id: 6, title: 'Update Task Tracker', dueDate: '2024-12-25', status: 'COMPLETED', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 15 at 3:10 pm' }] },
      { id: 7, title: 'Develop Login Authentication', dueDate: '2024-12-22', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 16 at 9:45 am' }] },
      { id: 8, title: 'Create Marketing Campaign Plan', dueDate: '2024-12-18', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 17 at 1:30 pm' }] },
      { id: 9, title: 'Test API Integration', dueDate: '2024-12-12', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 18 at 4:20 pm' }] },
      { id: 10, title: 'Update Documentation for Release', dueDate: '2024-12-10', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 19 at 10:05 am' }] },
      { id: 11, title: 'Resolve Bugs in Payment Gateway', dueDate: '2024-12-02', status: 'IN-PROGRESS', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 20 at 2:15 pm' }] },
      { id: 12, title: 'Submit Project Proposal', dueDate: '2024-12-19', status: 'COMPLETED', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 21 at 11:40 am' }] },
      { id: 13, title: 'Birthday Gift Shopping', dueDate: '2024-12-19', status: 'COMPLETED', category: 'Personal', activities: [{ message: 'You created this task', displayTime: 'Dec 22 at 5:30 pm' }] },
      { id: 14, title: 'Client Presentation', dueDate: '2024-12-25', status: 'COMPLETED', category: 'Work', activities: [{ message: 'You created this task', displayTime: 'Dec 23 at 9:15 am' }] },
    ];
    setTasks(mockTasks);
  }, []);

  // Format date for activity logs
  const formatActivityDate = (date = new Date()) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    
    return `${month} ${day} at ${hours}:${minutes} ${ampm}`;
  };


// Add a new task with activity tracking
const addTask = (newTask) => {
  const now = new Date();
  
  // Ensure activities array exists and has creation activity
  const activities = newTask.activities || [{
    type: 'created',
    message: 'You created this task',
    timestamp: now.toISOString(),
    displayTime: formatActivityDate(now)
  }];
  
  const task = {
    id: Date.now(),
    title: newTask.title,
    description: newTask.description || '',
    dueDate: newTask.dueDate || '',
    status: newTask.status || 'TO-DO',
    category: newTask.category || 'Work',
    createdAt: now.toISOString(),
    activities: activities
  };
  
  setTasks([...tasks, task]);
  return task;
};

// Update task with activity tracking
const updateTask = (updatedTask) => {
  setTasks(tasks.map(task => 
    task.id === updatedTask.id ? {
      ...task,
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.dueDate,
      status: updatedTask.status,
      category: updatedTask.category,
      updatedAt: new Date().toISOString(),
      activities: updatedTask.activities || task.activities || []
    } : task
  ));
};
  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Change task status with activity tracking
  const changeTaskStatus = (taskId, newStatus) => {
    const now = new Date();
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newActivities = [...(task.activities || [])];
        
        // Add status change activity
        if (task.status !== newStatus) {
          newActivities.push({
            type: 'status',
            message: `You changed status from ${task.status.toLowerCase()} to ${newStatus.toLowerCase()}`,
            timestamp: now.toISOString(),
            displayTime: formatActivityDate(now)
          });
        }
        
        return { 
          ...task, 
          status: newStatus,
          updatedAt: now.toISOString(),
          activities: newActivities
        };
      }
      return task;
    }));
  };

  // Add file upload activity
  const addFileActivity = (taskId, fileName = '') => {
    const now = new Date();
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newActivities = [...(task.activities || [])];
        
        newActivities.push({
          type: 'file',
          message: 'You uploaded file',
          fileName: fileName,
          timestamp: now.toISOString(),
          displayTime: formatActivityDate(now)
        });
        
        return {
          ...task,
          updatedAt: now.toISOString(),
          activities: newActivities
        };
      }
      return task;
    }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? task.category === filterCategory : true;
    
    let matchesDueDate = true;
    if (filterDueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterDueDate === 'Today') {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        matchesDueDate = taskDate.getTime() === today.getTime();
      } else if (filterDueDate === 'This Week') {
        const taskDate = new Date(task.dueDate);
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        matchesDueDate = taskDate >= startOfWeek && taskDate <= endOfWeek;
      } else if (filterDueDate === 'This Month') {
        const taskDate = new Date(task.dueDate);
        matchesDueDate = 
          taskDate.getMonth() === today.getMonth() && 
          taskDate.getFullYear() === today.getFullYear();
      }
    }
    
    return matchesSearch && matchesCategory && matchesDueDate;
  });

  // Group tasks by status
  const groupedTasks = {
    'TO-DO': filteredTasks.filter(task => task.status === 'TO-DO'),
    'IN-PROGRESS': filteredTasks.filter(task => task.status === 'IN-PROGRESS'),
    'COMPLETED': filteredTasks.filter(task => task.status === 'COMPLETED')
  };

  // Get a task by ID
  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId) || null;
  };

  return (
    <TaskContext.Provider value={{
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
      changeTaskStatus,
      addFileActivity,
      getTaskById
    }}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};