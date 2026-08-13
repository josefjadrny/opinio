import { useState, useEffect, useRef } from 'react';
import { ModalShell } from '../common/ModalShell';
import { LanguageSelect } from '../common/LanguageSelect';
import { CountryPicker } from '../common/CountryPicker';
import { Avatar } from '../profile/Avatar';
import { ActionChip } from '../common/ActionChip';
import { useBillingRedirect } from '../../hooks/useBillingRedirect';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';
import { type Locale } from '../../i18n/strings';
import { getCountryName } from '../../utils/countries';
import { FlagImg } from '../common/CountryFlag';
import { resizeImage } from '../../utils/resizeImage';
import { formatTimeUntil } from '../../utils/formatRelativeTime';
import { updateMe, createCheckoutSession, createPortalSession, uploadAvatar, resetAvatar } from '../../api/client';
import { useSignIn } from '../auth/SignInContext';
import { SignInIcon } from '../auth/SignInIcon';
import { useQueryClient } from '@tanstack/react-query';
import { isTwa } from '../../utils/twa';

const BIO_MAX_LENGTH = 100;

// Everything editable here (handle, bio, country, avatar) is also rendered by
// the public profile at /u/:id, which reads a separate ['user', id, locale]
// query with a 30s staleTime. Refresh both or the profile keeps showing the
// old value - most visibly, a cleared bio that stays on screen.
async function refreshIdentity(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['me'] }),
    queryClient.invalidateQueries({ queryKey: ['user'] }),
  ]);
}

// Same hint treatment as the add-opinio form (AddProfileModal's HINT) - the
// settings hints used to be text-white/30, which read as disabled text.
const HINT = 'text-xs text-white/50 leading-snug';

interface SettingsModalProps {
  onClose: () => void;
}


const SettingsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { data: me } = useMe();
  const { t, locale, setLocale } = useI18n();

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const displayName = isAnonymous ? t.anonymousUser : (user?.displayName ?? t.anonymousUser);

  return (
    <ModalShell onClose={onClose} title={t.settings} icon={<SettingsIcon />} maxWidth="max-w-sm" desktopScrollable>
      <SettingsContent
        displayName={displayName}
        user={user}
        isAnonymous={isAnonymous}
        t={t}
        locale={locale}
        setLocale={setLocale}
      />
    </ModalShell>
  );
}

