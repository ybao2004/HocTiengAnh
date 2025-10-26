
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './icons';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
      onFilesSelected(allFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
      onFilesSelected(allFiles);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
        Upload Test Images
      </label>
      <div 
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-primary-400' : 'border-gray-600'} border-dashed rounded-md cursor-pointer transition-colors duration-200`}>
        <div className="space-y-1 text-center">
          <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-500" />
          <div className="flex text-sm text-gray-400">
            <span className="relative font-medium text-primary-400 hover:text-primary-500">
              <span>Upload files</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                multiple
                accept="image/png, image/jpeg, image/jpg"
                className="sr-only" 
                onChange={handleFileChange}
              />
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
      </div>
       {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-300">Selected files:</h3>
          <ul className="mt-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-md text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                   <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                   <span className="truncate">{file.name}</span>
                </div>
                <button onClick={() => handleRemoveFile(index)} className="p-1 rounded-full hover:bg-gray-600">
                  <XIcon className="h-4 w-4 text-gray-300" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
