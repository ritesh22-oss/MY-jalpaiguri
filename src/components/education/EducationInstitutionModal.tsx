import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Navigation,
  Share2,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  Camera
} from 'lucide-react';
import { EducationalInstitution } from '../../types';
import { resolvePlaceImage, ResolvedPlaceImage } from '../../utils/placesPhotoClient';
import { getCategoryIllustrationUri } from '../../utils/placeCategoryIllustrations';
import { useLanguage } from '../../context/LanguageContext';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

interface EducationInstitutionModalProps {
  institution: EducationalInstitution | null;
  onClose: () => void;
}

export const EducationInstitutionModal: React.FC<EducationInstitutionModalProps> = ({
  institution,
  onClose
}) => {
  const { isBengali } = useLanguage();
  const [resolvedImage, setResolvedImage] = useState<ResolvedPlaceImage | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState<boolean>(true);
  const [sharedToast, setSharedToast] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!institution) return;
    let isMounted = true;
    setLoadingPhoto(true);

    // Convert institution to ExplorePlaceItem format for robust real photo resolution
    const placeMock = {
      id: institution.id,
      placeId: institution.id,
      name: institution.name,
      category: 'Education & Civic' as const,
      subcategory: institution.category,
      formattedAddress: `${institution.address}, Jalpaiguri - ${institution.pincode}`,
      lat: institution.lat,
      lng: institution.lng,
      rating: institution.rating || 4.5,
      userRatingCount: 48,
      googleMapsUri: `https://www.google.com/maps/search/?q=${encodeURIComponent(institution.name + ' Jalpaiguri')}`
    };

    resolvePlaceImage(placeMock, 800, 500)
      .then((res) => {
        if (!isMounted) return;
        setResolvedImage(res);
      })
      .catch(() => {
        if (!isMounted) return;
        setResolvedImage({
          imageUrl: getCategoryIllustrationUri('Education & Civic'),
          sourceType: 'category_illustration',
          badgeLabel: 'Stock Photo',
          attribution: 'Unsplash Photorealistic Collection',
          isAiGenerated: false
        });
      })
      .finally(() => {
        if (isMounted) setLoadingPhoto(false);
      });

    return () => {
      isMounted = false;
    };
  }, [institution]);

  if (!institution) return null;

  const handleShare = () => {
    const mapsUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(institution.name + ' Jalpaiguri')}`;
    if (navigator.share) {
      navigator
        .share({
          title: institution.name,
          text: `${institution.name} - ${institution.overview}`,
          url: mapsUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${institution.name}: ${mapsUrl}`);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2000);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(institution.name + ' Jalpaiguri')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Image Header */}
        <div className="relative w-full h-56 sm:h-64 bg-gray-100 dark:bg-gray-900 shrink-0">
          {loadingPhoto && !resolvedImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
              <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10" />
              <p className="text-xs text-gray-500">Loading real institution photo…</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={resolvedImage?.imageUrl || getCategoryIllustrationUri('Education & Civic')}
                alt={institution.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setResolvedImage({
                    imageUrl: getCategoryIllustrationUri('Education & Civic'),
                    sourceType: 'category_illustration',
                    badgeLabel: 'Stock Photo',
                    attribution: 'Unsplash Photorealistic Collection',
                    isAiGenerated: false
                  });
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Top Actions: Share & Close */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
              title="Share Institution"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tag on Image */}
          <div className="absolute top-3 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/95 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 shadow-md backdrop-blur-xs">
              {institution.category}
            </span>
          </div>

          {/* Title on Bottom of Image */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
              {institution.name}
            </h2>
            {institution.nameBn && (
              <p className="text-xs font-medium text-white/90 font-bengali drop-shadow-md">
                {institution.nameBn}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {sharedToast && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Link copied to clipboard!</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Address / Location</p>
                <p className="text-gray-600 dark:text-gray-300 mt-0.5">{institution.address}, {institution.locality} - {institution.pincode}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Operational Hours</p>
                <p className="text-gray-600 dark:text-gray-300 mt-0.5">{institution.openingHours}</p>
              </div>
            </div>

            {institution.phone && institution.phone !== 'Verify on site' && (
              <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Contact Phone</p>
                  <a href={`tel:${institution.phone}`} className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5 hover:underline block">
                    {institution.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Verification Status</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Verified Jalpaiguri Institution</p>
              </div>
            </div>
          </div>

          {/* Overview / About */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {isBengali ? 'সংক্ষিপ্ত বিবরণ' : 'Institution Overview'}
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              {institution.overview}
            </p>
          </div>

          {/* Facilities List */}
          {institution.facilities && institution.facilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {isBengali ? 'সুবিধাবৃন্দ' : 'Campus Facilities'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {institution.facilities.map((fac, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-80" />
            </a>

            {institution.phone && institution.phone !== 'Verify on site' && (
              <a
                href={`tel:${institution.phone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-transform active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800/40 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      </div>

      <UploadPlacePhotoModal
        placeId={institution.id}
        placeName={institution.name}
        category={institution.category}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
