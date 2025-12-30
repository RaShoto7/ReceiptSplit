'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language';
import { addPhotoAction, removePhotoAction } from '@/lib/actions';
import { Photo, Participant } from '@/types';

interface NosMomentsProps {
  roomId: string;
  photos: Photo[];
  participants: Participant[];
  currentParticipantId: string | null;
}

// Compress image to reduce size while maintaining quality
async function compressImage(file: File, maxSizeKB: number = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with high quality
        let quality = 0.85;
        let result = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality if still too large
        while (result.length > maxSizeKB * 1024 && quality > 0.3) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function NosMoments({ roomId, photos, participants, currentParticipantId }: NosMomentsProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(photos.length > 0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-expand when photos change
  useEffect(() => {
    if (photos.length > 0) {
      setIsExpanded(true);
    }
  }, [photos.length]);

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentParticipantId) return;

    setIsUploading(true);

    try {
      // Compress image for better quality/size balance
      const imageData = await compressImage(file);

      const formData = new FormData();
      formData.set('roomId', roomId);
      formData.set('participantId', currentParticipantId);
      formData.set('imageData', imageData);
      formData.set('caption', caption);

      await addPhotoAction(formData);
      setCaption('');
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const formData = new FormData();
    formData.set('photoId', photoId);
    formData.set('roomId', roomId);
    await removePhotoAction(formData);
    setSelectedPhoto(null);
  };

  return (
    <>
      {/* Nos Moments Section */}
      <div className="premium-card rounded-3xl shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.nosMoments}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.nosMomentsDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-full">
                {photos.length}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded Content */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 pt-0 space-y-4">
            {/* Upload Section */}
            {currentParticipantId && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={t.addCaption}
                    className="flex-1 px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-pink-500"
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer transition-all ${
                      isUploading
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 active:scale-95'
                    }`}
                  >
                    {isUploading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {t.addPhoto}
                  </label>
                </div>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">{t.noPhotosYet}</p>
                <p className="text-xs mt-1">{t.captureMemories}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img
                      src={photo.image_data}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">
                        {getParticipantName(photo.uploaded_by_participant_id)}
                      </p>
                      <p className="text-white/70 text-xs">
                        {formatTime(photo.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_data}
              alt={selectedPhoto.caption || 'Photo'}
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />
            <div className="mt-4 text-center">
              {selectedPhoto.caption && (
                <p className="text-white text-lg mb-2">{selectedPhoto.caption}</p>
              )}
              <p className="text-gray-400 text-sm">
                {t.photoBy} {getParticipantName(selectedPhoto.uploaded_by_participant_id)} • {formatTime(selectedPhoto.created_at)}
              </p>
              {currentParticipantId === selectedPhoto.uploaded_by_participant_id && (
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  {t.deletePhoto}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
