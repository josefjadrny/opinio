import { EmojiPicker } from 'frimousse';
import { useI18n } from '../../i18n/I18nContext';

// frimousse ships its own locale list (for category labels / search). It has no
// Czech, so cs falls back to en; the rest map 1:1 to our UI locales. Our own
// chrome (search placeholder, empty state) stays fully translated via i18n.
const FRIMOUSSE_LOCALE: Record<string, 'en' | 'es' | 'de' | 'fr' | 'it' | 'pl'> = {
  en: 'en',
  cs: 'en',
  es: 'es',
  de: 'de',
  fr: 'fr',
  it: 'it',
  pl: 'pl',
};

// Self-hosted emojibase data (images.opinio.live S3, fronted by Cloudflare)
// instead of frimousse's jsdelivr default - keeps the picker on our own infra
// and off a third-party CDN. frimousse appends `/{locale}/{data,messages}.json`.
// The files are emojibase-data@17.0.0, mirrored under emoji/ in the bucket; the
// bucket needs a public GET CORS rule (ETag exposed) for the cross-origin fetch.
const EMOJIBASE_URL = 'https://images.opinio.live/emoji';

interface EmojiPickerPopoverProps {
  onPick: (emoji: string) => void;
}

// Headless frimousse picker styled to match the dark modal family
// (SettingsModal palette: bg-surface, border-border, accent focus). Fixed size
// so it overlays as a popover and never grows the form. Emoji data is fetched
// lazily from the emojibase CDN on first open and cached in memory.
export function EmojiPickerPopover({ onPick }: EmojiPickerPopoverProps) {
  const { t, locale } = useI18n();
  return (
    <EmojiPicker.Root
      locale={FRIMOUSSE_LOCALE[locale] ?? 'en'}
      emojibaseUrl={EMOJIBASE_URL}
      onEmojiSelect={({ emoji }) => onPick(emoji)}
      className="flex h-72 w-[18rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <EmojiPicker.Search
        placeholder={t.emojiSearch}
        className="m-2 rounded-lg border border-border bg-surface-light/40 px-2.5 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-accent"
      />
      <EmojiPicker.Viewport className="relative flex-1 outline-none">
        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
          …
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
          {t.emojiNone}
        </EmojiPicker.Empty>
        <EmojiPicker.List
          className="select-none pb-1.5"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                className="bg-surface px-2 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-white/50"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div className="scroll-my-1.5 px-1.5" {...props}>
                {children}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button
                className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-white/10"
                {...props}
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
