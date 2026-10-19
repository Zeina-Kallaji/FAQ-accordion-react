import { useEffect, useMemo, useRef, useState } from "react";

const FAQ_DATA = [
  {
    id: "delivery-time",
    question: "كم تستغرق مدة التوصيل؟",
    answer:
      "تستغرق مدة التوصيل عادةً من 3 إلى 5 أيام عمل، وقد تختلف حسب المدينة وشركة الشحن.",
    disabled: false,
  },
  {
    id: "edit-order",
    question: "هل يمكنني تعديل طلبي؟",
    answer:
      "نعم، يمكنك طلب تعديل بيانات الطلب قبل شحنه، وذلك بالتواصل مع فريق الدعم بأسرع وقت ممكن.",
    disabled: false,
  },
  {
    id: "payment-methods",
    question: "ما طرق الدفع المتاحة؟",
    answer:
      "يمكنك الدفع باستخدام الطرق المتاحة عند إتمام الطلب، مثل الدفع الإلكتروني أو الدفع عند الاستلام إذا كانت هذه الخدمة متوفرة في منطقتك.",
    disabled: false,
  },
  {
    id: "contact-support",
    question: "كيف أتواصل مع الدعم؟",
    answer:
      "يمكنك التواصل مع فريق الدعم عبر البريد الإلكتروني أو نموذج التواصل الموجود في صفحة المساعدة.",
    disabled: false,
  },
  {
    id: "disabled-question",
    question: "سؤال معطّل",
    answer: "هذا السؤال معطّل حاليًا ولا يمكن فتحه.",
    disabled: true,
  },
];

const DEFAULTS = {
  questionCount: 5,
  variant: "separated",
  iconType: "chevron",
  iconPosition: "end",
  headingLevel: "h3",
  allowMultiple: false,
  allowCloseAll: true,
  animated: true,
  search: "",
};

const HEADING_MAP = {
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
};

const NAV_TABS = [
  { id: "modal", label: "النافذة المنبثقة" },
  { id: "accordion", label: "الأكورديون" },
  { id: "tabs", label: "التبويبات" },
];

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.25" />
      <path d="M12.6 12.6 16.5 16.5" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 6.5h11" />
      <path d="M6.5 10h7" />
      <path d="M8.5 13.5h3" />
    </svg>
  );
}

