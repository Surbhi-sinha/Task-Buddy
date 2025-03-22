import React from 'react';
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';

const Login = () => {
   const navigate = useNavigate();

   const handleGoogleSignIn = async () => {
      try {
         var res = await signInWithPopup(auth, googleProvider);
         console.log(res);
         navigate("/tasklist");
      } catch (error) {
         console.error("Error Signing in : ", error);
      }
   }

   return (
      <div className="login-page">
         <div className="login-container">
            <div className="login-content">
               <div className="login-logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                     <line x1="16" y1="2" x2="16" y2="6"></line>
                     <line x1="8" y1="2" x2="8" y2="6"></line>
                     <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <h1>TaskBuddy</h1>
               </div>
               <p className="login-description">
                  Streamline your workflow and track progress effortlessly with our all-in-one task management app.
               </p>
               <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                  <svg className="google-icon" width="20" height="20" viewBox="0 0 48 48">
                     <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                     <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                     <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                     <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
               </button>
            </div>
            <div className="login-preview">
               <div className="preview-app">
                  <div className="app-header">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                     </svg>
                     <span>TaskBuddy</span>
                  </div>
                  <div className="app-tabs">
                     <div className="tab active">List</div>
                     <div className="tab">Board</div>
                  </div>
                  <div className="app-filters">
                     <div className="filter">
                        <span>Filter by:</span>
                        <div className="filter-dropdown">Category</div>
                        <div className="filter-dropdown">Due Date</div>
                     </div>
                  </div>
                  <div className="task-headers">
                     <div className="task-name-header">Task name</div>
                     <div className="due-on-header">Due on</div>
                     <div className="task-status-header">Task Status</div>
                  </div>
                  <div className="task-group todo">
                     <div className="group-header">
                        <span>Todo (3)</span>
                        <button className="add-task-btn">+ ADD TASK</button>
                     </div>
                     <div className="task-item">
                        <div className="task-checkbox"></div>
                        <div className="task-title">Interview with Design Team</div>
                        <div className="task-due">Today</div>
                        <div className="task-status">TO-DO</div>
                     </div>
                     <div className="task-item">
                        <div className="task-checkbox"></div>
                        <div className="task-title">Team Meeting</div>
                        <div className="task-due">30 Dec, 2024</div>
                        <div className="task-status">TO-DO</div>
                     </div>
                     <div className="task-item">
                        <div className="task-checkbox"></div>
                        <div className="task-title">Design a Dashboard page along with wireframes</div>
                        <div className="task-due">31 Dec, 2024</div>
                        <div className="task-status">TO-DO</div>
                     </div>
                  </div>
                  <div className="task-group in-progress">
                     <div className="group-header">
                        <span>In-Progress (3)</span>
                     </div>
                     <div className="task-item">
                        <div className="task-checkbox"></div>
                        <div className="task-title">Morning Workout</div>
                        <div className="task-due">Today</div>
                        <div className="task-status">IN-PROGRESS</div>
                     </div>
                  </div>
                  <div className="task-group completed">
                     <div className="group-header">
                        <span>Completed (3)</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Login;