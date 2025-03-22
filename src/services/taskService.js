import {db} from "./firebase";
import { collection , addDoc , getDocs , updateDoc , deleteDoc , doc , query , orderBy } from "firebase/firestore";

//reference tpo task collection
const taskCollection = collection(db , "tasks");

// add a new task
export const addTask = async(task) =>{
   return await addDoc(taskCollection , task);
};

//Get all tasks
export const getTasks = async()=>{
   const q = query(taskCollection,orderBy("createdAt" , "asc"));
   const snapshot = await getDocs(q);
   return snapshot.docs.map((doc)=>({id : doc.id , ...doc.data()}));
}

//update a task
export const updateTask = async(id , updatedTask) =>{
   const taskDoc = doc(db , "tasks" , id);
   return await updateDoc(taskDoc , updateTask);
}

//delete a task
export const deleteTask = async(id) =>{
   const taskDoc = doc(db , "tasks" , id);
   return await deleteDoc(taskDoc);
}