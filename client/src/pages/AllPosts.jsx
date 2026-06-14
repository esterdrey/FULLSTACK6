import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCurrentUser } from '../UserContext.js';
import Post from '../components/Post.jsx';
import styles from './MyPosts.module.css';
import { useToast } from '../components/Toast.jsx';
import { useConfirmDialog } from '../components/ConfirmDialog.jsx';

const PAGE_SIZE = 10;

export const loader = async () => {
    const res = await fetch(
        `http://localhost:3000/posts?includeComments=true&limit=${PAGE_SIZE}&offset=0`
    );
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
};

function AllPosts() {
    const initialPosts = useLoaderData();
    const currentUser = useCurrentUser();
    const [posts, setPosts] = useState(initialPosts || []);
    const [offset, setOffset] = useState(initialPosts?.length ?? 0);
    const [hasMore, setHasMore] = useState((initialPosts?.length ?? 0) === PAGE_SIZE);
    const [searchInput, setSearchInput] = useState('');
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast, ToastComponent } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    const filtered = useMemo(() => {
        const q = searchInput.trim().toLowerCase();
        if (!q) return posts;
        return posts.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q)
        );
    }, [posts, searchInput]);

    const loadMore = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                includeComments: 'true',
                limit: PAGE_SIZE,
                offset,
            });
            const res = await fetch(`http://localhost:3000/posts?${params}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPosts(prev => [...prev, ...data]);
            setOffset(prev => prev + data.length);
            setHasMore(data.length === PAGE_SIZE);
        } catch {
            showToast('Failed to load more posts.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePost = async (postId, updatedPost) => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedPost, userId: currentUser.id }),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setPosts(prev =>
                prev.map(p => p.id === postId ? { ...p, ...updated, comments: p.comments || [] } : p)
            );
            showToast('Post updated.');
        } catch {
            showToast('Failed to update post.', 'error');
        }
    };

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
            setPosts(prev => prev.filter(p => p.id !== postId));
            showToast('Post deleted.');
        } catch {
            showToast('Failed to delete post.', 'error');
        }
    };

    return (
        <>
            {ToastComponent}
            {ConfirmDialogComponent}

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search posts..."
                />
                {searchInput && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => setSearchInput('')}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className={styles['posts-container']}>
                {filtered.map(post => (
                    <Post key={post.id}
                        post={post}
                        isExpanded={expandedPostId === post.id}
                        onToggleExpand={setExpandedPostId}
                        onDelete={handleDeletePost}
                        onUpdate={handleUpdatePost}
                    />
                ))}
                {filtered.length === 0 && (
                    <p className={styles.noResults}>No posts found.</p>
                )}
            </div>

            {hasMore && !searchInput && (
                <div className={styles.loadMoreWrap}>
                    <button
                        className={styles.loadMoreBtn}
                        onClick={loadMore}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            )}
        </>
    );
}

export default AllPosts;
