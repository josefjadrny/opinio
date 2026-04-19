import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useMe } from '../../hooks/useMe';
import { loginWithGoogle } from '../../api/client';
import { Avatar } from '../profile/Avatar';
import { getCountryFlag } from '../../utils/countries';
import {
  useSupportTickets, useCreateTicket,
  useUpdateStatus, useUpdateReply, useUpdateNote,
} from '../../hooks/useSupport';
import type { SupportTicket, SupportTicketCategory } from '../../types/api';

interface SupportModalProps {
  onClose: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

// ── Category ───────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  bug: '🔧',
  feature: '💡',
  subscription: '💳',
  account: '👤',
  other: '📋',
};

// ── Tier badge ─────────────────────────────────────────────────────────────

const TIER_CLASSES: Record<string, string> = {
  registered: 'text-white/40',
  supporter: 'text-red-400',
  admin: 'text-red-400',
};

function TierBadge({ tier }: { tier: string | null | undefined }) {
  if (!tier || tier === 'anonymous') return null;
  const label = tier === 'supporter' ? 'Supporter ❤' : tier === 'admin' ? 'Admin ❤' : 'Registered';
  return <span className={`text-xs ${TIER_CLASSES[tier] ?? 'text-white/40'}`}>{label}</span>;
}

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  new: 'bg-accent/20 text-accent border border-accent/30',
  investigating: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  waiting: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  done: 'bg-positive/20 text-positive border border-positive/30',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status] ?? 'bg-white/10 text-white/50'}`}>
      {label}
    </span>
  );
}

// ── Date formatting ────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false, timeZoneName: 'short',
  });
}

// ── Ticket list ────────────────────────────────────────────────────────────

function TicketList({
  tickets,
  isAdmin,
  onSelect,
  onNew,
  t,
}: {
  tickets: SupportTicket[];
  isAdmin: boolean;
  onSelect: (ticket: SupportTicket) => void;
  onNew: () => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  return (
    <div className="px-6 py-5 flex flex-col gap-4">
      {!isAdmin && (
        <p className="text-sm text-white/40 leading-relaxed">{t.supportOverview}</p>
      )}
      <div className="flex justify-end">
        {!isAdmin && (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t.supportNewTicket}
          </button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-white/30">
          <span className="text-4xl">🎫</span>
          <p className="text-sm">{t.supportNoTickets}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket)}
              className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none shrink-0">{CATEGORY_ICONS[ticket.category] ?? '📋'}</span>
                  <p className="text-sm text-white font-medium truncate">{ticket.title}</p>
                </div>
                <StatusBadge status={ticket.status} label={t.supportStatuses[ticket.status] ?? ticket.status} />
              </div>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                {isAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Avatar
                      name={ticket.userDisplayName ?? '?'}
                      imageUrl={ticket.userAvatarUrl ?? null}
                      className="w-4 h-4"
                      isAnonymous={false}
                    />
                    <span className="text-xs text-white/50 truncate max-w-28">{ticket.userDisplayName}</span>
                    {ticket.userCountryCode && (
                      <span className="text-xs leading-none">{getCountryFlag(ticket.userCountryCode)}</span>
                    )}
                    <TierBadge tier={ticket.userTier} />
                  </div>
                )}
                {isAdmin && <span className="text-white/20 text-xs">·</span>}
                <span className="text-xs text-white/30">{formatDate(ticket.createdAt)}</span>
                {ticket.adminReply && (
                  <>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-positive/70">Reply sent</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create form ────────────────────────────────────────────────────────────

const CATEGORIES: SupportTicketCategory[] = ['bug', 'feature', 'subscription', 'account', 'other'];

function CreateForm({
  onBack,
  t,
}: {
  onBack: () => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('bug');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync, isPending } = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await mutateAsync({ title: title.trim(), description: description.trim(), category });
      onBack();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
      <BackButton onClick={onBack} label={t.supportBack} />

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.supportCategoryLabel}</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                category === cat
                  ? 'border-accent/60 bg-accent/20 text-white'
                  : 'border-border text-white/50 hover:border-white/30 hover:text-white/70'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {t.supportCategories[cat]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.supportTitleLabel}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.supportTitlePlaceholder}
          maxLength={255}
          required
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent bg-transparent placeholder:text-white/25"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.supportDescriptionLabel}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.supportDescriptionPlaceholder}
          rows={5}
          maxLength={5000}
          required
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent bg-transparent placeholder:text-white/25 resize-none"
        />
        <p className="text-xs text-white/25 text-right mt-0.5">{description.length}/5000</p>
      </div>

      {error && <p className="text-xs text-negative">{error}</p>}

      <button
        type="submit"
        disabled={isPending || !title.trim() || !description.trim()}
        className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? t.supportSubmitting : t.supportSubmit}
      </button>
    </form>
  );
}

// ── Ticket detail ──────────────────────────────────────────────────────────

function TicketDetail({
  ticket,
  isAdmin,
  onBack,
  t,
}: {
  ticket: SupportTicket;
  isAdmin: boolean;
  onBack: () => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const { mutate: updateStatus, isPending: statusPending } = useUpdateStatus();
  const { mutateAsync: saveReply, isPending: replyPending } = useUpdateReply();
  const { mutateAsync: saveNote, isPending: notePending } = useUpdateNote();

  const [adminReply, setAdminReply] = useState(ticket.adminReply ?? '');
  const [adminNote, setAdminNote] = useState(ticket.adminNote ?? '');
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveReply = async () => {
    await saveReply({ id: ticket.id, adminReply });
    setSaveMsg('reply');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleSaveNote = async () => {
    await saveNote({ id: ticket.id, adminNote });
    setSaveMsg('note');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const ADMIN_STATUSES = ['new', 'investigating', 'waiting', 'done'];

  return (
    <div className="px-6 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <BackButton onClick={onBack} label={t.supportBack} />
        <StatusBadge status={ticket.status} label={t.supportStatuses[ticket.status] ?? ticket.status} />
      </div>

      {/* Header */}
      <div className="flex items-start gap-2.5">
        <span className="text-2xl leading-none mt-0.5">{CATEGORY_ICONS[ticket.category]}</span>
        <div>
          <h3 className="text-base font-semibold text-white">{ticket.title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-white/30">{t.supportCategories[ticket.category]} · {formatDateTime(ticket.createdAt)}</span>
            {isAdmin && (
              <>
                <span className="text-white/20 text-xs">·</span>
                <Avatar name={ticket.userDisplayName ?? '?'} imageUrl={ticket.userAvatarUrl ?? null} className="w-4 h-4" isAnonymous={false} />
                <span className="text-xs text-white/50">{ticket.userDisplayName}</span>
                {ticket.userCountryCode && <span className="text-xs leading-none">{getCountryFlag(ticket.userCountryCode)}</span>}
                <TierBadge tier={ticket.userTier} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border bg-white/[0.03] px-4 py-3">
        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
      </div>

      {/* Admin reply (visible to user too) */}
      {!isAdmin && ticket.adminReply && (
        <div className="rounded-xl border border-positive/30 bg-positive/5 px-4 py-3">
          <p className="text-xs font-medium text-positive mb-1.5">Reply from support</p>
          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{ticket.adminReply}</p>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="flex flex-col gap-4 pt-1 border-t border-border">
          {/* Status picker */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">{t.supportStatusLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {ADMIN_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={statusPending}
                  onClick={() => updateStatus({ id: ticket.id, status: s })}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                    ticket.status === s
                      ? STATUS_CLASSES[s]
                      : 'border-border text-white/40 hover:border-white/30 hover:text-white/60'
                  } disabled:opacity-50`}
                >
                  {t.supportStatuses[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Reply textarea */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">{t.supportAdminReply}</label>
            <textarea
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent bg-transparent placeholder:text-white/25 resize-none"
              placeholder="Write a reply visible to the user…"
            />
            <div className="flex items-center justify-between mt-1">
              {saveMsg === 'reply' && <span className="text-xs text-positive">Saved</span>}
              {saveMsg !== 'reply' && <span />}
              <button
                type="button"
                onClick={handleSaveReply}
                disabled={replyPending}
                className="text-xs px-3 py-1 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 disabled:opacity-50 transition-colors"
              >
                {t.supportSave}
              </button>
            </div>
          </div>

          {/* Internal note */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              {t.supportAdminNote}
              <span className="ml-1 text-white/25">(internal)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              maxLength={5000}
              className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent bg-transparent placeholder:text-white/25 resize-none"
              placeholder="Internal notes — never shown to the user"
            />
            <div className="flex items-center justify-between mt-1">
              {saveMsg === 'note' && <span className="text-xs text-positive">Saved</span>}
              {saveMsg !== 'note' && <span />}
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={notePending}
                className="text-xs px-3 py-1 rounded-lg bg-white/5 text-white/50 border border-border hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                {t.supportSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close ticket (user only, not done) */}
      {!isAdmin && ticket.status !== 'done' && (
        <button
          type="button"
          onClick={() => updateStatus({ id: ticket.id, status: 'done' })}
          disabled={statusPending}
          className="w-full py-2 rounded-lg border border-border text-white/50 text-sm hover:bg-white/5 hover:text-white/70 disabled:opacity-40 transition-colors"
        >
          {t.supportClose}
        </button>
      )}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────

type View = 'list' | 'create' | { type: 'detail'; ticket: SupportTicket };

function SupportContent() {
  const { t } = useI18n();
  const { data: me } = useMe();
  const { data: tickets = [], isLoading } = useSupportTickets();
  const [view, setView] = useState<View>('list');

  const isAnonymous = !me?.user || me.user.tier === 'anonymous';
  const isAdmin = me?.user?.tier === 'admin';

  if (isAnonymous) {
    return (
      <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">🔒</span>
        <p className="text-sm text-white/50">{t.supportSignIn}</p>
        <button onClick={loginWithGoogle} className="mt-1 text-xs text-accent hover:text-accent/80 transition-colors">
          {t.login} →
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <p className="px-6 py-8 text-sm text-white/40 text-center">{t.loading}</p>;
  }

  if (view === 'create') {
    return <CreateForm onBack={() => setView('list')} t={t} />;
  }

  if (typeof view === 'object' && view.type === 'detail') {
    // Find updated ticket from query cache
    const fresh = tickets.find(t => t.id === view.ticket.id) ?? view.ticket;
    return (
      <TicketDetail
        ticket={fresh}
        isAdmin={isAdmin}
        onBack={() => setView('list')}
        t={t}
      />
    );
  }

  return (
    <TicketList
      tickets={tickets}
      isAdmin={isAdmin}
      onSelect={(ticket) => setView({ type: 'detail', ticket })}
      onNew={() => setView('create')}
      t={t}
    />
  );
}

export function SupportModal({ onClose }: SupportModalProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const header = (compact: boolean) => (
    <div className={`flex items-center justify-between px-6 ${compact ? 'py-3' : 'py-4'} border-b border-border`}>
      <div className="flex items-center gap-2">
        <SupportIcon className="w-5 h-5 text-white/40" />
        <h2 className="text-base font-semibold text-white">{t.supportTitle}</h2>
      </div>
      <CloseButton onClose={onClose} />
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          {header(true)}
          <SupportContent />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        {header(false)}
        <SupportContent />
      </div>
    </div>
  );
}
