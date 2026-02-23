/*
 * About Us Page
 * Warm, inviting design with bilingual CN/EN support
 * Consistent with the site's Montessori Naturalism / Scandinavian Minimalism aesthetic
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import LanguageToggle from "@/components/LanguageToggle";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Heart,
  Baby,
  Sparkles,
  Code,
  Coffee,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { applyAboutPageSeo } from "@/lib/seoHelpers";
import { stages } from "@/data/kits";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function AboutUs() {
  const { lang, t, convert } = useLanguage();
  const i18n = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stageLabel = (id: string) => {
    const key = id as string;
    return i18n.stages[key]?.[lang] ?? id;
  };
  const stageRange = (id: string) => {
    const key = id as string;
    return i18n.stageRanges[key]?.[lang] ?? "";
  };

  useEffect(() => {
    applyAboutPageSeo(lang);
    window.scrollTo(0, 0);
  }, [lang]);

  const content = {
    cn: {
      pageTitle: "我们的故事",
      greeting: "你好，欢迎来到这里！",
      para1:
        "我们是一对住在西雅图的新手爸妈。在给宝宝研究 Lovevery 玩具的过程中，发现相关资料非常分散——价格对比、月龄适配、平替推荐散落在各个角落，要花大量时间才能拼凑出完整的信息。当了父母后才真正体会到时间有多宝贵，于是我用自己的工程师背景和 AI 工具，把这些零散的信息整合到了一起，做成了这个小网站。希望能帮你节省时间，更轻松地为宝宝做出选择。",
      para2:
        "",
      para3:
        "我们是 Lovevery 的忠实粉丝，非常欣赏他们对玩具品质和儿童发展的用心。需要说明的是，我们和 Lovevery 官方没有任何关系，只是单纯的爱好者，希望把这份对高质量玩具的热爱分享给你。",
      siteTitle: "关于本站",
      siteDesc:
        "这个网站没有任何广告。部分 Amazon 链接是 affiliate 链接，如果你通过这些链接购买商品，我们会获得一小笔佣金，但这不会增加你的任何费用。这些收入帮助我们维持网站的运营和持续更新。",
      closing:
        "希望你喜欢这个网站，也希望你能在这里为孩子找到心仪的好产品。感谢你的时间和信任 ❤️",
      backHome: "返回首页",
      values: [
        {
          icon: Baby,
          title: "为父母而生",
          desc: "我们理解新手父母的焦虑，致力于简化选择过程",
        },
        {
          icon: ShieldCheck,
          title: "无广告体验",
          desc: "干净纯粹的浏览体验，只为给你最好的信息",
        },
        {
          icon: Heart,
          title: "真诚分享",
          desc: "非官方粉丝社区，源自对高品质玩具的热爱",
        },
      ],
    },
    en: {
      pageTitle: "Our Story",
      greeting: "Hi there, welcome!",
      para1:
        "We're first-time parents based in Seattle. While researching Lovevery toys for our baby, we found that useful information was scattered everywhere — price comparisons, age recommendations, and alternative suggestions were spread across countless sources, taking hours to piece together. After becoming parents, we truly realized how precious time is. So I used my engineering background and AI tools to bring all this scattered information into one place. We hope this little site saves you time and makes it easier to choose the best for your little one.",
      para2:
        "",
      para3:
        "We're huge fans of Lovevery and their thoughtful approach to high-quality, developmental toys. To be clear, we are not affiliated with Lovevery in any official way — we're simply enthusiasts who want to share our love for great toys with fellow parents.",
      siteTitle: "About this site",
      siteDesc:
        "This website is completely ad-free. Some Amazon links are affiliate links, which means we may earn a small commission if you make a purchase through them — at no extra cost to you. This helps us keep the site running and the information up to date.",
      closing:
        "We hope you enjoy the site and find wonderful products for your little ones here. Thank you for your time and for being here ❤️",
      backHome: "Back to Home",
      values: [
        {
          icon: Baby,
          title: "Built for Parents",
          desc: "We understand the overwhelm of new parenthood and aim to simplify your choices",
        },
        {
          icon: ShieldCheck,
          title: "Ad-Free Experience",
          desc: "A clean, distraction-free browsing experience focused on quality information",
        },
        {
          icon: Heart,
          title: "Genuine Sharing",
          desc: "An unofficial fan community born from a love for high-quality toys",
        },
      ],
    },
  };

  const rawC = content[lang];
  const c = lang === "cn" ? {
    ...rawC,
    pageTitle: convert(rawC.pageTitle),
    greeting: convert(rawC.greeting),
    para1: convert(rawC.para1),
    para2: convert(rawC.para2),
    para3: convert(rawC.para3),
    siteTitle: convert(rawC.siteTitle),
    siteDesc: convert(rawC.siteDesc),
    closing: convert(rawC.closing),
    backHome: convert(rawC.backHome),
    values: rawC.values.map((v) => ({ ...v, title: convert(v.title), desc: convert(v.desc) })),
  } : rawC;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-lg border-b border-[#E8DFD3]/70 shadow-sm shadow-[#3D3229]/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span data-logo-target className="font-display text-xl sm:text-2xl text-[#3D3229] tracking-tight font-bold select-none hover:opacity-80 transition-opacity">
                Lovevery
              </span>
            </Link>
            {/* Desktop nav: stage links + About Us (active) */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {stages.map((s) => (
                <Link key={s.id} href={`/#stage-${s.id}`}>
                  <span className="relative text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#7FB685] after:rounded-full after:transition-all hover:after:w-full">
                    {stageLabel(s.id)}
                  </span>
                </Link>
              ))}
              <Link href="/#standalone-products">
                <span className="relative text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#7FB685] after:rounded-full after:transition-all hover:after:w-full">
                  {i18n.nav.products[lang]}
                </span>
              </Link>
              <span className="text-sm font-medium text-[#3D3229] border-b-2 border-[#7FB685] pb-0.5">
                {i18n.nav.aboutUs[lang]}
              </span>
              <LanguageToggle />
            </div>
            {/* Mobile: language toggle + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <LanguageToggle />
              <button
                className="p-2 text-[#6B5E50] hover:text-[#3D3229] min-w-[48px] min-h-[48px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8DFD3] shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {stages.map((s) => (
                <Link key={s.id} href={`/#stage-${s.id}`}>
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] hover:bg-[#E8DFD3]/40 transition-colors min-h-[48px] flex items-center justify-between"
                  >
                    {stageLabel(s.id)}
                    <span className="text-xs text-[#756A5C]">{stageRange(s.id)}</span>
                  </span>
                </Link>
              ))}
              <Link href="/#standalone-products">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] hover:bg-[#E8DFD3]/40 transition-colors min-h-[48px] flex items-center justify-between"
                >
                  {i18n.nav.products[lang]}
                  <span className="text-xs text-[#756A5C]">{t("4 款产品", "4 Products")}</span>
                </span>
              </Link>
              <span className="block px-3 py-3 rounded-xl text-sm font-medium text-[#3D3229] bg-[#E8DFD3]/40 min-h-[48px] flex items-center">
                {i18n.nav.aboutUs[lang]}
              </span>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FAF7F2] to-[#F0EBE3]" />
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#7FB685]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#E8A87C]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4B896]/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7FB685]/15 text-[#5a9e65] text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              {t("关于我们", "About Us")}
            </div>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={1}
            className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1a1108] leading-tight mb-6"
          >
            {c.pageTitle}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={2}
            className="text-lg sm:text-xl text-[#6B5E50] font-medium"
          >
            {c.greeting}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8"
        >
          {/* Paragraph 1 - Engineer & Parent */}
          <motion.div
            variants={fadeInUp}
            custom={0}
            className="relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD3] shadow-sm"
          >
            <div className="absolute -top-4 left-6 sm:left-8">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#7FB685]/15">
                <Code className="w-4 h-4 text-[#5a9e65]" />
              </div>
            </div>
            <p className="text-[#4A3F35] leading-relaxed text-base sm:text-lg pt-2">
              {c.para1}
            </p>
          </motion.div>

          {/* Paragraph 2 - Disclaimer */}
          <motion.div
            variants={fadeInUp}
            custom={2}
            className="relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD3] shadow-sm"
          >
            <div className="absolute -top-4 left-6 sm:left-8">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D4B896]/20">
                <Star className="w-4 h-4 text-[#D4B896]" />
              </div>
            </div>
            <p className="text-[#4A3F35] leading-relaxed text-base sm:text-lg pt-2">
              {c.para3}
            </p>
          </motion.div>

          {/* About This Site - highlighted box */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            className="relative bg-gradient-to-br from-[#F0EBE3] to-[#E8DFD3]/50 rounded-2xl p-6 sm:p-8 border border-[#E8DFD3]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3D3229]/10">
                <Globe className="w-4 h-4 text-[#3D3229]" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#3D3229]">
                {c.siteTitle}
              </h2>
            </div>
            <p className="text-[#4A3F35] leading-relaxed text-base sm:text-lg">
              {c.siteDesc}
            </p>
          </motion.div>

          {/* Closing message */}
          <motion.div
            variants={fadeInUp}
            custom={4}
            className="text-center py-6 sm:py-8"
          >
            <p className="text-lg sm:text-xl text-[#4A3F35] leading-relaxed font-medium">
              {c.closing}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="bg-white border-y border-[#E8DFD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {c.values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={fadeInUp}
                  custom={idx}
                  className="text-center p-6"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7FB685]/10 mb-4">
                    <Icon className="w-6 h-6 text-[#5a9e65]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#3D3229] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[#6B5E50] leading-relaxed">
                    {value.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0}
        >
          <Link href="/">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D3229] text-white rounded-full text-base font-medium hover:bg-[#2A231C] transition-colors active:scale-95">
              {t("开始探索 Play Kit", "Explore Play Kits")}
              <Sparkles className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#3D3229] text-white py-8 sm:py-12">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7FB685]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 data-logo-target className="font-display text-lg sm:text-xl mb-2 sm:mb-3 select-none">Lovevery</h3>
          <p className="text-xs sm:text-sm text-[#9A8E82] mb-2">
            {i18n.footer.tagline[lang]}
          </p>
          <p className="text-xs sm:text-sm text-[#9A8E82] leading-relaxed max-w-4xl mx-auto">
            {i18n.footer.disclaimer[lang]}
          </p>
          <div data-rainbow-portal className="mt-3 flex justify-center" />
        </div>
      </footer>
    </div>
  );
}
