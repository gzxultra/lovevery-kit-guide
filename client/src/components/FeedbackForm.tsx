import { useState } from "react";
import { i18n } from "@/data/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Send, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqedbdyw";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function FeedbackForm() {
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || "(not provided)",
          message: message.trim(),
          _subject: `Lovevery Kit Guide Feedback from ${name.trim()}`,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const resetForm = () => {
    setStatus("idle");
  };

  // Success state
  if (status === "success") {
    return (
      <section id="feedback" className="py-12 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#7FB685]/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#7FB685]" />
            </div>
            <h3 className="font-['Manrope'] text-xl sm:text-2xl text-[#3D3229] mb-3">
              {i18n.feedback.successTitle[lang]}
            </h3>
            <p className="text-sm sm:text-base text-[#6B5E50] mb-6">
              {i18n.feedback.successDesc[lang]}
            </p>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#6B5E50] border border-[#E8DFD3] rounded-full hover:bg-[#FAF7F2] transition-colors"
            >
              {i18n.feedback.sendAnother[lang]}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <section id="feedback" className="py-12 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#E8A87C]/15 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-[#E8A87C]" />
            </div>
            <h3 className="font-['Manrope'] text-xl sm:text-2xl text-[#3D3229] mb-3">
              {i18n.feedback.errorTitle[lang]}
            </h3>
            <p className="text-sm sm:text-base text-[#6B5E50] mb-6">
              {i18n.feedback.errorDesc[lang]}
            </p>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#3D3229] rounded-full hover:bg-[#2A231C] transition-colors"
            >
              {i18n.feedback.retry[lang]}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Default form state
  return (
    <section id="feedback" className="py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8DFD3]/60 text-[#6B5E50] text-xs sm:text-sm font-medium mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            {i18n.feedback.title[lang]}
          </div>
          <h2 className="font-['Manrope'] text-2xl sm:text-3xl text-[#1a1108] mb-3">
            {i18n.feedback.title[lang]}
          </h2>
          <p className="text-sm sm:text-base text-[#6B5E50] max-w-lg mx-auto">
            {i18n.feedback.subtitle[lang]}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 shadow-sm"
        >
          <div className="space-y-5">
            {/* Name field */}
            <div>
              <label
                htmlFor="feedback-name"
                className="block text-sm font-medium text-[#3D3229] mb-1.5"
              >
                {i18n.feedback.nameLabel[lang]}
                <span className="text-[#E8A87C] ml-0.5">*</span>
              </label>
              <input
                id="feedback-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={i18n.feedback.namePlaceholder[lang]}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] text-sm text-[#3D3229] placeholder-[#B0A89E] outline-none focus:ring-2 focus:ring-[#7FB685]/30 focus:border-[#7FB685]/50 transition-all"
              />
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="feedback-email"
                className="block text-sm font-medium text-[#3D3229] mb-1.5"
              >
                {i18n.feedback.emailLabel[lang]}
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={i18n.feedback.emailPlaceholder[lang]}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] text-sm text-[#3D3229] placeholder-[#B0A89E] outline-none focus:ring-2 focus:ring-[#7FB685]/30 focus:border-[#7FB685]/50 transition-all"
              />
            </div>

            {/* Message field */}
            <div>
              <label
                htmlFor="feedback-message"
                className="block text-sm font-medium text-[#3D3229] mb-1.5"
              >
                {i18n.feedback.messageLabel[lang]}
                <span className="text-[#E8A87C] ml-0.5">*</span>
              </label>
              <textarea
                id="feedback-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={i18n.feedback.messagePlaceholder[lang]}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] text-sm text-[#3D3229] placeholder-[#B0A89E] outline-none focus:ring-2 focus:ring-[#7FB685]/30 focus:border-[#7FB685]/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={status === "sending" || !name.trim() || !message.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full text-sm font-medium hover:bg-[#2A231C] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {i18n.feedback.sending[lang]}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {i18n.feedback.submit[lang]}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
