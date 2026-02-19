/*
 * About Us Page
 * Warm, inviting design with bilingual CN/EN support
 * Consistent with the site's Montessori Naturalism / Scandinavian Minimalism aesthetic
 */

import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { i18n } from "@/data/i18n";
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
} from "lucide-react";
import { useEffect } from "react";
import { applyAboutPageSeo } from "@/lib/seoHelpers";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function AboutUs() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    applyAboutPageSeo(lang);
    window.scrollTo(0, 0);
  }, [lang]);

  const content = {
    cn: {
      pageTitle: "我们的故事",
      greeting: "你好，欢迎来到这里！",
      para1:
        "我是一名工程师，和太太一起迎来了我们的第一个宝宝。和许多新手爸妈一样，我们在为孩子挑选玩具时常常感到不知所措——面对海量的信息、不同的推荐和各种育儿理念，我们花了大量时间做研究，只为给宝宝找到最合适的玩具。",
      para2:
        "当了父母之后，才真正体会到时间有多宝贵。我们想，如果有一个地方能把这些零散但有价值的信息整合起来，那该多好？幸运的是，我们身处一个 AI 技术飞速发展的时代。于是我利用自己的专业技能，打造了这个小小的网站，希望能帮你节省宝贵的时间，更轻松地做出选择。",
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
        "I'm an engineer, and together with my wife, we recently became first-time parents. Like many new parents, we found ourselves overwhelmed trying to pick the right toys for our little one — sifting through endless information from countless sources, just trying to make the best choice.",
      para2:
        "After our baby arrived, we realized just how precious time really is. We wished there was a single place that brought all this scattered but valuable information together. With the recent boom in AI, I saw an opportunity. I put my engineering skills to work and built this little website, hoping to save you some of that precious time and make your decisions a little easier.",
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

  const c = content[lang];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <span data-logo-target className="font-['Manrope'] text-xl sm:text-2xl text-[#3D3229] tracking-tight font-bold select-none">
                Lovevery
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link href="/">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5E50] hover:text-[#3D3229] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {c.backHome}
                </span>
              </Link>
            </div>
          </div>
        </div>
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
              {lang === "cn" ? "关于我们" : "About Us"}
            </div>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={1}
            className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl text-[#1a1108] leading-tight mb-6"
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

          {/* Paragraph 2 - Building the site */}
          <motion.div
            variants={fadeInUp}
            custom={1}
            className="relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD3] shadow-sm"
          >
            <div className="absolute -top-4 left-6 sm:left-8">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E8A87C]/15">
                <Sparkles className="w-4 h-4 text-[#E8A87C]" />
              </div>
            </div>
            <p className="text-[#4A3F35] leading-relaxed text-base sm:text-lg pt-2">
              {c.para2}
            </p>
          </motion.div>

          {/* Paragraph 3 - Lovevery fans */}
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
              <h2 className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#3D3229]">
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
                  <h3 className="font-['Manrope'] text-lg font-bold text-[#3D3229] mb-2">
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
              {lang === "cn" ? "开始探索 Play Kit" : "Explore Play Kits"}
              <Sparkles className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D3229] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm text-[#B8A99A] mb-2">
            {i18n.footer.tagline[lang]}
          </p>
          <p className="text-xs sm:text-sm text-[#B8A99A] leading-relaxed max-w-4xl mx-auto">
            {i18n.footer.disclaimer[lang]}
          </p>
          <div data-rainbow-portal className="mt-3 flex justify-center" />
        </div>
      </footer>
    </div>
  );
}
