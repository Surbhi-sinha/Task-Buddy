import React, {createContext , useContext , useState ,useEffect, Children} from "react";
import {auth} from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

// managing the authentication state
export const AuthProvider = ({children}) =>{
   const [user , setUser]  = useState(null);

   useEffect(()=>{
      const unsubscribe = onAuthStateChanged(auth, (currentUser) =>{
         setUser(currentUser);
      });

      return () =>unsubscribe();
   },[]);
   

   const logout= async() =>{
      await signOut(auth);
   }

   return(
      <AuthContext.Provider value={{user, logout}}>
         {children}
      </AuthContext.Provider>
   )
};


export const useAuth = () => useContext(AuthContext);