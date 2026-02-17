import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();

  useEffect(() => {
    document.title = "404 - Page Not Found | Lovevery Fans";
    return () => {
      document.title = "Lovevery Fans";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span className="font-['Manrope'] text-xl sm:text-2xl text-[#3D3229] tracking-tight font-bold">
                Lovevery
              </span>
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* Decorative element */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-32 h-32 rounded-full bg-[#7FB685]/10 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-[#E8DFD3]/60 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#7FB685]" />
            </div>
          </div>

          <h1 className="font-['Manrope'] text-6xl sm:text-7xl font-bold text-[#3D3229] mb-4">
            404
          </h1>

          <h2 className="font-['Manrope'] text-xl sm:text-2xl font-bold text-[#3D3229] mb-4">
            {lang === "cn" ? "页面未找到" : "Page Not Found"}
          </h2>

          <p className="text-[#6B5E50] text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
            {lang === "cn"
              ? "抱歉，您访问的页面不存在。可能已被移动或删除。让我们回到首页，继续探索 Lovevery Play Kit 的精彩世界吧！"
              : "Sorry, the page you're looking for doesn't exist. It may have been moved or deleted. Let's head back to the homepage and continue exploring the wonderful world of Lovevery Play Kits!"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full text-sm font-medium hover:bg-[#2A231C] transition-colors active:scale-95 cursor-pointer">
                <Home className="w-4 h-4" />
                {lang === "cn" ? "返回首页" : "Back to Home"}
              </span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#3D3229] rounded-full text-sm font-medium border border-[#E8DFD3] hover:bg-[#F5F0E8] transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "cn" ? "返回上一页" : "Go Back"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-['Manrope'] text-lg font-bold mb-2">Lovevery</h3>
          <p className="text-xs text-[#8B7E70]">
            Stage-based play essentials, designed by child development experts.
          </p>
        </div>
      </footer>
    </div>
  );
}
