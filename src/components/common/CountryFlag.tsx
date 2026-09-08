import { getCountryName, getCountryFlag } from '../../utils/countries';
import { useI18n } from '../../i18n/I18nContext';

// Cached once — checks whether the browser renders flag emoji as colored glyphs.
// On Linux/Mac it does; on Windows 11 they render as flat letter-pairs.
let _flagEmojiSupported: boolean | null = null;
function flagEmojiSupported(): boolean {
  if (_flagEmojiSupported !== null) return _flagEmojiSupported;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (!ctx) return (_flagEmojiSupported = false);
    ctx.font = '8px sans-serif';
    ctx.fillText('🇺🇸', 0, 8);
    const { data } = ctx.getImageData(0, 0, 10, 10);
    for (let i = 0; i < data.length; i += 4) {
      // A colored (non-grayscale) pixel means the OS rendered a real flag emoji.
      if (data[i + 3] > 0 && (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2])) {
        return (_flagEmojiSupported = true);
      }
    }
    return (_flagEmojiSupported = false);
  } catch {
    return (_flagEmojiSupported = false);
  }
}

// `size` is the flag's rendered WIDTH in px, for the few places that want one
// larger than body text (the map caption's 52px mark). Both branches have to
// honour it: the emoji branch sizes by font-size, the sprite branch by its box,
// and the sprite's 4:3 ratio is what keeps the two the same shape. Default keeps
// the inline-with-text size every existing caller relies on.
export function FlagImg({ code, className = '', size }: { code: string; className?: string; size?: number }) {
  if (flagEmojiSupported()) {
    return (
      <span
        className={`inline-block align-middle shrink-0 ${className}`}
        style={size ? { fontSize: size, lineHeight: 1 } : undefined}
      >
        {getCountryFlag(code)}
      </span>
    );
  }
  return (
    <span
      className={`fi fi-${code.toLowerCase()} inline-block shrink-0 ${className}`}
      style={{ width: size ?? 20, height: size ? Math.round(size * 0.75) : 15, fontSize: 'initial' }}
      title={code}
    />
  );
}

export function CountryFlag({ code, showName = false }: { code: string; showName?: boolean }) {
  const { locale } = useI18n();
  return (
    <span className="inline-flex items-center gap-1" title={getCountryName(code, locale)}>
      <FlagImg code={code} />
      {showName && <span className="text-xs text-text-secondary">{getCountryName(code, locale)}</span>}
    </span>
  );
}
