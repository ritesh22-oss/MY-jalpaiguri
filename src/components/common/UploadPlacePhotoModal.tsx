import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface UploadPlacePhotoModalProps {
  placeId: string;
  placeName: string;
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UploadPlacePhotoModal: React.FC<UploadPlacePhotoModalProps> = ({
  placeId,
  placeName,
  category,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { submitPlacePhoto } = useApp();
  const { isBengali } = useLanguage();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setErrorMsg('Please select or capture a photo first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await submitPlacePhoto({
        placeId,
        placeName,
        category,
        imageUrl: selectedImage,
        uploaderName: user?.name || 'Citizen User',
        uploaderEmail: user?.email || 'citizen@jalpaiguri.gov.in'
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setSelectedImage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/50">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              {isBengali ? 'ছবি আপলোড করুন' : 'Upload Place Photo'}
            </h2>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">{placeName}</p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Photo Submitted Successfully!</h3>
            <p className="text-xs text-gray-500">Sent to the municipal admin panel for review and thumbnail assignment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {selectedImage ? (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs hover:bg-black/80"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Gallery Upload */}
                <label className="border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-[#007AFF] dark:hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Gallery Upload</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Select image file</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {/* Camera Capture */}
                <label className="border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Take Camera Photo</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Capture with camera</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Uploaded photos are instantly sent to admin <strong className="text-gray-700 dark:text-gray-300">riteshganguly0911@gmail.com</strong> for review and assignment as the official thumbnail.
            </p>

            <button
              onClick={handleSubmit}
              disabled={!selectedImage || isSubmitting}
              className="w-full bg-[#007AFF] hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Admin Panel…</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Photo for Review</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
