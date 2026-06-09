import { useLoaderData, useParams, Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Album.module.css";
import { useCurrentUser } from "../UserContext";

export const loader = async ({ params }) => {
    const albumId = params.id;
    try {
        const [albumRes, photosRes] = await Promise.all([
            fetch(`http://localhost:3000/albums/${albumId}`),
            fetch(`http://localhost:3000/photos?albumId=${albumId}`)
        ]);
        if (!albumRes.ok || !photosRes.ok) {
            throw new Error("Failed to load album details or photos");
        }
        const album = await albumRes.json();
        const photos = await photosRes.json();
        return { album, photos };
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

function Album() {
    const { album, photos: initialPhotos } = useLoaderData();
    const currentUser=useCurrentUser();

    const [photos, setPhotos] = useState(initialPhotos);
    const [showForm, setShowForm] = useState(false);
    const [imageId, setImageId] = useState(() => Math.floor(Math.random() * 500) + 1);
    const [title, setTitle] = useState("");
    const [editTitle,setEditTitle]=useState("");
    const [editingId,setEditingId]=useState(null);

    const handleReroll = () => {
        setImageId(Math.floor(Math.random() * 500) + 1);
    };
    const startEditing=(photoId,photoTitle)=>{
        setEditingId(photoId);
        setEditTitle(photoTitle);

    }

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const currentUrl = `https://picsum.photos/id/${imageId}/600/600`;
        const currentThumbnailUrl = `https://picsum.photos/id/${imageId}/150/150`;

        try {
            const res = await fetch("http://localhost:3000/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    albumId: album.id,
                    title,
                    url: currentUrl,
                    thumbnailUrl: currentThumbnailUrl
                })
            });

            if (!res.ok) throw new Error("Failed to add photo");
            const newPhoto = await res.json();
            
            setPhotos((prev) => [...prev, newPhoto]);
            setTitle("");
            setShowForm(false);
            handleReroll();
        }
        catch (error) {
            console.error("Error adding photo:", error);
        }
    };
    const handleUpdatePhoto=async (photoId)=>{
        try{
            const res=await fetch(`http://localhost:3000/photos/${photoId}`,{
                method:"PUT",
                headers:{ 'Content-Type': 'application/json' },
                body:JSON.stringify({title:editTitle,userId:currentUser.id})
            });
            const updated=await res.json();
            setPhotos(prev=> prev.map(photo=>photo.id==photoId? updated:photo));
        }
        catch(error){
            console.error("Error updating photo:", error)
        }

    }
    const handleDeletePhoto=async (photoId)=>{
        try{
            await fetch(`http://localhost:3000/photos/${photoId}`,{
                method:"DELETE",
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({userId:currentUser.id})
            });
            setPhotos(prev=> prev.filter(photo=>photo.id!=photoId));

        }
        catch(error){
            console.error("Error updating photo:", error)
        }

    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{album.title}</h1>
                <button onClick={() => setShowForm(!showForm)} className={styles.addPhotoBtn}>
                    {showForm ? "Cancel" : "Add new photo"}
                </button>
            </div>

            <div className={styles.photoGrid}>
                {showForm && (
                    <div className={`${styles.photoCard} ${styles.formCard}`}>
                        <form onSubmit={handleAddPhoto}>
                            <div className={styles.previewContainer}>
                                <img src={`https://picsum.photos/id/${imageId}/150/150`} alt="Preview" className={styles.thumbnail} />
                                <button type="button" onClick={handleReroll} className={styles.rerollBtn}>Reroll</button>
                            </div>
                            <input
                                type="text"
                                placeholder="Give it a name..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <button type="submit" className={styles.saveBtn}>Save Picture</button>
                        </form>
                    </div>
                )}
                {photos.length === 0 && !showForm ? (
                    <p className={styles.emptyMessage}>This album doesn't have any photos yet.</p>
                ) : (
                    photos.map((photo) => 
                        
                         (
                        <div key={photo.id} className={styles.photoCard}>
                            <img src={photo.thumbnailUrl} alt={photo.title} className={styles.thumbnail} />
                            <div className={styles.photoInfo}>
                                {editingId!==photo.id?(<p>{photo.title}</p>): 
                                <input type="text"
                                   value={editTitle}
                                   onChange={(e)=>{setEditTitle(e.target.value)}}
                                   required/>}
                            </div>
                            {editingId===photo.id && (
                                <div className={styles.cardActions}>
                                    <button onClick={() => {handleUpdatePhoto(photo.id); setEditingId(null);}}>Save</button>
                                    <button onClick={() => setEditingId(null)}>Cancel</button>
                                </div>
                            )}
                            {editingId!==photo.id &&(
                                <div className={styles.cardActions}>
                                    <button onClick={()=>{startEditing(photo.id,photo.title)}}>Edit</button>
                                    <button onClick={()=>handleDeletePhoto(photo.id)}>Delete</button>
                                </div>

                            )}
                            
                        </div>)
                    )
                )}
            </div>
        </div>
    );
}

export default Album;