import React from 'react';

const MAX_SEGMENT_LEN = 48;

function splitIntoSegments(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const byComma = normalized.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
  if (byComma.length >= 2) return byComma;
  const bySlash = normalized.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  if (bySlash.length >= 2) return bySlash;
  const byBullet = normalized.split(/\s*[·•]\s*/).map((s) => s.trim()).filter(Boolean);
  if (byBullet.length >= 2) return byBullet;
  return [normalized];
}

function isShortList(parts) {
  if (parts.length < 2) return false;
  return Math.max(...parts.map((p) => p.length)) <= MAX_SEGMENT_LEN;
}

function capitalizeFirstLetter(segment) {
  const s = segment.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function capitalizeSentenceStart(text) {
  const s = text.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function splitIntroAndList(text) {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  const inclusMatch = trimmed.match(/^(.*?)\n+\s*Inclus\s*:\s*([\s\S]*)$/i);
  if (inclusMatch) {
    return { intro: inclusMatch[1].trim(), list: inclusMatch[2].trim(), listLabel: 'Inclus' };
  }
  const optionsMatch = trimmed.match(/^(.*?)\n+\s*Options\s*:\s*([\s\S]*)$/i);
  if (optionsMatch) {
    return { intro: optionsMatch[1].trim(), list: optionsMatch[2].trim(), listLabel: 'Options' };
  }
  return { intro: null, list: trimmed.replace(/\s+/g, ' '), listLabel: null };
}

function ChipList({ text }) {
  const rawParts = splitIntoSegments(text);
  const useMultipleFrames = rawParts.length >= 2 && isShortList(rawParts);
  const parts = useMultipleFrames ? rawParts : [text.replace(/\s+/g, ' ').trim()];

  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((part, i) => {
        const label = useMultipleFrames
          ? capitalizeFirstLetter(part)
          : capitalizeSentenceStart(part);
        return (
          <span
            key={i}
            className="inline-flex max-w-full items-center rounded border border-cafe-200/90 bg-cafe-50/80 px-2 py-0.5 text-xs font-medium text-cafe-800 shadow-sm"
          >
            <span className="truncate">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

const MenuItemDescription = ({ text, className = '' }) => {
  if (!text?.trim()) return null;

  const { intro, list, listLabel } = splitIntroAndList(text);

  return (
    <div className={`space-y-2 ${className}`}>
      {intro ? (
        <p className="text-sm leading-relaxed text-cafe-700">{capitalizeSentenceStart(intro)}</p>
      ) : null}
      {list ? (
        <div className="space-y-1">
          {listLabel && intro ? (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cafe-500">
              {listLabel}
            </p>
          ) : null}
          <ChipList text={list} />
        </div>
      ) : null}
    </div>
  );
};

export default MenuItemDescription;
