// src/overlays/label-formatter.js - Country Map Overlay Text Compaction & Canvas Dimension Measurement
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let measureCtx = null;
  function getMeasureCtx() {
    if (!measureCtx) {
      const c = document.createElement('canvas');
      measureCtx = c.getContext('2d');
    }
    return measureCtx;
  }

  function resolveCountryScriptMeta(c) {
    const { ISO_SCRIPT_OVERRIDES, ARABIC_SCRIPT_ISOS } = E.config;
    const iso = (c.iso3 || '').toUpperCase();
    if (ISO_SCRIPT_OVERRIDES[iso]) {
      const [shortName, glyph, fullDetail] = ISO_SCRIPT_OVERRIDES[iso];
      return { shortName, glyph, fullDetail };
    }
    if (ARABIC_SCRIPT_ISOS.has(iso)) {
      return { shortName: 'Arabic', glyph: 'ع', fullDetail: 'Arabic Abjad' };
    }
    const raw = (c.languages && c.languages[0] && c.languages[0].script) || '';
    const cleaned = raw.trim();
    if (cleaned && cleaned !== 'Official National Script' && cleaned !== 'National Script') {
      if (/^Latin/i.test(cleaned)) {
        const hasExtra = cleaned.length > 6;
        return {
          shortName: 'Latin',
          glyph: 'Aa',
          fullDetail: hasExtra ? cleaned : 'Latin Alphabet'
        };
      }
      if (/Cyrillic/i.test(cleaned)) return { shortName: 'Cyrillic', glyph: 'АБ', fullDetail: cleaned };
      if (/Arabic/i.test(cleaned)) return { shortName: 'Arabic', glyph: 'ع', fullDetail: cleaned };
      return { shortName: cleaned.split('(')[0].trim(), glyph: '', fullDetail: cleaned };
    }
    const phr0 = (c.phrases && c.phrases[0] && c.phrases[0].text) || '';
    if (/[\u0600-\u06FF]/.test(phr0)) return { shortName: 'Arabic', glyph: 'ع', fullDetail: 'Arabic Alphabet' };
    if (/[\u0400-\u04FF]/.test(phr0)) return { shortName: 'Cyrillic', glyph: 'АБ', fullDetail: 'Cyrillic Alphabet' };
    if (/[\u0900-\u097F]/.test(phr0)) return { shortName: 'Devanagari', glyph: 'अ', fullDetail: 'Devanagari' };
    return { shortName: 'Latin', glyph: 'Aa', fullDetail: 'Latin Alphabet' };
  }

  function compactCountryTitle(name) {
    if (!name) return '';
    return name
      .replace(/\bBosnia and Herz\.?/i, 'Bosnia & Herz.')
      .replace(/\bDem\. Rep\. Congo/i, 'DR Congo')
      .replace(/\bCentral African Rep\.?/i, 'C. African Rep.')
      .replace(/\bDominican Rep\.?/i, 'Dominican Rep.')
      .replace(/\bS\. Sudan/i, 'South Sudan')
      .replace(/\bEq\. Guinea/i, 'Eq. Guinea');
  }

  function compactFamilyLabel(familyStr) {
    if (!familyStr) return { shortName: 'Other', detail: '' };
    const parenMatch = familyStr.match(/^([^()]+)\(([^)]+)\)/);
    if (parenMatch) {
      const parent = parenMatch[1].trim();
      const branch = parenMatch[2].trim();
      if (branch === 'Other') return { shortName: parent, detail: familyStr };
      if (branch === 'Indo-Iranian') return { shortName: 'Indo-Iranian', detail: parent };
      return { shortName: branch.split('/')[0].trim(), detail: parent };
    }
    return { shortName: familyStr.split('/')[0].trim(), detail: familyStr };
  }

  function compactLanguageLabel(c) {
    const canon = c.canonicalLanguage || c.primaryLanguage || 'Language';
    const raw = (c.languages && c.languages[0] && c.languages[0].name) || canon;
    // Strip parenthetical clarifications before taking primary name
    let base = raw.replace(/\([^)]*\)/g, '').split(',')[0].split('&')[0].trim();
    if (/^Castilian Spanish/i.test(base)) base = 'Spanish';
    else if (/^Central Thai/i.test(base)) base = 'Thai';
    else if (/^Moroccan Arabic/i.test(base)) base = 'Arabic';
    const glyphs = Array.from(base);
    if (glyphs.length > 20) base = `${glyphs.slice(0, 18).join('').trim()}…`;
    return base || canon;
  }

  function compactGreetingLabel(c) {
    const phr = c.phrases && c.phrases[0];
    if (!phr || !phr.text) return { title: 'Hello!', sub: compactCountryTitle(c.name) };
    // Strip parenthetical translations BEFORE splitting on '/' so halves inside parens never leak
    let head = phr.text.replace(/\([^)]*\)/g, '').split('/')[0].trim();
    if (!head) head = phr.text.replace(/\([^)]*\)/g, '').trim();
    const glyphs = Array.from(head);
    if (glyphs.length > 22) head = `${glyphs.slice(0, 20).join('').trim()}…`;
    const phon = phr.phonetic ? phr.phonetic.replace(/\([^)]*\)/g, '').split('/')[0].trim() : '';
    const countryShort = compactCountryTitle(c.name);
    const sub = phon && phon.length <= 22 ? `${countryShort} • ${phon}` : countryShort;
    return { title: head || 'Hello!', sub };
  }

  function buildOverlayLabelsForCountry(c) {
    const shortCountry = compactCountryTitle(c.name);
    const canonLang = c.canonicalLanguage || c.primaryLanguage || 'Language';
    const pct = (c.languages && c.languages[0] && c.languages[0].percentage) || '';
    const langDisplay = compactLanguageLabel(c);
    const famMeta = compactFamilyLabel(c.languageFamily || '');
    const scrMeta = resolveCountryScriptMeta(c);
    const greetMeta = compactGreetingLabel(c);

    const countrySub = [canonLang, c.capital].filter(Boolean).join(' • ');
    const langSub = pct ? `${shortCountry} • ${pct}` : shortCountry;
    const famSub = famMeta.detail && famMeta.detail !== famMeta.shortName
      ? `${shortCountry} • ${famMeta.detail}`
      : shortCountry;
    const scrTitle = scrMeta.glyph ? `${scrMeta.glyph} ${scrMeta.shortName}` : scrMeta.shortName;
    const scrSub = `${shortCountry} • ${scrMeta.fullDetail}`;

    const ctx = getMeasureCtx();
    const calcDims = (title, sub, isDetail) => {
      let tw = 48;
      let sw = 0;
      if (ctx) {
        ctx.font = isDetail
          ? '700 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : '700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        tw = Math.min(182, Math.ceil(ctx.measureText(title).width));
        if (isDetail && sub) {
          ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          sw = Math.min(196, Math.ceil(ctx.measureText(sub).width));
        }
      } else {
        tw = Math.min(182, title.length * 7);
        sw = (isDetail && sub) ? Math.min(196, sub.length * 6) : 0;
      }
      const dotW = 12;
      const w = Math.max(40, Math.min(220, Math.max(tw + dotW, sw) + (isDetail ? 22 : 18)));
      const h = (isDetail && sub) ? 40 : (isDetail ? 25 : 23);
      return { w, h };
    };

    return {
      countries: {
        t: shortCountry,
        s: countrySub,
        c0: calcDims(shortCountry, '', false),
        c2: calcDims(shortCountry, countrySub, true)
      },
      languages: {
        t: langDisplay,
        s: langSub,
        c0: calcDims(langDisplay, '', false),
        c2: calcDims(langDisplay, langSub, true)
      },
      families: {
        t: famMeta.shortName,
        s: famSub,
        c0: calcDims(famMeta.shortName, '', false),
        c2: calcDims(famMeta.shortName, famSub, true)
      },
      scripts: {
        t: scrTitle,
        s: scrSub,
        c0: calcDims(scrTitle, '', false),
        c2: calcDims(scrTitle, scrSub, true)
      },
      greetings: {
        t: greetMeta.title,
        s: greetMeta.sub,
        c0: calcDims(greetMeta.title, '', false),
        c2: calcDims(greetMeta.title, greetMeta.sub, true)
      }
    };
  }

  E.labelFormatter = {
    getMeasureCtx,
    resolveCountryScriptMeta,
    compactCountryTitle,
    compactFamilyLabel,
    compactLanguageLabel,
    compactGreetingLabel,
    buildOverlayLabelsForCountry
  };
})(window);

