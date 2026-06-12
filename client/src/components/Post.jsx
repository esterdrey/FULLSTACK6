import styles from './Post.module.css';
import { useState } from 'react';
import Comments from './PostComments';
import { useCurrentUser } from '../UserContext';

function Post({ post, isExpanded, onToggleExpand, onDelete, onUpdate }) {
  const currentUser = useCurrentUser();
  const isOwner = currentUser?.id === post.userId;
  const isAdmin = !!currentUser?.isAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    body: post.body
  });

  const [comments, setComments] = useState(post.comments || []);

  const toggleExpand = (e) => {
    e.stopPropagation();

    if (isExpanded) {
      onToggleExpand(null);
    } else {
      onToggleExpand(post.id);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onUpdate(post.id, editedPost);
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditedPost({ title: post.title, body: post.body });
    setIsEditing(false);
  };

  return (
    <div className={styles.card}>
      {isEditing ? (
        <div className={styles.editForm} onClick={(e) => e.stopPropagation()}>
          <input
            className={styles.editTitle}
            type="text"
            value={editedPost.title}
            onChange={(e) =>
              setEditedPost({ ...editedPost, title: e.target.value })
            }
            placeholder="Title"
          />

          <textarea
            className={styles.editBody}
            value={editedPost.body}
            onChange={(e) =>
              setEditedPost({ ...editedPost, body: e.target.value })
            }
            placeholder="Write something..."
          />

          <div className={styles.actions}>
            <button className={styles.save} onClick={handleSave}>
              Save
            </button>
            <button className={styles.muted} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.author}>
            <span className={styles.authorName}>{post.username}</span>
            <span className={styles.authorEmail}>{post.email}</span>
          </div>

          <h2 className={styles.title}>{post.title}</h2>
          <p className={styles.body}>{post.body}</p>

          <div className={styles.footer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.actions}>
              {isOwner && onUpdate && (
                <button
                  className={styles.actionBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}

              {(isOwner || isAdmin) && onDelete && (
                <button
                  className={styles.danger}
                  onClick={() => onDelete(post.id)}
                >
                  Delete
                </button>
              )}
            </div>

            <span className={styles.commentsHint} onClick={toggleExpand}>
              {isExpanded ? 'Hide comments' : 'View comments'}
            </span>
          </div>
        </>
      )}

      {isExpanded && !isEditing && (
        <Comments
          postId={post.id}
          comments={comments}
          setComments={setComments}
        />
      )}
    </div>
  );
}

export default Post;