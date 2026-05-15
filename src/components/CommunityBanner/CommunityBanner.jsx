import { useEffect, useMemo, useState } from "react";
import Button from "../ui/button";

const STORAGE_KEY = "grosirkit_community_banner_dismissed_at";
const SHOW_AFTER_DAYS = 7;
const WA_LINK = "https://chat.whatsapp.com/HhXHuhvQtQYAnRtR8uCil5";

function shouldShowBanner() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return true;
  }

  const dismissedAt = Number(raw);
  if (!dismissedAt) {
    return true;
  }

  const elapsedMs = Date.now() - dismissedAt;
  return elapsedMs >= SHOW_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

function CommunityBanner({ compact = false, placement = "top" }) {
  const [visible, setVisible] = useState(() => shouldShowBanner());

  useEffect(() => {
    const syncVisibility = () => setVisible(shouldShowBanner());

    window.addEventListener("storage", syncVisibility);
    window.addEventListener("grosirkit:community-banner", syncVisibility);

    return () => {
      window.removeEventListener("storage", syncVisibility);
      window.removeEventListener("grosirkit:community-banner", syncVisibility);
    };
  }, []);

  const wrapperClassName = useMemo(() => {
    if (compact) {
      return "rounded-lg border border-brand-100 bg-brand-50 px-3 py-2";
    }

    return "rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-emerald-50 p-4";
  }, [compact]);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new Event("grosirkit:community-banner"));
    setVisible(false);
  };

  return (
    <aside className={wrapperClassName}>
      <div className={compact ? "flex items-center justify-between gap-2" : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
        <p className={compact ? "text-xs font-medium text-brand-900" : "text-sm font-medium text-brand-900"}>
          Ingin belajar atau berkontribusi di balik GrosirKit?
        </p>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            href={WA_LINK}
            rel="noreferrer"
            target="_blank"
          >
            Join Komunitas
          </a>
          {placement !== "footer" ? (
            <Button className="px-2 py-1 text-xs" onClick={dismiss} variant="ghost">
              Tutup
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export default CommunityBanner;
