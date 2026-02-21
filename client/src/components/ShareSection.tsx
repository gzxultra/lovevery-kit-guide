/**
 * ShareSection — elegant, subtle sharing component
 * Used at the bottom of product/kit detail pages
 * Design: low-key, warm, blends naturally with the page
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

/* Inline SVG icons — small and purposeful */
function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.093 6.093 0 0 1-.248-1.747c0-3.573 3.283-6.473 7.33-6.473.244 0 .48.02.722.038C16.178 4.853 12.77 2.188 8.691 2.188zm-2.6 4.408c.56 0 1.015.46 1.015 1.028 0 .566-.455 1.027-1.015 1.027-.56 0-1.016-.46-1.016-1.027 0-.568.456-1.028 1.016-1.028zm5.21 0c.56 0 1.015.46 1.015 1.028 0 .566-.455 1.027-1.015 1.027-.56 0-1.016-.46-1.016-1.027 0-.568.456-1.028 1.016-1.028zM16.584 8.6c-3.502 0-6.342 2.503-6.342 5.592 0 3.088 2.84 5.592 6.342 5.592a7.35 7.35 0 0 0 2.181-.33.632.632 0 0 1 .524.072l1.39.812a.238.238 0 0 0 .122.04c.117 0 .212-.097.212-.216 0-.052-.021-.105-.035-.155l-.285-1.08a.43.43 0 0 1 .156-.486c1.336-.985 2.19-2.44 2.19-4.049 0-3.09-2.84-5.592-6.342-5.592h-.113zm-2.3 3.2c.409 0 .74.336.74.75s-.331.75-.74.75-.74-.336-.74-.75.331-.75.74-.75zm4.6 0c.409 0 .74.336.74.75s-.331.75-.74.75-.74-.336-.74-.75.331-.75.74-.75z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ShareSection() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "https://loveveryfans.com";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = typeof window !== "undefined" ? window.location.href : "https://loveveryfans.com";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWeChatShare = () => {
    // On mobile WeChat browser, this could trigger share
    // On desktop, prompt to copy link for WeChat
    handleCopyLink();
  };

  return (
    <div className="flex items-center justify-center gap-3 py-6 sm:py-8">
      <span className="text-xs sm:text-sm text-[#B0A89E]">
        {t("推荐给朋友", "Share with friends")}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleWeChatShare}
          className="group w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F0EB] hover:bg-[#E8DFD3] flex items-center justify-center transition-all duration-300 hover:scale-105"
          title={t("分享到微信", "Share to WeChat")}
          aria-label={t("分享到微信", "Share to WeChat")}
        >
          <WeChatIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#9A8E82] group-hover:text-[#07C160] transition-colors duration-300" />
        </button>
        <button
          onClick={handleCopyLink}
          className="group w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F0EB] hover:bg-[#E8DFD3] flex items-center justify-center transition-all duration-300 hover:scale-105"
          title={copied ? t("已复制", "Copied!") : t("复制链接", "Copy link")}
          aria-label={t("复制链接", "Copy link")}
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7FB685] transition-colors duration-300" />
          ) : (
            <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9A8E82] group-hover:text-[#6B5E50] transition-colors duration-300" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * FooterShareMessage — warm, personal message for the Home page footer
 * "一位华人爸爸做的小工具，欢迎分享给身边的新手爸妈"
 */
export function FooterShareMessage() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://loveveryfans.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = "https://loveveryfans.com";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5 mt-4 sm:mt-6">
      <p className="text-xs sm:text-sm text-[#7A7068] leading-relaxed text-center max-w-md">
        {t(
          "一位华人爸爸做的小工具，欢迎分享给身边的新手爸妈 ❤️",
          "A little tool made by a Chinese dad — feel free to share with new parents around you ❤️"
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4D4439]/60 hover:bg-[#4D4439] text-[#B8AFA3] hover:text-white text-xs transition-all duration-300"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3 h-3 text-[#7FB685]" />
              {t("已复制链接", "Link copied!")}
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              {t("复制链接分享", "Copy link to share")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
