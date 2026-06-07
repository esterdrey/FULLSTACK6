import { useState, useEffect } from 'react';
import {  useLoaderData } from 'react-router-dom';
import { useCurrentUser } from '../UserContext';
import Post from '../components/Post.jsx';
import styles from './Posts.module.css';
export const loader= async ({params})=>{
    try{
        const res= await fetch(`http://localhost:3000/posts?userId=${params.userId}`);
        if(!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }

}


function Posts(){
    const currentUser=useCurrentUser();
    const initialPosts = useLoaderData();
    const [posts, setPosts] = useState(initialPosts || []);
    const user=useCurrentUser();

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newPost, setNewPost] = useState({title:'', body:''});


  const handleDeletePost = async (postId) => {
    try{
        await fetch(`http://localhost:3000/posts/${postId}`, { method: 'DELETE',
            body:JSON.stringify({userId:currentUser.id})}
        );
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
        console.error('Error deleting post:', error);
    }
  }

  const handleAddPost = async (e) => {
    e.preventDefault();
    try{
        const res=await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });
        const createdPost = await res.json();
        setPosts(prevPosts => [...prevPosts, createdPost]);
        // Update the posts list with the new post
    } catch (error) {
        console.error('Error adding post:', error);
    }

  }

  const handleUpdatePost = async (postId, updatedPost) => {
    try{
        const res=await fetch(`http://localhost:3000/posts/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ...updatedPost, 
                userId: currentUser.id 
            })
        });
        const updated = await res.json();
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updated : post));
    } catch (error) {
        console.error('Error updating post:', error);
    }

  }


    return (
    <div className={styles['posts-container']}>
      {posts?.map(post => (
        <Post key={post.id} 
        post={post} 
        isExpanded={expandedPostId === post.id} 
        onToggleExpand={setExpandedPostId}
        onDelete={handleDeletePost}
        onUpdate={handleUpdatePost}
         />
      ))}
    </div>
   
  );



}

export default Posts;