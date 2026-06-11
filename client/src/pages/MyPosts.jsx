import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCurrentUser } from '../UserContext.js';
import Post from '../components/Post.jsx';
import styles from './MyPosts.module.css';
import { useToast } from '../components/Toast.jsx';
import { useConfirmDialog } from '../components/ConfirmDialog.jsx';

export const loader = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return [];
    try {
        const res = await fetch(`http://localhost:3000/posts?userId=${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

function MyPosts() {
    const currentUser = useCurrentUser();
    const initialPosts = useLoaderData();
    const [posts, setPosts] = useState(initialPosts || []);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [newPost, setNewPost] = useState({ title: '', body: '' });
    const { showToast, ToastComponent } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    const handleDeletePost = async (postId) => {
        const ok = await confirm('Delete this post? This cannot be undone.');
        if (!ok) return;
        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id }),
            });
            if (!res.ok) throw new Error();
            setPosts(prev => prev.filter(post => post.id !== postId));
            showToast('Post deleted.');
        } catch {
            showToast('Failed to delete post.', 'error');
        }
    };

    const handleAddPost = async (e) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.body.trim()) return;
        try {
            const res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPost, userId: currentUser.id }),
            });
            if (!res.ok) throw new Error();
            const createdPost = await res.json();
            setPosts(prev => [...prev, createdPost]);
            setNewPost({ title: '', body: '' });
            showToast('Post published!');
        } catch {
            showToast('Failed to publish post.', 'error');
        }
    };

    const handleUpdatePost = async (postId, updatedPost) => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedPost, userId: currentUser.id }),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setPosts(prev => prev.map(post => post.id === postId ? updated : post));
            showToast('Post updated.');
        } catch {
            showToast('Failed to update post.', 'error');
        }
    };

    return (
        <>
            {ToastComponent}
            {ConfirmDialogComponent}
            <div className={styles.createPost}>
                <form onSubmit={handleAddPost} className={styles.createForm}>
                    <input
                        className={styles.createTitle}
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Title"
                    />
                    <textarea
                        className={styles.createBody}
                        value={newPost.body}
                        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                        placeholder="What's on your mind?"
                    />
                    <button
                        type="submit"
                        className={styles.createButton}
                        disabled={!newPost.title.trim() || !newPost.body.trim()}
                    >
                        Post
                    </button>
                </form>
            </div>
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
        </>
    );
}

export default MyPosts;
