import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  currentImage?: string;
  label?: string;
  uploading?: boolean;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  label = 'Upload Image',
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { colors } = useTheme();

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const previewFile = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(previewFile);
      files.forEach((file) => onImageUpload(file));
    }
    event.target.value = '';
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.text,
            fontSize: '0.875rem'
          }}
        >
          {label}
        </label>
      )}
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '150px',
          border: `2px dashed ${colors.border}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: colors.inputBg,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span style={{ color: colors.text, opacity: 0.7 }}>
            Click to upload image
          </span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};
