import { useState } from "react";
import { useCurrentUser } from "../UserContext";
import { useLoaderData } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./Albums.module.css";

export const loader = async ({ params }) => {
    const res = await fetch(`http://localhost:3000/albums?username=${params.username}`);
    if (!res.ok) throw new Error("Failed to load albums");
    return res.json();
};

function Albums() {
    const currentUser = useCurrentUser();
    const initialAlbums = useLoaderData();
    const [albums, setAlbums] = useState(initialAlbums || []);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [newAlbumTitle, setNewAlbumTitle] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    const handleDeleteAlbum = async (albumId) => {
        try {
            await fetch(`http://localhost:3000/albums/${albumId}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ userId: currentUser.id })
            });
            setAlbums(prev => prev.filter((album) => album.id !== albumId)); 
        }
        catch (error) {
            console.error('Error deleting album:', error);
        }
    };

    const handleUpdateAlbum = async (albumId) => {
        try {
            const res = await fetch(`http://localhost:3000/albums/${albumId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, title: editTitle })
            });
            const updated = await res.json();
            setAlbums(prev => prev.map(album => album.id === albumId ? { ...album, ...updated } : album));
            setEditingId(null); // Fixed: Safely close edit mode after state updates
        }
        catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const startEditing = (albumId, albumTitle) => {
        setEditingId(albumId);
        setEditTitle(albumTitle);
    };

    const handleAddAlbum = async (e) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) return;
        try {
            const res = await fetch(`http://localhost:3000/albums`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, title: newAlbumTitle })
            });
            if (!res.ok) throw new Error('Failed to add album');
            const createdAlbum = await res.json();
            setAlbums(prev => [...prev, createdAlbum]);
            setNewAlbumTitle("");
            setShowAddForm(false);
        }
        catch (error) {
            console.error('Error adding album:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2>My Albums</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className={styles.addAlbumBtn}>
                {showAddForm ? "Cancel" : "Add New Album"}
            </button>

            <div className={styles.albumGrid}>
                {showAddForm && (
                    <div className={`${styles.albumCard} ${styles.formCard}`}>
                        <form onSubmit={handleAddAlbum} className={styles.inlineForm}>
                            <div className={styles.albumFormContent}>
                                <div className={styles.folderIcon}>📁</div>
                                <input 
                                    type="text" 
                                    placeholder="Album title..." 
                                    value={newAlbumTitle} 
                                    onChange={(e) => setNewAlbumTitle(e.target.value)} 
                                    className={styles.editInput}
                                    required 
                                />
                            </div>
                            <div className={styles.cardActions}>
                                <button type="submit">Create</button>
                                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                 )}

                {albums.length === 0 ? (
                    <p>You don't have any albums yet. Time to create one!</p>
                ) : (
                    albums.map((album) => {
                         if (editingId === album.id) {
                             return (
                                 <div key={album.id} className={styles.albumCard}>
                                    {/* Fixed: Wrapped inside a matching sub-flex layout structural wrapper */}
                                    <div className={styles.albumFormContent}>
                                        <div className={styles.folderIcon}>📁</div>
                                        <input 
                                            type="text"
                                            value={editTitle} 
                                            onChange={((e) => setEditTitle(e.target.value))}
                                            className={styles.editInput}
                                            required
                                        />
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => handleUpdateAlbum(album.id)}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                 </div>
                             );
                         }

                        return (
                            <div key={album.id} className={styles.albumCard}> 
                                <Link to={`/users/${currentUser.username}/albums/${album.id}`} className={styles.albumLink}>
                                    <div className={styles.folderIcon}>📁</div>
                                    <h3>{album.title}</h3>
                                </Link>

                                <div className={styles.cardActions}>
                                    <button onClick={() => startEditing(album.id, album.title)}>Edit</button>
                                    <button onClick={() => handleDeleteAlbum(album.id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Albums;