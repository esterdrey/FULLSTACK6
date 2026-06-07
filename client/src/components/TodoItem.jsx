import { useState } from "react";
import styles from './TodoItem.module.css';
function TodoItem({key,todo,isEditing,onStartEditing,onCancelEdit,onSave,onToggle,onDelete}){

    const [draft,setDraft]=useState(todo.title);
    const startEdit=()=>{
        setDraft(todo.title);
        onStartEditing(todo.id)
    }
    const save=()=>{
        const title=draft.trim();
        if(!title)return;
        onSave({...todo,title});
    }

   return (
     <div className={styles.todoContainer}>
        <input type={"checkbox"} 
         className={styles.checkbox} 
         checked={!!todo.completed} 
         onChange={()=>onToggle(todo)} 
         disabled={isEditing}></input>


        {
            isEditing? (
            <>
                <input className={styles.titleInput} value={draft}  onChange={(e)=>setDraft(e.target.value)} autoFocus/>
                <div className={styles.actions}>
                    <button className={styles.save} onClick={save}>Save</button>
                    <button className={styles.muted} onClick={onCancelEdit}>Cancel</button>
                </div>
            </>):(
                <>
                <p className={`${styles.todoTitle} ${todo.completed ? styles.completed : ''}`}>{todo.title}</p>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={startEdit}>Edit</button>
                    <button className={styles.danger} onClick={()=>onDelete(todo.id)}>Delete</button>
                </div>
                </>

            )
        }
      

   
     </div>
   )
}

export default TodoItem;