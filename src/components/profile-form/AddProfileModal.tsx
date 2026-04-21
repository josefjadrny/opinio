import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addNewProfile, uploadImage } from '../../api/client';
import { ALL_COUNTRIES, getCountryFlag } from '../../utils/countries';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useI18n } from '../../i18n/I18nContext';
import { useMe } from '../../hooks/useMe';
import { loginWithGoogle } from '../../api/client';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Role } from '../../types/profile';

const SIZE = 128;

function getDefaultCountryCode() {
  const locale = navigator.language || 'en-US';
  const region = locale.split('-')[1]?.toUpperCase();
  if (region && ALL_COUNTRIES.some((c) => c.code === region)) return region;
  return 'US';
}

function getCountryOptionLabel(code: string) {
  const country = ALL_COUNTRIES.find((c) => c.code === code);
  return country ? `${country.name} (${code})` : code;
}

function findCountry(value: string) {
  const normalized = value.trim().toLowerCase();
  return ALL_COUNTRIES.find((country) => {
    const optionLabel = `${country.name} (${country.code})`.toLowerCase();
    return country.code.toLowerCase() === normalized
      || country.name.toLowerCase() === normalized
      || optionLabel === normalized;
  });
}

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
  const isAnonymous = !user || user.tier === 'anonymous';

  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('politics');
  const [countryCode, setCountryCode] = useState(getDefaultCountryCode);
  const [countryInput, setCountryInput] = useState(() => getCountryOptionLabel(getDefaultCountryCode()));
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryFieldRef = useRef<HTMLDivElement>(null);

  const filteredCountries = ALL_COUNTRIES.filter((country) => {
    const query = countryInput.trim().toLowerCase();
    if (!query) return true;
    return country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query);
  }).slice(0, 12);

  // Set country from user's profile once on mount
  const countryInitialized = useRef(false);
  useEffect(() => {
    if (!countryInitialized.current && user?.countryCode) {
      if (ALL_COUNTRIES.some((c) => c.code === user.countryCode)) {
        setCountryCode(user.countryCode!);
        setCountryInput(getCountryOptionLabel(user.countryCode!));
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

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!countryFieldRef.current?.contains(e.target as Node)) {
        setCountryMenuOpen(false);
        setCountryInput(getCountryOptionLabel(countryCode));
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [countryCode]);

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
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.statementLabel}</label>
        <input
          type="text"
          placeholder={t.statementPlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          maxLength={40}
          className="w-full bg-surface text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          required
        />
        <p className={`text-xs mt-1 text-right ${name.length >= 36 ? 'text-red-400' : 'text-white/25'}`}>
          {name.length} / 40
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.categoryLabel}</label>
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
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.profileCountry}</label>
        <div ref={countryFieldRef} className="relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base leading-none pointer-events-none">
              {getCountryFlag(countryCode)}
            </span>
            <input
              type="text"
              value={countryInput}
              onFocus={() => {
                setCountryMenuOpen(true);
                setCountryInput('');
              }}
              onChange={(e) => {
                setCountryInput(e.target.value);
                setCountryMenuOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setCountryMenuOpen(false);
                  setCountryInput(getCountryOptionLabel(countryCode));
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const match = findCountry(countryInput) ?? filteredCountries[0];
                  if (match) {
                    setCountryCode(match.code);
                    setCountryInput(getCountryOptionLabel(match.code));
                    setCountryMenuOpen(false);
                  }
                }
              }}
              autoComplete="off"
              className="w-full text-white text-sm rounded-lg border border-border pl-11 pr-10 py-2 focus:outline-none focus:border-accent"
              placeholder={t.profileCountry}
              style={{ backgroundColor: '#1a1a2e' }}
            />
            <button
              type="button"
              onClick={() => {
                setCountryMenuOpen((open) => {
                  const next = !open;
                  if (next) setCountryInput('');
                  else setCountryInput(getCountryOptionLabel(countryCode));
                  return next;
                });
              }}
              className="absolute inset-y-0 right-0 px-3 text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${countryMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {countryMenuOpen && (
            <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountryCode(c.code);
                      setCountryInput(getCountryOptionLabel(c.code));
                      setCountryMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="mr-2">{getCountryFlag(c.code)}</span>
                    {c.name}
                    <span className="ml-2 text-white/35">{c.code}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-white/40">No country found</div>
              )}
            </div>
          )}
        </div>
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
        <p className={`text-xs mt-1 text-right ${description.length >= 230 ? 'text-red-400' : 'text-white/25'}`}>
          {description.length} / 255
        </p>
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

      {isAnonymous ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-white/60">{t.nominateTooltip}</p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="shrink-0 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {t.signIn}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-accent text-white text-sm font-medium py-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? t.adding : t.addProfile}
        </button>
      )}
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
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path stroke="var(--color-negative)" strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                <path stroke="var(--color-positive)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v6M9 12h6" />
              </svg>
              <h2 className="text-base font-semibold text-white">{t.addProfileTitle}</h2>
            </div>
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
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path stroke="var(--color-negative)" strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              <path stroke="var(--color-positive)" strokeLinecap="round" strokeLinejoin="round" d="M12 9v6M9 12h6" />
            </svg>
            <h2 className="text-base font-semibold text-white">{t.addProfileTitle}</h2>
          </div>
          {closeButton}
        </div>
        {formContent}
      </div>
    </div>
  );
}
