import { useState } from 'react';
import { ModalShell } from '../common/ModalShell';
import { Avatar } from '../profile/Avatar';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';
import { LANGUAGES, type Locale } from '../../i18n/strings';
import { getCountryFlag, getCountryName, ALL_COUNTRIES } from '../../utils/countries';
import { loginWithGoogle, updateMe } from '../../api/client';
import { useQueryClient } from '@tanstack/react-query';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsIcon = () => (
  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { data: me } = useMe();
  const { t, locale, setLocale } = useI18n();

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const displayName = isAnonymous ? t.anonymousUser : (user?.displayName ?? t.anonymousUser);

  return (
    <ModalShell onClose={onClose} title={t.settings} icon={<SettingsIcon />} maxWidth="max-w-sm">
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
  user: { avatarUrl: string | null; provider: string | null; tier?: string; countryCode: string | null; canChangeCountry?: boolean } | undefined;
  isAnonymous: boolean;
  t: ReturnType<typeof useI18n>['t'];
  locale: string;
  setLocale: (l: Locale) => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const canChangeCountry = user?.canChangeCountry ?? false;

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (!code) return;
    setSaving(true);
    try {
      await updateMe({ countryCode: code });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } finally {
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
    if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
      setNameError(t.displayNameFormat);
      return;
    }
    setNameSaving(true);
    setNameError(null);
    try {
      await updateMe({ displayName: trimmed });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (err: any) {
      setNameError(err?.status === 409 ? t.displayNameTaken : t.displayNameFormat);
    } finally {
      setNameSaving(false);
    }
  };

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <Avatar name={displayName} imageUrl={user?.avatarUrl ?? null} className="w-16 h-16" isAnonymous={isAnonymous} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{isAnonymous ? displayName : `@${displayName}`}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-xs text-white/40">
              {isAnonymous
                ? t.notLoggedIn
                : user?.tier === 'supporter'
                ? 'Supporter'
                : user?.tier === 'admin'
                ? 'Admin'
                : 'Registered user'}
            </p>
            {user?.tier === 'supporter' && <span className="text-red-400 text-xs leading-none">❤</span>}
            {user?.tier === 'admin' && <span className="text-red-400 text-xs leading-none">❤</span>}
          </div>
          {isAnonymous && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="text-xs text-accent/80 hover:text-accent mt-1 underline underline-offset-2 transition-colors"
            >
              {t.loginToUnlock}
            </button>
          )}
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.displayName}</label>
        <div className={`flex items-center rounded-lg border text-sm transition-colors ${
          isAnonymous
            ? 'bg-white/5 border-white/10 cursor-not-allowed'
            : nameError
            ? 'border-red-500/60 bg-surface'
            : 'border-border bg-surface focus-within:border-accent'
        }`}>
          <span className={`pl-3 select-none ${isAnonymous ? 'text-white/20' : 'text-white/40'}`}>@</span>
          <input
            type="text"
            value={nameValue}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
            maxLength={30}
            disabled={isAnonymous || nameSaving}
            className={`flex-1 bg-transparent px-1.5 py-2 focus:outline-none ${
              isAnonymous ? 'text-white/40 cursor-not-allowed' : 'text-white'
            }`}
          />
        </div>
        {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.country}</label>
        {canChangeCountry ? (
          <select
            value={user?.countryCode ?? ''}
            onChange={handleCountryChange}
            disabled={saving}
            className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent disabled:opacity-50"
            style={{ backgroundColor: '#1a1a2e' }}
          >
            <option value="" disabled style={{ backgroundColor: '#1a1a2e', color: 'white' }}>— select —</option>
            {ALL_COUNTRIES.map(({ code, name }) => (
              <option key={code} value={code} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                {getCountryFlag(code)} {name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-not-allowed">
            {user?.countryCode ? (
              <>
                <span className="text-lg leading-none">{getCountryFlag(user.countryCode)}</span>
                <span className="text-sm text-white/40">{getCountryName(user.countryCode)}</span>
              </>
            ) : (
              <span className="text-sm text-white/40">—</span>
            )}
          </div>
        )}
        <p className="text-xs text-white/30 mt-1">{t.detectedFromIp}</p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.language}</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <option key={key} value={key} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
