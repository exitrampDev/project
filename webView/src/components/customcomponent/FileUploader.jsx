import React, { useRef, useState } from "react";
import "./FileUploader.css";

const FileUploader = ({
  label = "Upload File",
  accept = "image/*,.pdf",
  maxSizeMB = 5,
  fileName = "file",
  onFileSelect,
  existingFileUrl, // new prop
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return "";
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const errorMsg = validateFile(selectedFile);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setFile(selectedFile);
    setError("");
    onFileSelect?.(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const errorMsg = validateFile(droppedFile);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setFile(droppedFile);
    setError("");
    onFileSelect?.(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    inputRef.current.value = "";
  };
  return (
    <div className="file-uploader">

      <div
        className={`drop-zone ${file || existingFileUrl ? "has-file" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={handleFileChange}
        />

        {!file && !existingFileUrl ? (
          <div className="file__upload_info">
            Drag & drop file here or <em>browse</em>
          </div>
        ) : (
          <div className="file-preview">
  {file ? (
    file.type.startsWith("image/") ? (
      <img src={URL.createObjectURL(file)} alt="preview" />
    ) : file.type === "application/pdf" ? (
      <>
        📄 {file.name}
      </>
    ) : (
      <span>{file.name}</span>
    )
  ) : existingFileUrl ? (
    existingFileUrl.startsWith("data:application/pdf") ? (
      <>
        📄 {fileName}
      </>
    ) : (
      <img src={existingFileUrl} alt={fileName} />
    )
  ) : null}

  <button type="button" onClick={removeFile}>
    ✕
  </button>
</div>

        )}
      </div>

      {error && <small className="error">{error}</small>}
    </div>
  );
};


export default FileUploader;
