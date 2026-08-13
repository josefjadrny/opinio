import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModalShell } from '../common/ModalShell';
import { addNewProfile, uploadImage, uploadContentImage } from '../../api/client';
import { ALL_COUNTRIES, getCountriesList, getCountryName, isKnownCountry } from '../../utils/countries';
import { FlagImg } from '../common/CountryFlag';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useI18n } from '../../i18n/I18nContext';
import { useMe } from '../../hooks/useMe';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSignIn } from '../auth/SignInContext';
import { resizeImage } from '../../utils/resizeImage';
import { Avatar } from '../profile/Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { LabelBadge } from '../profile/LabelBadge';
import type { Role } from '../../types/profile';
import { stripEmoji } from '../../utils/emoji';
import { EmojiPickerPopover } from './EmojiPickerPopover';

// Draft persisted to localStorage so a half-composed opinio survives closing
// the modal (or a reload). The card image (already resized to 128x128 JPEG, a
// few KB) rides along as a base64 data URL. The content image is NOT kept — raw
// uploads run up to 10MB, which blows the ~5MB localStorage quota; that would
// need IndexedDB.
const DRAFT_KEY = 'opinio:add-profile-draft';

// Drafts older than this are dropped on load, so a stale opinio from days ago
// never resurfaces.
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

interface ProfileDraft {
  name: string;
  role: Role;
  countryCode: string;
  description: string;
  link: string;
  image: string | null;   // card image as a base64 data URL (null = none)
  savedAt: number;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Returns a draft only when it carries real content and hasn't expired, so an
// empty/default or stale form never triggers the "restored" notice.
function loadDraft(): ProfileDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<ProfileDraft>;
    if (typeof d.savedAt !== 'number' || Date.now() - d.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    const name = typeof d.name === 'string' ? d.name : '';
    const description = typeof d.description === 'string' ? d.description : '';
    const link = typeof d.link === 'string' ? d.link : '';
    const image = typeof d.image === 'string' && d.image.startsWith('data:') ? d.image : null;
    if (!name.trim() && !description.trim() && !link.trim() && !image) return null;
    return {
      name,
      description,
      link,
      image,
      savedAt: d.savedAt,
      role: ALL_ROLES.includes(d.role as Role) ? (d.role as Role) : 'politics',
      countryCode:
        typeof d.countryCode === 'string' && ALL_COUNTRIES.some((c) => c.code === d.countryCode)
          ? d.countryCode
          : getDefaultCountryCode(),
    };
  } catch {
    return null;
  }
}

function getDefaultCountryCode() {
  const locale = navigator.language || 'en-US';
  const region = locale.split('-')[1]?.toUpperCase();
  if (region && ALL_COUNTRIES.some((c) => c.code === region)) return region;
  return 'US';
}


// Form palette — matches SettingsModal so the two modals read as one family
// (label = text-xs font-medium /80; hint = text-xs /30). No uppercase micro-
// labels, which made this modal look off next to the rest of the app.
const LABEL = 'block text-xs font-medium text-white/80 mb-1.5';
const INPUT =
  'w-full bg-surface text-white text-sm rounded-lg border border-border px-3 py-2 placeholder:text-white/50 focus:outline-none focus:border-accent transition-colors';
const HINT = 'text-xs text-white/50 mt-1.5 leading-snug';
// The form's faint secondary text (hints, counters, placeholders) was /30 -
// ~1.6:1 contrast on the dark surface, too dark to read on dimmer displays
// (reported by Windows users). Standardised to /50 across the form.
const COUNTER = 'text-xs text-white/50 mt-1 text-right tabular-nums';
const ERROR = 'text-xs text-red-400 mt-1';

// Link is stored as plain text for the MVP (no OG fetch / preview card yet).
// We only sanity-check it's an http(s) URL and cap it so the BE contract is
// simple (single optional string, <= 255 chars).
const MAX_LINK_LENGTH = 255;

// Body floor - kept in sync with the BE check in routes/profiles.ts so the FE
// never lets through something the API would 400 on.
const MIN_DESCRIPTION_LENGTH = 5;