function SettingsContent({
  displayName,
  user,
  isAnonymous,
  t,
  locale,
  setLocale,
}: {
  displayName: string;
  user: { avatarUrl: string | null; provider: string | null; tier?: string; countryCode: string | null; bio?: string | null; canChangeCountry?: boolean; countryChangeAvailableAt?: string | null } | undefined;
  isAnonymous: boolean;
  t: ReturnType<typeof useI18n>['t'];
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [bioValue, setBioValue] = useState(user?.bio ?? '');
  const [bioSaving, setBioSaving] = useState(false);
  const { promptSignIn } = useSignIn();

  useEffect(() => {
    setNameValue(displayName);
  }, [displayName]);

  const savedBio = user?.bio ?? '';
  useEffect(() => {
    setBioValue(savedBio);
  }, [savedBio]);

  // Country changes are throttled to once per 24h server-side. Lock the
  // selector + show a countdown while the cooldown is active.
  const countryLockedUntil = user?.countryChangeAvailableAt
    ? new Date(user.countryChangeAvailableAt)
    : null;
  const countryLocked = !!countryLockedUntil && countryLockedUntil.getTime() > Date.now();
  const canChangeCountry = (user?.canChangeCountry ?? false) && !countryLocked;

  const handleCountryChange = async (code: string) => {
    setSaving(true);
    try {
      await updateMe({ countryCode: code });
    } catch {
      // e.g. 429 cooldown — refetching `me` surfaces the lock + countdown.
    } finally {
      await refreshIdentity(queryClient);
      setSaving(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setNameValue(filtered);
    setNameError(null);
  };

  const handleNameBlur = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === displayName) return;
    if (!/^[a-z0-9_]{4,30}$/.test(trimmed)) {
      setNameError(t.displayNameFormat);
      return;
    }
    setNameSaving(true);
    setNameError(null);
    try {
      await updateMe({ displayName: trimmed });
      await refreshIdentity(queryClient);
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      setNameError(status === 409 ? t.displayNameTaken : t.displayNameFormat);
    } finally {
      setNameSaving(false);
    }
  };

  // Saved on blur like the handle above. An empty value is a real update
  // (it clears the bio), so this compares against the saved value rather
  // than checking for emptiness.
  const handleBioBlur = async () => {
    const trimmed = bioValue.trim();
    if (trimmed === savedBio) return;
    setBioSaving(true);
    try {
      await updateMe({ bio: trimmed });
      await refreshIdentity(queryClient);
    } catch {
      setBioValue(savedBio);
    } finally {
      setBioSaving(false);
    }
  };

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <AvatarEditor
          displayName={displayName}
          avatarUrl={user?.avatarUrl ?? null}
          isAnonymous={isAnonymous}
          t={t}
        />
        <div className="min-w-0 flex flex-col gap-0.5 items-start">
          <p className="text-sm font-medium text-white truncate">{isAnonymous ? displayName : `@${displayName}`}</p>
          <div className="flex items-center gap-1">
            <p className="text-xs text-white/50">
              {isAnonymous
                ? t.notLoggedIn
                : user?.tier === 'supporter'
                ? 'Supporter'
                : user?.tier === 'admin'
                ? 'Admin'
                : 'Registered user'}
            </p>
            {user?.tier === 'supporter' && <span aria-hidden className="text-xs leading-none">❤️</span>}
            {user?.tier === 'admin' && <span aria-hidden className="text-xs leading-none">❤️</span>}
          </div>
          {isAnonymous && (
            <ActionChip onClick={promptSignIn} className="mt-1">
              <SignInIcon className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </ActionChip>
          )}
          {/* Stripe redirects (checkout + customer portal) are hidden inside the
              Play TWA — Play Billing policy forbids selling/managing the
              subscription outside Play Billing. Web + PWA keep them. */}
          {!isAnonymous && user?.tier === 'registered' && !isTwa() && <UpgradeChip t={t} />}
          {!isAnonymous && user?.tier === 'supporter' && !isTwa() && <ManageSubscriptionLink t={t} />}
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-xs font-medium text-white/80 mb-1.5">{t.displayName}</label>
        <div className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
          isAnonymous
            ? 'border-border opacity-60 cursor-not-allowed'
            : nameError
            ? 'border-red-500/60 focus-within:border-red-500/60'
            : 'border-border focus-within:border-accent'
        }`}>
          <span className="select-none text-white/50 shrink-0">@</span>
          <input
            type="text"
            value={nameValue}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
            maxLength={30}
            disabled={isAnonymous || nameSaving}
            className="flex-1 min-w-0 bg-transparent text-white focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
      </div>

      {/* Bio - same counter treatment as the opinio description field */}
      <div>
        <label className="block text-xs font-medium text-white/80 mb-1.5">{t.bio}</label>
        <textarea
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value)}
          onBlur={handleBioBlur}
          placeholder={t.bioPlaceholder}
          maxLength={BIO_MAX_LENGTH}
          rows={3}
          disabled={isAnonymous || bioSaving}
          className={`w-full px-3 py-2 rounded-lg border bg-transparent text-sm text-white placeholder-white/30 resize-none focus:outline-none transition-colors disabled:cursor-not-allowed ${
            isAnonymous ? 'border-border opacity-60' : 'border-border focus:border-accent'
          }`}
        />
        <div className="flex items-start justify-between gap-3 mt-1.5">
          <p className={HINT}>{t.bioHint}</p>
          <p translate="no" className={`text-xs text-white/50 tabular-nums shrink-0 notranslate ${bioValue.length >= BIO_MAX_LENGTH - 15 ? 'text-red-400' : ''}`}>
            {bioValue.length} / {BIO_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-medium text-white/80 mb-1.5">{t.country}</label>
        {canChangeCountry ? (
          <CountryPicker
            value={user?.countryCode ?? null}
            onChange={(code) => code && handleCountryChange(code)}
            disabled={saving}
            placeholder="- select -"
          />
        ) : (
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 opacity-60 cursor-not-allowed">
            {user?.countryCode ? (
              <>
                <FlagImg code={user.countryCode} className="inline-block align-middle shrink-0" />
                <span className="text-sm text-white">{getCountryName(user.countryCode, locale)}</span>
              </>
            ) : (
              <span className="text-sm text-white">-</span>
            )}
          </div>
        )}
        {user?.countryCode ? (
          countryLocked ? (
            <p className={`${HINT} mt-1.5`}>
              {t.countryChangeLocked.replace('{time}', formatTimeUntil(user!.countryChangeAvailableAt!, locale))}
            </p>
          ) : (
            !canChangeCountry && <p className={`${HINT} mt-1.5`}>{t.detectedFromIp}</p>
          )
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-accent/80 mt-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M2.697 16.126c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
            </svg>
            <span>{isAnonymous ? t.noCountryWarning : t.noCountryWarningRegistered}</span>
          </p>
        )}
        <p className={`${HINT} mt-1.5`}>{t.countryHint}</p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-white/80 mb-1.5">{t.language}</label>
        <LanguageSelect value={locale} onChange={setLocale} />
        <p className={`${HINT} mt-1.5`}>{t.languageHint}</p>
      </div>
    </div>
  );
}

function AvatarEditor({
  displayName,
  avatarUrl,
  isAnonymous,
  t,
}: {
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = () => {
    if (isAnonymous || busy) return;
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const blob = await resizeImage(file);
      await uploadAvatar(blob);
      await refreshIdentity(queryClient);
    } catch (err) {
      setError((err as { message?: string } | null)?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (isAnonymous || busy || !avatarUrl) return;
    setError(null);
    setBusy(true);
    try {
      await resetAvatar();
      await refreshIdentity(queryClient);
    } catch (err) {
      setError((err as { message?: string } | null)?.message || 'Failed to reset');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Same pattern as AddProfileModal's card-image picker: the remove
          control is a sibling badge in a plain relative wrapper, not nested
          inside the picker button, so it can't get clipped by (or conflict
          with) the button's own rounding/hover state. */}
      <div className="relative w-16 h-16">
        <button
          type="button"
          onClick={handlePick}
          disabled={isAnonymous || busy}
          className="w-16 h-16 rounded-full group disabled:cursor-not-allowed"
          title={isAnonymous ? undefined : t.photoChange}
        >
          <Avatar name={displayName} imageUrl={avatarUrl} className="w-16 h-16" isAnonymous={isAnonymous} />
          {!isAnonymous && (
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </span>
          )}
        </button>
        {!isAnonymous && avatarUrl && !busy && (
          <button
            type="button"
            onClick={handleReset}
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
      {error && <p className="text-[11px] text-red-400 text-center max-w-[5rem]">{error}</p>}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function UpgradeChip({ t }: { t: ReturnType<typeof useI18n>['t'] }) {
  const { loading, handleClick } = useBillingRedirect(createCheckoutSession);
  return (
    <ActionChip onClick={handleClick} disabled={loading} className="mt-1">
      <span aria-hidden>❤️</span>
      <span>{loading ? `${t.upgradeBanner}…` : t.upgradeBanner}</span>
    </ActionChip>
  );
}

function ManageSubscriptionLink({ t }: { t: ReturnType<typeof useI18n>['t'] }) {
  const { loading, handleClick } = useBillingRedirect(createPortalSession);
  return (
    <ActionChip onClick={handleClick} disabled={loading} className="mt-1">
      <span>{loading ? `${t.manageSubscription}…` : t.manageSubscription}</span>
    </ActionChip>
  );
}
