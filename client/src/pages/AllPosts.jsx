import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useCurrentUser } from '../UserContext.js';
import Post from '../components/Post.jsx';
import styles from './MyPosts.module.css';
import { useToast } from '../components/Toast.jsx';
import { useConfirmDialog } from '../components/ConfirmDialog.jsx';

const PAGE_SIZE = 10;

export const loader = async () => {
    try {
        const res = await fetch(
            `http://localhost:3000/posts?includeComments=true`
        );

        if (!res.ok) throw new Error('Failed to fetch posts');

        return res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

function AllPosts() {
    const allPosts = useLoaderData();
    const currentUser = useCurrentUser();
    const [posts, setPosts] = useState(allPosts || []);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setVisibleCount(PAGE_SIZE);
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

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;

    return (
        <>
            {ToastComponent}
            {ConfirmDialogComponent}

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search posts..."
                />
                {searchInput && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => { setSearchInput(''); setVisibleCount(PAGE_SIZE); }}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className={styles['posts-container']}>
                {visible.map(post => (
                    <Post key={post.id}
                        post={post}
                        isExpanded={expandedPostId === post.id}
                        onToggleExpand={setExpandedPostId}
                        onDelete={handleDeletePost}
                    />
                ))}
                {filtered.length === 0 && (
                    <p className={styles.noResults}>No posts found.</p>
                )}
            </div>

            {hasMore && (
                <div className={styles.loadMoreWrap}>
                    <button
                        className={styles.loadMoreBtn}
                        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                    >
                        Load more ({filtered.length - visibleCount} remaining)
                    </button>
                </div>
            )}
        </>
    );
}

export default AllPosts;