function AccordionIcon({ type, open }) {
  if (type === "plus-minus") {
    return (
      <svg
        className={`acc-icon plus ${open ? "is-open" : ""}`}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M4.5 10h11" />
        <path className="acc-icon-vert" d="M10 4.5v11" />
      </svg>
    );
  }

  if (type === "arrow") {
    return (
      <svg
        className={`acc-icon arrow ${open ? "is-open" : ""}`}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M5 8.25 10 13.25 15 8.25" />
      </svg>
    );
  }

  return (
    <svg
      className={`acc-icon chevron ${open ? "is-open" : ""}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5.25 7.5 10 12.25 14.75 7.5" />
    </svg>
  );
}

function generateCode({
  variant,
  iconType,
  iconPosition,
  headingLevel,
  allowMultiple,
  allowCloseAll,
  animated,
}) {
  const props = [];

  if (variant !== DEFAULTS.variant)
    props.push(`  variant=${JSON.stringify(variant)}`);
  if (iconType !== DEFAULTS.iconType)
    props.push(`  iconType=${JSON.stringify(iconType)}`);
  if (iconPosition !== DEFAULTS.iconPosition)
    props.push(`  iconPosition=${JSON.stringify(iconPosition)}`);
  if (headingLevel !== DEFAULTS.headingLevel)
    props.push(`  headingLevel=${JSON.stringify(headingLevel)}`);
  if (allowMultiple !== DEFAULTS.allowMultiple)
    props.push(`  allowMultiple={${allowMultiple}}`);
  if (allowCloseAll !== DEFAULTS.allowCloseAll)
    props.push(`  allowCloseAll={${allowCloseAll}}`);
  if (animated !== DEFAULTS.animated)
    props.push(`  animated={${animated}}`);

  if (props.length === 0) {
    return `<FaqAccordion items={items} />`;
  }

  return `<FaqAccordion\n  items={items}\n${props.join("\n")}\n/>`;
}

function HighlightedCode({ code }) {
  const parts = [];
  const regex =
    /("(?:\\.|[^"\\])*")|(\b(?:true|false)\b)|(\b(?:import|from|export|function|const|return|default)\b)|(\b[A-Z][A-Za-z0-9]*\b)|([A-Za-z_][\w-]*)(?==)|(\/?<\/?[A-Za-z][\w]*)|([={}()[\],;<>/]+)|(\s+)|([^\s"={}<>,;/]+)/g;

  let match;
  let lastIndex = 0;

  while ((match = regex.exec(code))) {
    if (match.index > lastIndex) {
      parts.push({ t: "plain", v: code.slice(lastIndex, match.index) });
    }

    const [full, str, bool, kw, comp, attr, tag, punct, space, other] = match;

    if (str) parts.push({ t: "str", v: str });
    else if (bool) parts.push({ t: "bool", v: bool });
    else if (kw) parts.push({ t: "kw", v: kw });
    else if (comp) parts.push({ t: "comp", v: comp });
    else if (attr) parts.push({ t: "attr", v: attr });
    else if (tag) parts.push({ t: "tag", v: tag });
    else if (punct) parts.push({ t: "punct", v: punct });
    else if (space) parts.push({ t: "plain", v: space });
    else parts.push({ t: "plain", v: other });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    parts.push({ t: "plain", v: code.slice(lastIndex) });
  }

  return (
    <code>
      {parts.map((part, index) => (
        <span key={`${part.t}-${index}`} className={`tok tok-${part.t}`}>
          {part.v}
        </span>
      ))}
    </code>
  );
}

export default function App() {
  const [questionCount, setQuestionCount] = useState(DEFAULTS.questionCount);
  const [variant, setVariant] = useState(DEFAULTS.variant);
  const [iconType, setIconType] = useState(DEFAULTS.iconType);
  const [iconPosition, setIconPosition] = useState(DEFAULTS.iconPosition);
  const [headingLevel, setHeadingLevel] = useState(DEFAULTS.headingLevel);
  const [allowMultiple, setAllowMultiple] = useState(DEFAULTS.allowMultiple);
  const [allowCloseAll, setAllowCloseAll] = useState(DEFAULTS.allowCloseAll);
  const [animated, setAnimated] = useState(DEFAULTS.animated);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [openIds, setOpenIds] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState("");
  const lastOpenedRef = useRef(null);

  const limitedFaqs = useMemo(
    () => FAQ_DATA.slice(0, Number(questionCount)),
    [questionCount]
  );

  const visibleFaqs = useMemo(() => {
    const query = search.trim();
    if (!query) return limitedFaqs;
    return limitedFaqs.filter(
      (item) => item.question.includes(query) || item.answer.includes(query)
    );
  }, [limitedFaqs, search]);

  const HeadingTag = HEADING_MAP[headingLevel] || "h3";

  const visibleOpenCount = visibleFaqs.filter(
    (item) => !item.disabled && openIds.includes(item.id)
  ).length;

  const totalOpenCount = limitedFaqs.filter(
    (item) => !item.disabled && openIds.includes(item.id)
  ).length;

  useEffect(() => {
    const allowed = new Set(
      limitedFaqs.filter((item) => !item.disabled).map((item) => item.id)
    );
    setOpenIds((prev) => prev.filter((id) => allowed.has(id)));
  }, [limitedFaqs]);

  useEffect(() => {
    if (allowMultiple) return;
    setOpenIds((prev) => {
      if (prev.length <= 1) return prev;
      const keep =
        lastOpenedRef.current && prev.includes(lastOpenedRef.current)
          ? lastOpenedRef.current
          : prev[prev.length - 1];
      return [keep];
    });
  }, [allowMultiple]);

  useEffect(() => {
    if (!copyFeedback) return undefined;
    const timer = window.setTimeout(() => setCopyFeedback(""), 2500);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  const generatedCode = useMemo(
    () =>
      generateCode({
        variant,
        iconType,
        iconPosition,
        headingLevel,
        allowMultiple,
        allowCloseAll,
        animated,
      }),
    [
      variant,
      iconType,
      iconPosition,
      headingLevel,
      allowMultiple,
      allowCloseAll,
      animated,
    ]
  );

  function toggleItem(id) {
    const item = limitedFaqs.find((faq) => faq.id === id);
    if (!item || item.disabled) return;

    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (isOpen) {
        const enabledOpen = prev.filter((oid) =>
          limitedFaqs.some((faq) => faq.id === oid && !faq.disabled)
        );
        if (!allowCloseAll && enabledOpen.length <= 1) {
          return prev;
        }
        return prev.filter((oid) => oid !== id);
      }

      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });

    if (!openIds.includes(id)) {
      lastOpenedRef.current = id;
    }
  }

  function closeAll() {
    setOpenIds([]);
  }

  function resetSettings() {
    setQuestionCount(DEFAULTS.questionCount);
    setVariant(DEFAULTS.variant);
    setIconType(DEFAULTS.iconType);
    setIconPosition(DEFAULTS.iconPosition);
    setHeadingLevel(DEFAULTS.headingLevel);
    setAllowMultiple(DEFAULTS.allowMultiple);
    setAllowCloseAll(DEFAULTS.allowCloseAll);
    setAnimated(DEFAULTS.animated);
    setSearch(DEFAULTS.search);
    setOpenIds([]);
    lastOpenedRef.current = null;
    setCopyFeedback("");
  }

  async function copyCode() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
      await navigator.clipboard.writeText(generatedCode);
      setCopyFeedback("success");
    } catch {
      setCopyFeedback("error");
    }
  }

  return (
    <div
      className={`acc-app${animated ? "" : " no-motion"}`}
      dir="rtl"
      lang="ar"
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap");

        html, body, #root {
          margin: 0;
          min-height: 100%;
        }

        body {
          background: #F8F9FB;
        }

        .acc-app {
          --bg: #F8F9FB;
          --card: #FFFFFF;
          --text: #252B33;
          --muted: #7B8491;
          --accent: #527565;
          --accent-soft: #EEF4F0;
          --border: #E3E7EB;
          --border-hover: #C7D5CC;
          --disabled: #A6ADB5;
          --code-bg: #20252D;
          --code-text: #E5EAF0;
          --radius: 14px;
          --radius-sm: 10px;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif;
          line-height: 1.6;
        }

        .acc-app *,
        .acc-app *::before,
        .acc-app *::after {
          box-sizing: border-box;
        }

        .acc-app h1,
        .acc-app h2,
        .acc-app h3,
        .acc-app h4,
        .acc-app h5,
        .acc-app p {
          margin: 0;
        }

        .acc-app button,
        .acc-app select,
        .acc-app input {
          font: inherit;
        }

        /* Navigation */
        .acc-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 14px 24px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
        }

        .acc-brand {
          font-weight: 700;
          font-size: 0.98rem;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .acc-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .acc-tab {
          border: 1px solid transparent;
          background: transparent;
          color: var(--text);
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .acc-tab:hover {
          background: #F4F6F8;
          border-color: var(--border);
        }

        .acc-tab.is-active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        .acc-tab:focus-visible,
        .acc-app .focus-ring:focus-visible,
        .acc-trigger:focus-visible,
        .acc-select:focus-visible,
        .acc-search:focus-visible,
        .acc-check input:focus-visible + span {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Page heading */
        .acc-page {
          width: min(1180px, calc(100% - 32px));
          margin-inline: auto;
          padding: 28px 0 48px;
        }

        .acc-title {
          font-size: clamp(1.7rem, 2.4vw, 2.15rem);
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .acc-subtitle {
          margin-top: 8px;
          color: var(--muted);
          font-size: 0.98rem;
        }

        /* Main grid */
        .acc-layout {
          display: grid;
          grid-template-columns: minmax(0, 68fr) minmax(260px, 32fr);
          gap: 24px;
          margin-top: 24px;
          align-items: start;
          direction: ltr;
        }

        .acc-main,
        .acc-side {
          direction: rtl;
        }

        .acc-main,
        .acc-side {
          min-width: 0;
        }

        .acc-side {
          position: sticky;
          top: 16px;
        }

        /* Search and status */
        .acc-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 12px;
          margin-bottom: 14px;
        }

        .search-wrap {
          position: relative;
          flex: 1 1 240px;
          min-width: 0;
        }

        .search-icon {
          position: absolute;
          inset-inline-start: 12px;
          top: 50%;
          width: 18px;
          height: 18px;
          transform: translateY(-50%);
          stroke: var(--muted);
          fill: none;
          stroke-width: 1.6;
          stroke-linecap: round;
          pointer-events: none;
        }

        .acc-search {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          padding-inline-start: 38px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--card);
          color: var(--text);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .acc-search::placeholder {
          color: var(--disabled);
        }

        .acc-search:hover,
        .acc-select:hover {
          border-color: var(--border-hover);
        }

        .acc-search:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(82, 117, 101, 0.12);
        }

        .acc-status {
          color: var(--muted);
          font-size: 0.86rem;
          white-space: nowrap;
        }

        /* Close-all button */
        .close-all,
        .reset-btn,
        .copy-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
        }

        .close-all,
        .reset-btn {
          background: var(--card);
          border: 1px solid var(--border);
          color: #4D5660;
        }

        .close-all:hover:not(:disabled),
        .reset-btn:hover {
          border-color: var(--border-hover);
          background: #F7F9F8;
        }

        .close-all:disabled {
          color: var(--disabled);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-icon,
        .acc-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Accordion container */
        .demo-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
        }

        .accordion.separated {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .accordion.bordered {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .accordion.filled {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .acc-item {
          background: var(--card);
          transition: background 0.22s ease, border-color 0.22s ease;
        }

        .accordion.separated .acc-item {
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .accordion.separated .acc-item:hover:not(.is-disabled) {
          border-color: var(--border-hover);
        }

        .accordion.bordered .acc-item + .acc-item {
          border-top: 1px solid var(--border);
        }

        .accordion.filled .acc-item {
          background: #F7F8FA;
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .accordion.filled .acc-item.is-open {
          background: var(--accent-soft);
          border-color: var(--border-hover);
        }

        /* Question headers — size follows the chosen heading level */
        .acc-heading {
          margin: 0;
          font-weight: 600;
        }

        h2.acc-heading { font-size: 1.25rem; }
        h3.acc-heading { font-size: 1.05rem; }
        h4.acc-heading { font-size: 0.95rem; }
        h5.acc-heading { font-size: 0.875rem; }

        .acc-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 52px;
          padding: 12px 16px;
          border: 0;
          background: transparent;
          color: inherit;
          text-align: start;
          cursor: pointer;
        }

        .acc-trigger:hover:not(:disabled) {
          color: #1f3d32;
        }

        .acc-q {
          flex: 1;
          min-width: 0;
        }

        .acc-icon {
          transition: transform 0.28s ease, opacity 0.22s ease;
        }

        .acc-icon-vert {
          transform-origin: center;
          transform-box: fill-box;
          transition: transform 0.22s ease, opacity 0.22s ease;
        }

        .acc-icon.is-open.chevron,
        .acc-icon.is-open.arrow {
          transform: rotate(180deg);
        }

        .acc-icon.is-open .acc-icon-vert {
          transform: scaleY(0);
          opacity: 0;
        }

        /* Answer panels */
        .acc-panel {
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          transition: grid-template-rows 0.28s ease;
        }

        .acc-panel.is-open {
          grid-template-rows: 1fr;
        }

        .acc-panel-inner {
          overflow: hidden;
          min-height: 0;
        }

        .acc-panel.is-open .acc-panel-inner {
          min-height: min-content;
        }

        .acc-answer {
          padding: 8px 16px 16px;
          color: #5E6770;
          font-size: 0.95rem;
          font-weight: 400;
          border-top: 1px solid #EEF1F4;
        }

        /* Disabled items */
        .acc-item.is-disabled {
          background: #F5F7F8;
          border-color: #E7EBEE;
        }

        .acc-item.is-disabled .acc-trigger {
          color: var(--disabled);
          cursor: not-allowed;
        }

        /* Settings panel */
        .settings-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px 18px 16px;
        }

        .settings-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 14px;
        }

        .field label {
          font-size: 0.86rem;
          color: #4E575F;
          font-weight: 500;
        }

        .acc-select {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--card);
          color: var(--text);
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #7B8491 50%),
            linear-gradient(135deg, #7B8491 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 13px) calc(50% - 3px);
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
        }

        [dir="rtl"] .acc-select {
          background-position: 13px calc(50% - 3px), 18px calc(50% - 3px);
        }

        .acc-check {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text);
        }

        .acc-check input {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
        }

        .acc-check span {
          width: 18px;
          height: 18px;
          border: 1px solid var(--border);
          border-radius: 5px;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .acc-check input:checked + span {
          background: var(--accent);
          border-color: var(--accent);
        }

        .acc-check input:checked + span::after {
          content: "";
          width: 9px;
          height: 5px;
          border-inline-start: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(-45deg) translate(1px, -1px);
        }

        .acc-check em {
          font-style: normal;
        }

        .reset-btn {
          width: 100%;
          margin-top: 8px;
        }

        .empty-state {
          padding: 28px 12px;
          text-align: center;
          color: var(--muted);
        }

        /* Code preview */
        .code-card {
          margin-top: 18px;
          background: var(--code-bg);
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid #2A313B;
        }

        .code-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-bottom: 1px solid #2C333D;
        }

        .code-head h2 {
          color: #F2F5F8;
          font-size: 0.98rem;
          font-weight: 600;
        }

        .copy-btn {
          background: transparent;
          border: 1px solid #6E8B7C;
          color: #D7E6DD;
        }

        .copy-btn:hover {
          background: rgba(82, 117, 101, 0.18);
          border-color: #89A597;
        }

        .copy-feedback {
          width: 100%;
          font-size: 0.8rem;
        }

        .copy-feedback.is-success {
          color: #B7D4C4;
        }

        .copy-feedback.is-error {
          color: #E8B4B4;
        }

        .code-body {
          margin: 0;
          padding: 16px;
          overflow: auto;
          max-height: 420px;
          color: var(--code-text);
          font-family: Consolas, "Courier New", monospace;
          font-size: 0.8rem;
          line-height: 1.7;
          direction: ltr;
          text-align: left;
        }

        .tok-str { color: #E8D4B0; }
        .tok-bool { color: #A8C5E2; }
        .tok-kw { color: #9BB0C7; }
        .tok-comp { color: #B7D4C4; }
        .tok-attr { color: #C5D4C8; }
        .tok-tag { color: #8FBFB0; }
        .tok-punct { color: #8B949E; }
        .tok-plain { color: var(--code-text); }

        .acc-app.no-motion .acc-icon,
        .acc-app.no-motion .acc-icon-vert,
        .acc-app.no-motion .acc-panel,
        .acc-app.no-motion .acc-item,
        .acc-app.no-motion .acc-tab,
        .acc-app.no-motion .close-all,
        .acc-app.no-motion .copy-btn,
        .acc-app.no-motion .reset-btn,
        .acc-app.no-motion .acc-search,
        .acc-app.no-motion .acc-select,
        .acc-app.no-motion .acc-check span {
          transition: none !important;
        }

        @media (max-width: 1024px) {
          .acc-layout {
            gap: 18px;
          }

          .acc-page {
            width: min(1180px, calc(100% - 24px));
            padding-top: 22px;
          }
        }

        @media (max-width: 860px) {
          .acc-layout {
            grid-template-columns: 1fr;
          }

          .acc-side {
            position: static;
          }

          .acc-nav {
            padding: 12px 16px;
          }

          .code-body {
            font-size: 0.78rem;
          }
        }

        @media (max-width: 600px) {
          .acc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrap {
            flex: none;
            width: 100%;
          }

          .acc-status {
            text-align: center;
          }

          .close-all {
            width: 100%;
          }

          .code-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .copy-btn {
            width: 100%;
            justify-content: center;
          }

          .settings-card {
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .acc-page {
            width: calc(100% - 20px);
            padding-bottom: 32px;
          }

          .demo-card {
            padding: 10px;
          }

          .acc-trigger {
            min-height: 48px;
            padding: 10px 12px;
          }

          h2.acc-heading { font-size: 1.1rem; }
          h3.acc-heading { font-size: 0.95rem; }
          h4.acc-heading { font-size: 0.875rem; }
          h5.acc-heading { font-size: 0.82rem; }

          .code-body {
            font-size: 0.74rem;
            padding: 12px;
          }

          .acc-nav {
            gap: 10px;
          }

          .acc-tabs {
            gap: 6px;
          }

          .acc-tab {
            padding: 6px 10px;
            font-size: 0.85rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .acc-app *,
          .acc-app *::before,
          .acc-app *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <header className="acc-nav">
        <div className="acc-brand">مكتبة المكونات</div>
        <nav className="acc-tabs" aria-label="أقسام المكتبة">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`acc-tab${tab.id === "accordion" ? " is-active" : ""}`}
              aria-current={tab.id === "accordion" ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="acc-page">
        <h1 className="acc-title">الأكورديون</h1>
        <p className="acc-subtitle">
          سؤال واحد أو أكثر، مع حركة وأيقونات وأشكال مختلفة.
        </p>

        <div className="acc-layout">
          <section className="acc-main">
            <div className="acc-toolbar">
              <div className="search-wrap">
                <SearchIcon />
                <input
                  className="acc-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث في الأسئلة..."
                  aria-label="ابحث في الأسئلة"
                />
              </div>
              <p className="acc-status" aria-live="polite">
                {visibleFaqs.length} أسئلة | مفتوحة: {visibleOpenCount}
              </p>
              <button
                type="button"
                className="close-all focus-ring"
                onClick={closeAll}
                disabled={totalOpenCount === 0}
              >
                <CollapseIcon />
                إغلاق الكل
              </button>
            </div>

            <div className="demo-card">
              {visibleFaqs.length === 0 ? (
                <p className="empty-state">لا توجد أسئلة مطابقة لبحثك.</p>
              ) : (
                <div className={`accordion ${variant}`}>
                  {visibleFaqs.map((item) => {
                    const isOpen = !item.disabled && openIds.includes(item.id);
                    const panelId = `faq-panel-${item.id}`;
                    const icon = (
                      <AccordionIcon type={iconType} open={isOpen} />
                    );

                    return (
                      <article
                        key={item.id}
                        className={`acc-item${isOpen ? " is-open" : ""}${
                          item.disabled ? " is-disabled" : ""
                        }`}
                      >
                        <HeadingTag className="acc-heading">
                          <button
                            type="button"
                            className="acc-trigger"
                            id={`faq-trigger-${item.id}`}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            disabled={item.disabled}
                            aria-disabled={item.disabled}
                            onClick={() => toggleItem(item.id)}
                          >
                            {iconPosition === "start" ? icon : null}
                            <span className="acc-q">{item.question}</span>
                            {iconPosition === "end" ? icon : null}
                          </button>
                        </HeadingTag>
                        <div
                          className={`acc-panel${isOpen ? " is-open" : ""}`}
                          id={panelId}
                          role="region"
                          aria-labelledby={`faq-trigger-${item.id}`}
                        >
                          <div className="acc-panel-inner">
                            <p className="acc-answer">{item.answer}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <section className="code-card" aria-label="الكود الناتج">
              <div className="code-head">
                <h2>الكود الناتج</h2>
                <button
                  type="button"
                  className="copy-btn focus-ring"
                  onClick={copyCode}
                >
                  نسخ الكود
                </button>
                {copyFeedback === "success" ? (
                  <p className="copy-feedback is-success" aria-live="polite">
                    تم نسخ الكود بنجاح
                  </p>
                ) : null}
                {copyFeedback === "error" ? (
                  <p className="copy-feedback is-error" aria-live="polite">
                    تعذر نسخ الكود. حاول مرة أخرى.
                  </p>
                ) : null}
              </div>
              <pre className="code-body">
                <HighlightedCode code={generatedCode} />
              </pre>
            </section>
          </section>

          <aside className="acc-side">
            <form
              className="settings-card"
              onSubmit={(event) => event.preventDefault()}
            >
              <h2 className="settings-title">الخيارات (props)</h2>

              <div className="field">
                <label htmlFor="questionCount">عدد الأسئلة (للتجربة)</label>
                <select
                  id="questionCount"
                  className="acc-select"
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="variant">الشكل variant</label>
                <select
                  id="variant"
                  className="acc-select"
                  value={variant}
                  onChange={(event) => setVariant(event.target.value)}
                >
                  <option value="separated">separated — بطاقات منفصلة</option>
                  <option value="bordered">bordered — إطار موحّد</option>
                  <option value="filled">filled — تعبئة خفيفة</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="iconType">الأيقونة iconType</label>
                <select
                  id="iconType"
                  className="acc-select"
                  value={iconType}
                  onChange={(event) => setIconType(event.target.value)}
                >
                  <option value="plus-minus">plus-minus</option>
                  <option value="chevron">chevron</option>
                  <option value="arrow">arrow</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="iconPosition">مكان الأيقونة iconPosition</label>
                <select
                  id="iconPosition"
                  className="acc-select"
                  value={iconPosition}
                  onChange={(event) => setIconPosition(event.target.value)}
                >
                  <option value="end">end — نهاية الصف</option>
                  <option value="start">start — بداية الصف</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="headingLevel">مستوى العنوان headingLevel</label>
                <select
                  id="headingLevel"
                  className="acc-select"
                  value={headingLevel}
                  onChange={(event) => setHeadingLevel(event.target.value)}
                >
                  <option value="h2">h2</option>
                  <option value="h3">h3</option>
                  <option value="h4">h4</option>
                  <option value="h5">h5</option>
                </select>
              </div>

              <label className="acc-check">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(event) => setAllowMultiple(event.target.checked)}
                />
                <span />
                <em>فتح أكثر من سؤال</em>
              </label>

              <label className="acc-check">
                <input
                  type="checkbox"
                  checked={allowCloseAll}
                  onChange={(event) => setAllowCloseAll(event.target.checked)}
                />
                <span />
                <em>السماح بإغلاق كل الأجوبة</em>
              </label>

              <label className="acc-check">
                <input
                  type="checkbox"
                  checked={animated}
                  onChange={(event) => setAnimated(event.target.checked)}
                />
                <span />
                <em>حركة animated</em>
              </label>

              <button
                type="button"
                className="reset-btn focus-ring"
                onClick={resetSettings}
              >
                إعادة الضبط
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
