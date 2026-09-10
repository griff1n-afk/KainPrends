import './PhotoUpload.css'

interface PhotoUploadProps {
  photoPreview: string | null;
  onPhotoSelect: (file: File) => void;
}

export default function PhotoUpload({ photoPreview, onPhotoSelect }: PhotoUploadProps) {

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  return (
    <div className="pu-container">
      <label className="pu-dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
        {photoPreview ? (
          <img src={photoPreview} alt="Recipe preview" className="pu-preview-img" />
        ) : (
          <span>Drag & drop or click to upload photo</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="pu-hidden-input"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
}