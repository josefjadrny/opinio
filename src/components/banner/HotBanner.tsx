import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '../profile/Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { useRealtimeProfiles } from '../../hooks/useRealtimeProfiles';
import { useI18n } from '../../i18n/I18nContext';
import { FlagImg } from '../common/CountryFlag';

const FADE_IN_MS = 500;
const HOLD_MS = 6_000;
const FADE_OUT_MS = 500;
const GAP_MS = 3_000;

type Phase = 'in' | 'hold' | 'out' | 'gap';

export function HotBanner({
  enabled,
  mobile = false,
  onVisibilityChange,
}: {
  enabled: boolean;
  mobile?: boolean;
  // Desktop only: the map caption sits in this exact slot and is 20px taller
  // than this card, so covering it left a strip of caption poking out below.
  // It yields instead - see MapProfileTitle's `suppressed`.
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const { next, dequeue, queueLength } = useRealtimeProfiles(enabled);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('in');
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const prevQueueLen = useRef(queueLength);

  // Reset to fade-in (and unpause) whenever a new profile arrives.
  useEffect(() => {
    if (!next) return;
    setPhase('in');
    setPaused(false);
  }, [next]);

  // Mobile tap-to-dismiss hides the banner; bring it back only when a
  // genuinely new profile arrives (queue grows). Advancing the queue head via
  // dequeue shrinks the queue, so it must not clear the dismissal.
  useEffect(() => {
    if (queueLength > prevQueueLen.current) setDismissed(false);
    prevQueueLen.current = queueLength;
  }, [queueLength]);

  // One timer per phase. Pausing freezes the chain; resuming continues from
  // wherever we left off. Hovering during 'out' snaps back to 'hold' so the
  // banner is fully opaque while the cursor is on it.
  useEffect(() => {
    if (!next || paused) return;
    const ms =
      phase === 'in' ? FADE_IN_MS :
      phase === 'hold' ? HOLD_MS :
      phase === 'out' ? FADE_OUT_MS :
      GAP_MS;
    const timer = window.setTimeout(() => {
      if (phase === 'in') setPhase('hold');
      else if (phase === 'hold') setPhase('out');
      else if (phase === 'out') setPhase('gap');
      else dequeue();
    }, ms);
    return () => clearTimeout(timer);
  }, [next, phase, paused, dequeue]);

  // During the 3s gap the banner must not exist in DOM — otherwise its
  // (invisible at opacity 0) hitbox would capture clicks and navigate to the
  // profile that just faded out.
  const showBanner = !!(enabled && next && phase !== 'gap' && !dismissed);

  useEffect(() => {
    onVisibilityChange?.(showBanner);
  }, [showBanner, onVisibilityChange]);

  // Unmounting (route change, width change) must not leave the caption hidden.
  useEffect(() => () => onVisibilityChange?.(false), [onVisibilityChange]);

  // Mobile-only: any tap dismisses the banner. A tap on the card also opens
  // the profile via its own onClick; a tap anywhere else just clears it.
  // Drop it from the queue too, so a backlog item doesn't pop straight back up.
  useEffect(() => {
    if (!mobile || !showBanner) return;
    const onDocClick = () => {
      setDismissed(true);
      dequeue();
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [mobile, showBanner, dequeue]);

  const onHoverStart = () => {
    setPaused(true);
    if (phase === 'out') setPhase('hold');
  };
  const onHoverEnd = () => setPaused(false);

  if (!enabled || !next || phase === 'gap' || dismissed) return null;

  const go = () => navigate('/p/' + next.id + location.search);
  const inAnim = mobile ? 'hot-banner-in-up' : 'hot-banner-in';
  const outAnim = mobile ? 'hot-banner-out-down' : 'hot-banner-out';
  const animation =
    phase === 'in'
      ? `${inAnim} ${FADE_IN_MS}ms ease-out forwards`
      : phase === 'out'
        ? `${outAnim} ${FADE_OUT_MS}ms ease-in forwards`
        : undefined;

  return (
    <div
      className={
        mobile
          ? 'px-2 pb-2 pointer-events-none'
          : 'absolute left-1/2 -translate-x-1/2 top-2 z-20 w-[min(700px,90vw)] pointer-events-none'
      }
      data-testid="hot-banner-wrapper"
    >
      <div
        role="link"
        tabIndex={0}
        aria-label={`Open ${next.name}`}
        onClick={go}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}
        onMouseEnter={mobile ? undefined : onHoverStart}
        onMouseLeave={mobile ? undefined : onHoverEnd}
        data-testid="hot-banner"
        className={`cursor-pointer border border-orange-500/70 rounded-2xl
                   flex items-center gap-3 px-4 py-3 select-none
                   transition-colors pointer-events-auto ${
                     mobile
                       ? 'bg-surface/70 backdrop-blur-sm hover:bg-surface/80'
                       : 'bg-surface/85 backdrop-blur-md hover:bg-surface/95'
                   }`}
        style={{
          animation,
          opacity: phase === 'hold' ? 1 : undefined,
          boxShadow: '0 0 0 1px rgba(249,115,22,0.35), 0 10px 30px -10px rgba(249,115,22,0.55), 0 18px 50px -20px rgba(0,0,0,0.6)',
        }}
      >
        <Avatar name={next.name} imageUrl={next.imageUrl} className="w-12 h-12" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-orange-400 mb-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5 align-middle animate-pulse" />
            {t.justReported}
          </div>
          <div className="flex items-center gap-2 mb-0.5">
            <RoleBadge role={next.role} />
            <span className="text-white text-sm font-semibold truncate">{next.name}</span>
          </div>
          <div className="text-white/60 text-xs line-clamp-2">{next.description}</div>
        </div>
        <FlagImg code={next.countryCode} className="shrink-0 inline-block align-middle" />
      </div>
    </div>
  );
}
