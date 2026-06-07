import { useState, useEffect } from 'react';
import styles from './PostComments.module.css';
import { useCurrentUser } from '../UserContext';

const API = 'http://localhost:3000/comments';
const initial = (s) => (s || '?').trim().charAt(0).toUpperCase();

function PostComments({ postId ,comments,setComments}) {
  const currentUser = useCurrentUser();
  const [newComment, setNewComment] = useState({ title: '', body: '' });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState({ title: '', body: '' });



  const handleAddComment = async (e) => {
    e.preventDefault();
    const body = newComment.body.trim();
    const title=newComment.title.trim();
    if (!body || !currentUser|| !title) return;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          title,
          body,
        }),
      });
      if (!res.ok) return console.error('Server rejected the comment');
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment({ title: '', body: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API}/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUpdate = async (id) => {
    const body = editText.body.trim();
    if (!body) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, title: editText.title.trim(), body }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: editText.title.trim(), body } : c))
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  return (
    <div className={styles.comments} onClick={(e) => e.stopPropagation()}>
      <p className={styles.heading}>Comments</p>

      <div className={styles.list}>
  {comments === null ? (
    <p className={styles.empty}>Loading comments...</p>
  ) : comments.length === 0 ? (
    <p className={styles.empty}>No comments yet. Be the first.</p>
  ) : (
    comments.map((comment) => {
      const isOwner = currentUser?.id === comment.userId;
      const name = comment.username || 'Unknown';
      return (
        <div key={comment.id} className={styles.comment}>
          <div className={styles.avatar}>{initial(name)}</div>
          <div className={styles.bubble}>
            {editingId === comment.id ? (
              <div className={styles.editRow}>
                <input
                  className={styles.editInput}
                  value={editText.title}
                  onChange={(e) => setEditText({ ...editText, title: e.target.value })}
                  placeholder="Title"
                />
                <input
                  className={styles.editInput}
                  value={editText.body}
                  onChange={(e) => setEditText({ ...editText, body: e.target.value })}
                  placeholder="Comment"
                  autoFocus
                />
                <div className={styles.editButtons}>
                  <button className={styles.save} onClick={() => handleUpdate(comment.id)}>Save</button>
                  <button className={styles.muted} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.author}>{name}</p>
                {comment.title && <p className={styles.commentTitle}>{comment.title}</p>}
                <p className={styles.text}>{comment.body}</p>
                <div className={styles.meta}>
                  {comment.email && <span className={styles.email}>{comment.email}</span>}
                  {isOwner && (
                    <>
                      <button
                        className={styles.metaBtn}
                        onClick={() => { setEditingId(comment.id); setEditText({ title: comment.title || '', body: comment.body }); }}
                      >
                        Edit
                      </button>
                      <button className={styles.metaBtn} onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      );
    })
  )}
     </div>

      {currentUser && (
        <form onSubmit={handleAddComment} className={styles.composer}>
          <div className={styles.avatarSmall}>{initial(currentUser.username || currentUser.email)}</div>
          <div className={styles.composerFields}>
            <input
              className={styles.titleInput}
              value={newComment.title}
              onChange={(e) => setNewComment({ ...newComment, title: e.target.value })}
              placeholder="Title"
            />
            <div className={styles.composerRow}>
              <input
                className={styles.composerInput}
                value={newComment.body}
                onChange={(e) => setNewComment({ ...newComment, body: e.target.value })}
                placeholder="Add a comment..."
              />
              <button type="submit" className={styles.postBtn}  disabled={!newComment.body.trim() || !newComment.title.trim()}>
                Post
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default PostComments;