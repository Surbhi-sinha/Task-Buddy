import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
// import CreateTask from './components/TaskForm';
import ProtectedRoute from './components/ProtectedRoute';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <TaskProvider>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/tasklist' element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } />
          <Route path='/taskboard' element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          } />
          {/* <Route path='/createtask' element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          } /> */}
        </Routes>
        </TaskProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