function isValidLink(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// "https://www.example.com/path?x=1" -> "example.com" for the compact chip.
function linkHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

const LinkIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

// Static, non-interactive twin of the opinio card so the author sees the result
// of every field as they type. Mirrors the detail-modal layout (header + body +
// content image + link chip + read-only vote row). Not the real ProfileCard,
// which is wired into navigation/hover/voting and needs a full Profile object.
interface PreviewCardProps {
  name: string;
  role: Role;
  countryCode: string;
  description: string;
  avatarUrl: string | null;
  contentImageUrl: string | null;
  link: string;
  // Votes row is dropped on mobile (the pinned preview must stay compact).
  showVotes?: boolean;
}

function OpinioPreviewCard({ name, role, countryCode, description, avatarUrl, contentImageUrl, link, showVotes = true }: PreviewCardProps) {
  const { t } = useI18n();
  const hasLink = link.trim().length > 0;
  return (
    <div className="rounded-xl border border-border bg-surface-light/50 overflow-hidden">
      {/* Name + badges share one wrapping row (mirrors ProfileCard) so there's
          no dead gap between the headline and the flag/category/NEW row. */}
      <div className="flex items-start gap-2.5 px-3 pt-3">
        {avatarUrl ? (
          <Avatar name={name || '?'} imageUrl={avatarUrl} className="w-9 h-9 shrink-0" />
        ) : (
          // Neutral placeholder so the avatar doesn't reshuffle its hashed color
          // on every keystroke — the color is meaningless in the preview.
          <div className="w-9 h-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-semibold">
            {(name.trim()[0] || '?').toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 flex items-center gap-x-1.5 gap-y-0.5 flex-wrap">
          <span className={`text-sm font-semibold truncate min-w-0 flex-shrink ${name ? 'text-white' : 'text-white/50'}`}>
            {name || t.previewHeadlinePlaceholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <FlagImg code={countryCode} />
            <RoleBadge role={role} />
            <LabelBadge label="new" />
          </div>
        </div>
      </div>
      <p className={`px-3 mt-2 text-[13px] leading-relaxed break-words ${description ? 'text-white/80' : 'text-white/50'}`}>
        {description || t.descriptionLabel}
      </p>
      {contentImageUrl && (
        <img src={contentImageUrl} alt="" className="mt-2 w-full max-h-32 object-contain bg-black/30" />
      )}
      {hasLink && (
        <div className="px-3 mt-2">
          <span className="inline-flex items-center gap-1 max-w-full text-[11px] text-accent/90 bg-accent/10 rounded-full px-2 py-0.5">
            <LinkIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{linkHost(link)}</span>
          </span>
        </div>
      )}
      {showVotes && (
        <div className="flex items-center gap-4 px-3 py-2.5 mt-2 border-t border-border text-xs font-semibold tabular-nums">
          <span className="inline-flex items-baseline gap-1 text-positive"><span className="text-[10px]">▲</span>0</span>
          <span className="inline-flex items-baseline gap-1 text-negative"><span className="text-[10px]">▼</span>0</span>
        </div>
      )}
      {!showVotes && <div className="pb-3" />}
    </div>
  );
}

const NominateIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path stroke="var(--color-negative)" strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    <path stroke="var(--color-positive)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v6M9 12h6" />
  </svg>
);

interface AddProfileModalProps {
  onClose: () => void;
}

function renderTokens(text: string, tokens: Record<string, ReactNode>) {
  const parts = text.split(/(\{[a-z]+\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{([a-z]+)\}$/);
    if (m && tokens[m[1]] !== undefined) return <span key={i}>{tokens[m[1]]}</span>;
    return <span key={i}>{part}</span>;
  });
}

export function AddProfileModal({ onClose }: AddProfileModalProps) {
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  const { data: me } = useMe();

  // Country label/search close over the active locale so names show + match in
  // the user's language. Defined here (not module scope) for that reason.
  const getCountryOptionLabel = (code: string) =>
    isKnownCountry(code) ? `${getCountryName(code, locale)} (${code})` : code;
  const findCountry = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return getCountriesList(locale).find((country) => {
      const optionLabel = `${country.name} (${country.code})`.toLowerCase();
      return country.code.toLowerCase() === normalized
        || country.name.toLowerCase() === normalized
        || optionLabel === normalized;
    });
  };
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { promptSignIn } = useSignIn();

  // Clipboard read is gated behind a secure context + browser support; only
  // show the Paste affordance where it actually works.
  const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const blockedUntilDate = user?.blockedUntil ? new Date(user.blockedUntil) : null;
  // Captured once at mount (Date.now() can't be called during render) — block
  // status is static for the lifetime of an open modal.
  const [mountedAt] = useState(() => Date.now());
  const isBlocked = !!blockedUntilDate && blockedUntilDate.getTime() > mountedAt;

  // Restore a half-composed draft once on mount (null when none worth restoring).
  const [restoredDraft, setRestoredDraft] = useState(loadDraft);
  const [name, setName] = useState(() => restoredDraft?.name ?? '');
  const [role, setRole] = useState<Role>(() => restoredDraft?.role ?? 'politics');
  const [countryCode, setCountryCode] = useState(() => restoredDraft?.countryCode ?? getDefaultCountryCode());
  const [countryInput, setCountryInput] = useState(() =>
    getCountryOptionLabel(restoredDraft?.countryCode ?? getDefaultCountryCode()),
  );
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [description, setDescription] = useState(() => restoredDraft?.description ?? '');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  // Seeded from a restored draft (a base64 data URL); imageBlob stays null until
  // submit, where it's rebuilt from this data URL (see mutationFn).
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => restoredDraft?.image ?? null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [contentImageFile, setContentImageFile] = useState<File | null>(null);
  const [contentPreviewUrl, setContentPreviewUrl] = useState<string | null>(null);
  const [contentImageError, setContentImageError] = useState<string | null>(null);
  const [link, setLink] = useState(() => restoredDraft?.link ?? '');
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);
  const countryFieldRef = useRef<HTMLDivElement>(null);

  const filteredCountries = getCountriesList(locale).filter((country) => {
    const query = countryInput.trim().toLowerCase();
    if (!query) return true;
    return country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query);
  });

  // Once the signed-in user's profile loads (async), default the country field
  // to their country - but only the first time, and never over a restored draft
  // (which already carries the country they'd picked). This is a render-time
  // state adjustment per the React docs, not an effect: the guard flips false
  // after one application, so it can't loop.
  const [countryFromUserApplied, setCountryFromUserApplied] = useState(!!restoredDraft);
  if (!countryFromUserApplied && user?.countryCode) {
    setCountryFromUserApplied(true);
    if (ALL_COUNTRIES.some((c) => c.code === user.countryCode)) {
      setCountryCode(user.countryCode);
      setCountryInput(getCountryOptionLabel(user.countryCode));
    }
  }

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

  // The card preview is a data URL (no object URL to revoke). The content image
  // still uses an object URL, so it's revoked on cleanup.
  useEffect(() => {
    return () => { if (contentPreviewUrl) URL.revokeObjectURL(contentPreviewUrl); };
  }, [contentPreviewUrl]);

  // Close the emoji popover on an outside click or Escape. Escape is handled in
  // the capture phase so it dismisses the picker without also bubbling up to
  // ModalShell's Escape-to-close (otherwise one keypress would shut both).
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!emojiWrapRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setEmojiOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [emojiOpen]);

  // Insert an emoji at the caret (or replacing the selection) in the body. Honors
  // the same 255 UTF-16 cap as the textarea's maxLength and never splits an emoji
  // - if it wouldn't fit, the insert is dropped rather than truncated mid-glyph.
  const insertEmoji = (emoji: string) => {
    const ta = descriptionRef.current;
    const start = ta?.selectionStart ?? description.length;
    const end = ta?.selectionEnd ?? description.length;
    const next = description.slice(0, start) + emoji + description.slice(end);
    if (next.length > 255) return;
    setDescription(next);
    requestAnimationFrame(() => {
      if (!ta) return;
      const pos = start + emoji.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  // Persist the fields as the user edits so closing the modal (or a reload)
  // keeps the half-composed opinio. The card image (previewUrl) is a base64 data
  // URL when present. Cleared on a successful submit, or when the user empties
  // everything / discards the draft.
  const image = previewUrl?.startsWith('data:') ? previewUrl : null;
  useEffect(() => {
    const hasContent = name.trim() || description.trim() || link.trim() || !!image;
    try {
      if (!hasContent) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, role, countryCode, description, link, image, savedAt: Date.now() }));
      }
    } catch {
      // localStorage unavailable / over quota (private mode, oversized image) —
      // drafts just won't persist.
    }
  }, [name, role, countryCode, description, link, image]);

  const discardDraft = () => {
    setName('');
    setRole('politics');
    setDescription('');
    setLink('');
    setLinkOpen(false);
    setImageBlob(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setRestoredDraft(null);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith('image/')) { setImageError('Please select an image file'); return; }
    try {
      const blob = await resizeImage(file);
      // Use a data URL (not an object URL) so the same value both renders the
      // preview and persists into the draft verbatim.
      const dataUrl = await blobToDataUrl(blob);
      setImageBlob(blob);
      setPreviewUrl(dataUrl);
    } catch {
      setImageError('Failed to process image');
    }
  };

  // Content image: server handles all resizing + moderation. We just preview
  // the raw file locally and ship it on submit. Accepted: JPEG / PNG / WebP up to 10 MB.
  const ACCEPTED_CONTENT_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_CONTENT_UPLOAD_BYTES = 10 * 1024 * 1024;
  const handleContentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setContentImageError(null);
    if (!ACCEPTED_CONTENT_MIMES.includes(file.type)) {
      setContentImageError('JPEG, PNG or WebP only');
      return;
    }
    if (file.size > MAX_CONTENT_UPLOAD_BYTES) {
      setContentImageError('Image must be under 10 MB');
      return;
    }
    if (contentPreviewUrl) URL.revokeObjectURL(contentPreviewUrl);
    setContentImageFile(file);
    setContentPreviewUrl(URL.createObjectURL(file));

    // No card avatar chosen yet - reuse this same photo so the opinio isn't
    // left with the generic placeholder circle. Best-effort: on failure the
    // avatar just stays unset, same as before this existed.
    if (!previewUrl) {
      try {
        const blob = await resizeImage(file);
        const dataUrl = await blobToDataUrl(blob);
        setImageBlob(blob);
        setPreviewUrl(dataUrl);
      } catch {
        // ignore - user can still pick an avatar manually
      }
    }
  };

  const handlePasteLink = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        setLink(text.slice(0, MAX_LINK_LENGTH));
        setLinkError(null);
      }
    } catch {
      // Permission denied / unavailable — silently no-op; the user can still type.
    }
  };

  const mutation = useMutation({
    mutationFn: async (fields: { name: string; role: Role; countryCode: string; description: string; link?: string }) => {
      let finalImageUrl = '';
      let finalImageKey: string | undefined;
      // After restoring a draft, imageBlob is null but previewUrl holds the card
      // image as a data URL — rebuild the blob so the avatar still uploads.
      let blob = imageBlob;
      if (!blob && previewUrl?.startsWith('data:')) {
        blob = await (await fetch(previewUrl)).blob();
      }
      if (blob) {
        const { url, key } = await uploadImage(blob);
        finalImageUrl = url;
        finalImageKey = key;
      }
      let finalContentImageUrl: string | undefined;
      let finalContentImageKey: string | undefined;
      if (contentImageFile) {
        try {
          const { url, key } = await uploadContentImage(contentImageFile);
          finalContentImageUrl = url;
          finalContentImageKey = key;
        } catch (err) {
          // Surface the friendly inline error rather than blowing up the whole
          // mutation — the avatar upload (if any) already succeeded.
          const status = (err as { status?: number } | null)?.status;
          setContentImageError(status === 422 ? t.contentImageBlocked : t.contentImageUploadError);
          throw err;
        }
      }
      return addNewProfile({
        ...fields,
        imageUrl: finalImageUrl,
        imageKey: finalImageKey,
        contentImageUrl: finalContentImageUrl,
        contentImageKey: finalContentImageKey,
        link: fields.link,
        addedBy: user?.displayName ?? 'Anonymous',
      });
    },
    onSuccess: () => {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onClose();
    },
  });

  // Required fields gate the submit button (disabled until met) rather than
  // validating after a click. The body floor mirrors the BE 5-char check,
  // counted in the same UTF-16 units the counter/BE use (an emoji is ~2).
  const canSubmit =
    name.trim().length > 0 && description.trim().length >= MIN_DESCRIPTION_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isBlocked || mutation.isPending) return;
    const trimmedLink = link.trim();
    if (trimmedLink && !isValidLink(trimmedLink)) {
      setLinkError(t.linkInvalid);
      setLinkOpen(true);
      return;
    }
    mutation.mutate({
      name: name.trim(),
      role,
      countryCode,
      description: description.trim(),
      link: trimmedLink || undefined,
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      title={t.addProfileTitle}
      icon={<NominateIcon />}
      maxWidth="max-w-4xl"
      desktopScrollable
    >
      <div className="md:flex md:items-stretch">
      {isMobile && (
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
          {/* "Live preview" tag overlays the card's top-right corner (absolute,
              out of flow) so the cue costs zero height and zero width. */}
          <div className="relative">
            <span className="absolute -top-2 right-3 z-10 text-[10px] font-medium uppercase tracking-wide text-white/50 bg-surface border border-border rounded-full px-2 py-0.5 pointer-events-none">
              {t.previewCaption}
            </span>
            <OpinioPreviewCard
              name={name}
              role={role}
              countryCode={countryCode}
              description={description}
              avatarUrl={previewUrl}
              contentImageUrl={contentPreviewUrl}
              link={link}
              showVotes={false}
            />
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 md:flex-1 md:min-w-0">
        {restoredDraft && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-xs text-white/70">{t.draftRestored}</p>
            <button
              type="button"
              onClick={discardDraft}
              className="shrink-0 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              {t.draftDiscard}
            </button>
          </div>
        )}
        {/* Statement — avatar picker sits inline to the left, so the opinio's
            face and headline read as one unit and we drop a whole labeled row. */}
        <div>
          <label className={LABEL}>{t.statementLabel}</label>
          <div className="flex items-center gap-2.5">
            {/* Wrapped in its own (non-clipping) relative box so the remove
                badge, which sits partially outside the circle, isn't cut off
                by the inner button's overflow-hidden (needed only to mask the
                photo into a circle). It was previously nested inside that
                button - both invisible-when-clipped and invalid HTML
                (interactive content inside a <button>). */}
            <div className="relative w-11 h-11 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full border border-border bg-surface overflow-hidden group hover:border-white/25 transition-colors"
                title={previewUrl ? t.photoChange : t.photoChoose}
                aria-label={previewUrl ? t.photoChange : t.photoChoose}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </span>
                  </>
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white/50 group-hover:text-white/80 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3A.75.75 0 002.25 4.5v15a.75.75 0 00.75.75h18a.75.75 0 00.75-.75v-15A.75.75 0 0021 3.75z" />
                    </svg>
                  </span>
                )}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageBlob(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  aria-label={t.photoRemove}
                  title={t.photoRemove}
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-surface border border-border rounded-full text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder={t.statementPlaceholder}
              value={name}
              onChange={(e) => setName(stripEmoji(e.target.value).slice(0, 40))}
              maxLength={40}
              className={`${INPUT} flex-1 min-w-0`}
              required
            />
          </div>
          <div className="flex items-start justify-between gap-3 mt-1.5">
            <p className="text-xs text-white/50 leading-snug">{t.statementHint}</p>
            <p translate="no" className={`text-xs text-white/50 tabular-nums shrink-0 notranslate ${name.length >= 36 ? 'text-red-400' : ''}`}>
              {name.length} / 40
            </p>
          </div>
          {imageError && <p className={ERROR}>{imageError}</p>}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Category */}
        <div>
          <label className={LABEL}>{t.categoryLabel}</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`${ROLE_COLORS[r]} text-white text-[11px] leading-none font-semibold px-2 py-1 rounded-full uppercase tracking-wide transition-all ${
                  role === r ? 'opacity-100 ring-2 ring-white/40' : 'opacity-40 hover:opacity-70'
                }`}
              >
                {t.roles[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className={LABEL}>{t.profileCountry}</label>
          <div ref={countryFieldRef} className="relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FlagImg code={countryCode} />
              </span>
              <input
                type="text"
                value={countryInput}
                onFocus={() => { setCountryMenuOpen(true); setCountryInput(''); }}
                onChange={(e) => { setCountryInput(e.target.value); setCountryMenuOpen(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setCountryMenuOpen(false); setCountryInput(getCountryOptionLabel(countryCode)); }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const match = findCountry(countryInput) ?? filteredCountries[0];
                    if (match) { setCountryCode(match.code); setCountryInput(getCountryOptionLabel(match.code)); setCountryMenuOpen(false); }
                  }
                }}
                autoComplete="off"
                className={`${INPUT} pl-9 pr-10`}
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
                aria-label="Toggle country list"
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
                      onClick={() => { setCountryCode(c.code); setCountryInput(getCountryOptionLabel(c.code)); setCountryMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
                    >
                      <FlagImg code={c.code} className="mr-2 inline-block align-middle shrink-0" />
                      {c.name}
                      <span className="ml-2 text-white/50">{c.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-white/50">No country found</div>
                )}
              </div>
            )}
          </div>
          <p className={HINT}>{t.profileCountryHint}</p>
        </div>

        {/* Description — emoji are allowed here (the statement stays text-only).
            The picker floats as an absolutely-positioned popover that opens
            upward, so opening it never changes the form's height. */}
        <div>
          <label className={LABEL}>{t.descriptionLabel}</label>
          <div ref={emojiWrapRef} className="relative">
            <textarea
              ref={descriptionRef}
              placeholder={t.descriptionPlaceholder}
              value={description}
              maxLength={255}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${INPUT} resize-none pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              aria-label={t.emojiAdd}
              title={t.emojiAdd}
              className={`absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors ${emojiOpen ? 'bg-white/5 text-white/80' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
            {emojiOpen && (
              <div className="absolute bottom-full right-0 mb-2 z-30">
                <EmojiPickerPopover onPick={insertEmoji} />
              </div>
            )}
          </div>
          <p translate="no" className={`${COUNTER} notranslate ${description.length >= 230 ? 'text-red-400' : ''}`}>
            {description.length} / 255
          </p>
        </div>

        {/* Attachments — image + link grouped with tight (8px) spacing so the
            two "Add ..." affordances sit together, not a full field-gap apart. */}
        <div className="space-y-2">
        {/* Optional image — collapsed to a single text affordance by default so
            the form reads as four core fields. Clicking opens the picker; once a
            file is chosen we show a compact preview with change / remove. */}
        <div>
          {contentPreviewUrl ? (
            <div className="relative group rounded-lg overflow-hidden border border-border bg-black/30">
              <img src={contentPreviewUrl} alt="" className="w-full h-auto max-h-44 object-contain" />
              <button
                type="button"
                onClick={() => contentFileInputRef.current?.click()}
                className="absolute bottom-2 left-2 px-2.5 py-1 text-[11px] font-medium bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-sm transition-opacity md:opacity-0 group-hover:opacity-100"
              >
                {t.contentImageChange}
              </button>
              <button
                type="button"
                onClick={() => {
                  setContentImageFile(null);
                  if (contentPreviewUrl) URL.revokeObjectURL(contentPreviewUrl);
                  setContentPreviewUrl(null);
                  setContentImageError(null);
                  if (contentFileInputRef.current) contentFileInputRef.current.value = '';
                }}
                aria-label={t.contentImageRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-opacity md:opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => contentFileInputRef.current?.click()}
              className="flex w-fit items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3A.75.75 0 002.25 4.5v15a.75.75 0 00.75.75h18a.75.75 0 00.75-.75v-15A.75.75 0 0021 3.75z" />
              </svg>
              {t.contentImageAdd}
            </button>
          )}
          {contentImageError && <p className={ERROR}>{contentImageError}</p>}
          <input ref={contentFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleContentFileChange} />
        </div>

        {/* Optional link — one URL, plain text for now (no OG/preview in MVP).
            Same collapsed-affordance pattern as the content image; sits next to
            it so future attachment types (e.g. video) slot in here too. */}
        <div>
          {linkOpen || link ? (
            <div>
              <label className={LABEL}>{t.linkLabel}</label>
              <div className="flex gap-2">
                <input
                  ref={linkInputRef}
                  type="url"
                  inputMode="url"
                  placeholder={t.linkPlaceholder}
                  value={link}
                  onChange={(e) => { setLink(e.target.value.slice(0, MAX_LINK_LENGTH)); setLinkError(null); }}
                  maxLength={MAX_LINK_LENGTH}
                  className={`${INPUT} flex-1 min-w-0`}
                />
                {canPaste && (
                  <button
                    type="button"
                    onClick={handlePasteLink}
                    className="shrink-0 px-3 rounded-lg border border-border text-xs font-medium text-white/70 hover:text-white hover:border-white/25 transition-colors"
                  >
                    {t.linkPaste}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setLink(''); setLinkError(null); setLinkOpen(false); }}
                  aria-label={t.linkRemove}
                  className="shrink-0 px-2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {linkError && <p className={ERROR}>{linkError}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setLinkOpen(true); requestAnimationFrame(() => linkInputRef.current?.focus()); }}
              className="flex w-fit items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              <LinkIcon />
              {t.linkAdd}
            </button>
          )}
        </div>
        </div>

        {isAnonymous ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-white/70">{t.nominateTooltip}</p>
            <button type="button" onClick={promptSignIn} className="shrink-0 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
              {t.login}
            </button>
          </div>
        ) : isBlocked ? (
          <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M2.697 16.126c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{t.blockedTitle}</p>
              <p className="text-sm text-white/70 mt-0.5">{t.blockedBody}</p>
              <p className="text-[11px] text-white/55 mt-2">
                <span className="text-white/50">{t.blockedUntilLabel}:</span>{' '}
                <span className="text-white/80 font-medium">
                  {blockedUntilDate!.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </p>
              <p className="text-[11px] text-white/50 mt-1.5">
                {renderTokens(t.blockedFooterNote, {
                  support: (
                    <button
                      type="button"
                      onClick={() => navigate('/support' + location.search)}
                      className="text-accent hover:text-accent/80 transition-colors"
                    >
                      {t.blockedFooterNoteSupportLabel}
                    </button>
                  ),
                })}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit || mutation.isPending}
            // Brand accent (#e94560) - the app-wide primary CTA color (matches
            // SupportModal / report / welcome). Disabled until the required
            // fields are valid, so it gates rather than validating post-click.
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? t.adding : t.dropButton}
          </button>
        )}
      </form>
      {!isMobile && (
        <aside className="md:flex md:flex-col md:w-96 md:shrink-0 border-l border-border bg-black/20 px-5 py-4">
          <div className="sticky top-4">
            {/* Same corner tag as mobile - overlays the card's top-right corner. */}
            <div className="relative">
              <span className="absolute -top-2 right-3 z-10 text-[10px] font-medium uppercase tracking-wide text-white/50 bg-surface border border-border rounded-full px-2 py-0.5 pointer-events-none">
                {t.previewCaption}
              </span>
              <OpinioPreviewCard
                name={name}
                role={role}
                countryCode={countryCode}
                description={description}
                avatarUrl={previewUrl}
                contentImageUrl={contentPreviewUrl}
                link={link}
              />
            </div>
            <p className="text-xs text-white/50 mt-2">{t.votesExpireNote}</p>
          </div>
        </aside>
      )}
      </div>
    </ModalShell>
  );
}
