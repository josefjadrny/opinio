import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addNewProfile, uploadImage } from '../../api/client';
import { ALL_COUNTRIES, getCountryFlag } from '../../utils/countries';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useI18n } from '../../i18n/I18nContext';
import { useMe } from '../../hooks/useMe';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Role } from '../../types/profile';

const SIZE = 128;

// Resize a File to 128×128 JPEG (cover crop) using canvas
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;

      // Cover crop: scale so the shorter side fills 128px, then center
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const sw = SIZE / scale;
      const sh = SIZE / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE);

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

interface AddProfileModalProps {
  onClose: () => void;
}

export function AddProfileModal({ onClose }: AddProfileModalProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data: me } = useMe();
  const isMobile = useIsMobile();

  const user = me?.user;

  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('politician');
  const [countryCode, setCountryCode] = useState(() => {
    const locale = navigator.language || 'en-US';
    const region = locale.split('-')[1]?.toUpperCase();
    if (region && ALL_COUNTRIES.some((c) => c.code === region)) return region;
    return 'US';
  });
  const [description, setDescription] = useState('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set country from user's profile once on mount
  const countryInitialized = useRef(false);
  useEffect(() => {
    if (!countryInitialized.current && user?.countryCode) {
      if (ALL_COUNTRIES.some((c) => c.code === user.countryCode)) {
        setCountryCode(user.countryCode!);
      }
      countryInitialized.current = true;
    }
  }, [user?.countryCode]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    try {
      const blob = await resizeImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setImageError('Failed to process image');
    }
  };

  const mutation = useMutation({
    mutationFn: async (fields: { name: string; role: Role; countryCode: string; description: string }) => {
      let finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fields.name)}&size=128&background=random`;
      let finalImageKey: string | undefined;
      if (imageBlob) {
        const { url, key } = await uploadImage(imageBlob);
        finalImageUrl = url;
        finalImageKey = key;
      }
      return addNewProfile({
        ...fields,
        imageUrl: finalImageUrl,
        imageKey: finalImageKey,
        addedBy: user?.displayName ?? 'Anonymous',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    mutation.mutate({ name: name.trim(), role, countryCode, description: description.trim() });
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nameLabel}</label>
        <input
          type="text"
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.roleLabel}</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`${ROLE_COLORS[r]} text-white text-[11px] leading-none font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide transition-all ${
                role === r ? 'opacity-100 ring-2 ring-white/40' : 'opacity-35 hover:opacity-65'
              }`}
            >
              {t.roles[r]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.country}</label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          {ALL_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              {getCountryFlag(c.code)} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.descriptionLabel}</label>
        <textarea
          placeholder={t.descriptionPlaceholder}
          value={description}
          maxLength={255}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-surface text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent resize-none"
          required
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.photoLabel}</label>
        <div className="flex items-center gap-3">
          {/* Preview */}
          <div
            className="w-14 h-14 rounded-full border border-border bg-surface shrink-0 overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3A.75.75 0 002.25 4.5v15a.75.75 0 00.75.75h18a.75.75 0 00.75-.75v-15A.75.75 0 0021 3.75z" />
                </svg>
              </div>
            )}
          </div>

          {/* Pick / change button */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {previewUrl ? t.photoChange : t.photoChoose}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={() => { setImageBlob(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="block text-xs text-white/30 hover:text-white/60 transition-colors mt-0.5"
              >
                {t.photoRemove}
              </button>
            )}
            {imageError && <p className="text-xs text-red-400 mt-0.5">{imageError}</p>}
            <p className="text-xs text-white/25 mt-0.5">{t.photoHint}</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-accent text-white text-sm font-medium py-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? t.adding : t.addProfile}
      </button>
    </form>
  );

  const closeButton = (
    <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <h2 className="text-base font-semibold text-white">{t.addProfileTitle}</h2>
            {closeButton}
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-white">{t.addProfileTitle}</h2>
          {closeButton}
        </div>
        {formContent}
      </div>
    </div>
  );
}
