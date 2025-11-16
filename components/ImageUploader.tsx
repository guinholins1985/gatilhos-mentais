import React, { useRef } from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageChange,
  onImageRemove,
  previewUrl,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if(inputRef.current) {
        inputRef.current.value = "";
    }
    onImageRemove();
  }

  return (
    <div className="flex flex-col space-y-2">
       <label className="font-semibold text-slate-300">
        Imagem do Produto <span className="text-slate-500 font-normal">(Opcional)</span>
      </label>
      <div
        className="relative flex justify-center items-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="object-contain h-full w-full rounded-md p-1" />
            <button
              onClick={handleRemoveClick}
              className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-colors"
              aria-label="Remover imagem"
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <div className="text-center text-slate-500">
            <ImageIcon />
            <p className="mt-2">Clique para adicionar uma imagem</p>
            <p className="text-xs">(PNG, JPG, WEBP)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
