/**
 * SEO Data for each Kit page
 * Contains unique SEO descriptions (CN/EN), meta titles, and meta descriptions
 * for improved search engine visibility and click-through rates.
 */

export interface KitSeoData {
  kitId: string;
  metaTitleEn: string;
  metaTitleCn: string;
  metaDescriptionEn: string;
  metaDescriptionCn: string;
  seoDescriptionEn: string;
  seoDescriptionCn: string;
}

export const kitSeoDataMap: Record<string, KitSeoData> = {
  looker: {
    kitId: "looker",
    metaTitleEn: "The Looker Play Kit (0-12 Weeks) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Looker 新生儿玩具盒 (0-12周) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover the best affordable alternatives to the Lovevery Looker Play Kit for newborns 0-12 weeks. Compare real Amazon prices, ratings, and find high-contrast toy dupes for your baby.",
    metaDescriptionCn: "Lovevery Looker 新生儿玩具盒 (0-12周) 完整指南：黑白卡片、床铃等玩具的使用方法、家长评价，以及 Amazon 高性价比平替推荐。",
    seoDescriptionEn: "The Looker Play Kit is designed for babies 0-12 weeks old. This guide covers all toys in the kit — including the black & white mobile, sensory links, and high-contrast cards — with real parent reviews and affordable Amazon alternatives with actual prices and ratings. Perfect for parents looking for Lovevery alternatives and play kit dupes for newborns.",
    seoDescriptionCn: "The Looker 玩具盒专为 0-12 周新生儿设计。本指南涵盖盒内所有玩具——包括黑白床铃、感官连接环和高对比度卡片——附有真实家长评价和 Amazon 高性价比平替推荐（含实际价格和评分）。适合寻找 Lovevery 平替和新生儿早教玩具的家长。",
  },
  charmer: {
    kitId: "charmer",
    metaTitleEn: "The Charmer Play Kit (3-4 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Charmer 玩具盒 (3-4个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Find the best Lovevery Charmer Play Kit alternatives for 3-4 month old babies. Compare Amazon dupes with real prices, ratings, and parent reviews for social smile stage toys.",
    metaDescriptionCn: "Lovevery Charmer 玩具盒 (3-4个月) 完整指南：社交微笑阶段玩具使用方法、家长评价，以及 Amazon 高性价比平替推荐。",
    seoDescriptionEn: "The Charmer Play Kit is designed for babies aged 3-4 months, when they unlock their first social smile. Explore detailed toy guides, parent reviews, and budget-friendly Amazon alternatives for Lovevery play kit dupes at this developmental stage.",
    seoDescriptionCn: "The Charmer 玩具盒专为 3-4 个月宝宝设计，这是宝宝解锁社交微笑的阶段。探索详细的玩具指南、家长评价，以及经济实惠的 Amazon 平替推荐。",
  },
  senser: {
    kitId: "senser",
    metaTitleEn: "The Senser Play Kit (5-6 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Senser 玩具盒 (5-6个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Explore affordable alternatives to the Lovevery Senser Play Kit for 5-6 month old babies. Sensory toys, teethers, and activity mats with real Amazon prices and ratings.",
    metaDescriptionCn: "Lovevery Senser 玩具盒 (5-6个月) 完整指南：感官探索阶段玩具使用方法、家长评价，以及 Amazon 高性价比平替推荐。",
    seoDescriptionEn: "The Senser Play Kit is designed for 5-6 month old babies who are actively exploring through touch and taste. Find detailed guides for each toy, honest parent reviews, and the best affordable Lovevery alternatives on Amazon with real prices and ratings.",
    seoDescriptionCn: "The Senser 玩具盒专为 5-6 个月宝宝设计，这是宝宝通过触觉和味觉积极探索世界的阶段。查看每个玩具的详细指南、真实家长评价，以及 Amazon 上最佳的 Lovevery 平替推荐。",
  },
  inspector: {
    kitId: "inspector",
    metaTitleEn: "The Inspector Play Kit (7-8 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Inspector 玩具盒 (7-8个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Inspector Play Kit alternatives for 7-8 month old babies. Object permanence toys, stacking cups, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Inspector 玩具盒 (7-8个月) 完整指南：物体恒存玩具、叠叠杯等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Inspector Play Kit is designed for curious 7-8 month old babies discovering object permanence. Explore every toy in the kit with parent reviews and find the best affordable Lovevery dupes and alternatives on Amazon.",
    seoDescriptionCn: "The Inspector 玩具盒专为好奇心旺盛的 7-8 个月宝宝设计，这是宝宝发现物体恒存概念的阶段。探索盒内每个玩具的详细指南，以及 Amazon 上最佳的 Lovevery 平替推荐。",
  },
  explorer: {
    kitId: "explorer",
    metaTitleEn: "The Explorer Play Kit (9-10 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Explorer 玩具盒 (9-10个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover affordable Lovevery Explorer Play Kit alternatives for 9-10 month old babies. Crawling toys, shape sorters, and more with real Amazon prices and ratings.",
    metaDescriptionCn: "Lovevery Explorer 玩具盒 (9-10个月) 完整指南：爬行玩具、形状分类器等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Explorer Play Kit is designed for adventurous 9-10 month old babies who are crawling and exploring everything. Find detailed toy guides, real parent reviews, and budget-friendly Lovevery alternatives on Amazon with verified prices and ratings.",
    seoDescriptionCn: "The Explorer 玩具盒专为爱冒险的 9-10 个月宝宝设计，这是宝宝开始爬行和探索一切的阶段。查看详细的玩具指南、真实家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  thinker: {
    kitId: "thinker",
    metaTitleEn: "The Thinker Play Kit (11-12 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Thinker 玩具盒 (11-12个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Thinker Play Kit alternatives for 11-12 month old babies. Problem-solving toys, first puzzles, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Thinker 玩具盒 (11-12个月) 完整指南：益智玩具、第一个拼图等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Thinker Play Kit is designed for 11-12 month old babies developing problem-solving skills. Explore every toy with honest parent reviews and discover the best affordable Lovevery play kit dupes and alternatives on Amazon.",
    seoDescriptionCn: "The Thinker 玩具盒专为 11-12 个月宝宝设计，这是宝宝开始发展解决问题能力的阶段。探索每个玩具的详细指南，以及 Amazon 上最佳的 Lovevery 平替推荐。",
  },
  babbler: {
    kitId: "babbler",
    metaTitleEn: "The Babbler Play Kit (13-15 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Babbler 玩具盒 (13-15个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Find affordable Lovevery Babbler Play Kit alternatives for 13-15 month old toddlers. Language development toys, stacking toys, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Babbler 玩具盒 (13-15个月) 完整指南：语言发展玩具、堆叠玩具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Babbler Play Kit is designed for 13-15 month old toddlers who are starting to babble and form their first words. Find detailed toy guides, parent reviews, and the best Lovevery alternatives on Amazon for early language development.",
    seoDescriptionCn: "The Babbler 玩具盒专为 13-15 个月幼儿设计，这是宝宝开始咿呀学语、说出第一个词的阶段。查看详细的玩具指南、家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  adventurer: {
    kitId: "adventurer",
    metaTitleEn: "The Adventurer Play Kit (16-18 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Adventurer 玩具盒 (16-18个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Adventurer Play Kit alternatives for 16-18 month old toddlers. Walking toys, pretend play, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Adventurer 玩具盒 (16-18个月) 完整指南：学步玩具、假装游戏等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Adventurer Play Kit is designed for 16-18 month old toddlers who are walking and ready for new adventures. Explore every toy with real parent reviews and find budget-friendly Lovevery dupes on Amazon with verified prices and ratings.",
    seoDescriptionCn: "The Adventurer 玩具盒专为 16-18 个月幼儿设计，这是宝宝开始走路、准备探索新冒险的阶段。查看每个玩具的真实家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  realist: {
    kitId: "realist",
    metaTitleEn: "The Realist Play Kit (19-21 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Realist 玩具盒 (19-21个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover affordable Lovevery Realist Play Kit alternatives for 19-21 month old toddlers. Pretend play, puzzles, and more with real Amazon prices and ratings.",
    metaDescriptionCn: "Lovevery Realist 玩具盒 (19-21个月) 完整指南：角色扮演、拼图等玩具使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Realist Play Kit is designed for 19-21 month old toddlers who are beginning to understand the real world through imitation. Find detailed toy reviews, parent feedback, and the best affordable Lovevery alternatives on Amazon.",
    seoDescriptionCn: "The Realist 玩具盒专为 19-21 个月幼儿设计，这是宝宝开始通过模仿理解真实世界的阶段。查看详细的玩具评测、家长反馈，以及 Amazon 上最佳的 Lovevery 平替推荐。",
  },
  companion: {
    kitId: "companion",
    metaTitleEn: "The Companion Play Kit (22-24 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Companion 玩具盒 (22-24个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Companion Play Kit alternatives for 22-24 month old toddlers. Social play toys, building blocks, and more with Amazon prices and reviews.",
    metaDescriptionCn: "Lovevery Companion 玩具盒 (22-24个月) 完整指南：社交游戏玩具、积木等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Companion Play Kit is designed for 22-24 month old toddlers developing social skills and empathy. Explore every toy with honest parent reviews and discover affordable Lovevery play kit dupes on Amazon.",
    seoDescriptionCn: "The Companion 玩具盒专为 22-24 个月幼儿设计，这是宝宝开始发展社交技能和同理心的阶段。探索每个玩具的详细指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  helper: {
    kitId: "helper",
    metaTitleEn: "The Helper Play Kit (25-27 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Helper 玩具盒 (25-27个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Find affordable Lovevery Helper Play Kit alternatives for 25-27 month old toddlers. Practical life toys, Montessori tools, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Helper 玩具盒 (25-27个月) 完整指南：日常生活玩具、蒙氏工具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Helper Play Kit is designed for 25-27 month old toddlers who love to help and imitate daily routines. Find detailed toy guides, parent reviews, and budget-friendly Lovevery alternatives on Amazon for this big toddler stage.",
    seoDescriptionCn: "The Helper 玩具盒专为 25-27 个月大幼儿设计，这是宝宝喜欢帮忙和模仿日常活动的阶段。查看详细的玩具指南、家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  enthusiast: {
    kitId: "enthusiast",
    metaTitleEn: "The Enthusiast Play Kit (28-30 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Enthusiast 玩具盒 (28-30个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Enthusiast Play Kit alternatives for 28-30 month old toddlers. Creative play toys, art supplies, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Enthusiast 玩具盒 (28-30个月) 完整指南：创意游戏玩具、美术用品等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Enthusiast Play Kit is designed for energetic 28-30 month old toddlers bursting with enthusiasm. Explore every toy with real parent reviews and find the best affordable Lovevery dupes and alternatives on Amazon.",
    seoDescriptionCn: "The Enthusiast 玩具盒专为精力充沛的 28-30 个月大幼儿设计。探索每个玩具的真实家长评价，以及 Amazon 上最佳的 Lovevery 平替推荐。",
  },
  investigator: {
    kitId: "investigator",
    metaTitleEn: "The Investigator Play Kit (31-33 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Investigator 玩具盒 (31-33个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover affordable Lovevery Investigator Play Kit alternatives for 31-33 month old toddlers. STEM toys, science kits, and more with real Amazon prices and ratings.",
    metaDescriptionCn: "Lovevery Investigator 玩具盒 (31-33个月) 完整指南：STEM 玩具、科学套装等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Investigator Play Kit is designed for 31-33 month old toddlers who love to ask 'why?' and investigate how things work. Find detailed toy guides, parent reviews, and the best Lovevery alternatives on Amazon.",
    seoDescriptionCn: "The Investigator 玩具盒专为 31-33 个月大幼儿设计，这是宝宝喜欢问「为什么」并探究事物运作原理的阶段。查看详细的玩具指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  freeSpirit: {
    kitId: "freeSpirit",
    metaTitleEn: "The Free Spirit Play Kit (34-36 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Free Spirit 玩具盒 (34-36个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Free Spirit Play Kit alternatives for 34-36 month old toddlers. Imaginative play, art tools, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Free Spirit 玩具盒 (34-36个月) 完整指南：想象力游戏、美术工具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Free Spirit Play Kit is designed for independent 34-36 month old toddlers with big imaginations. Explore every toy with honest parent reviews and discover budget-friendly Lovevery play kit dupes on Amazon.",
    seoDescriptionCn: "The Free Spirit 玩具盒专为独立自主、想象力丰富的 34-36 个月大幼儿设计。探索每个玩具的真实家长评价，以及 Amazon 上经济实惠的 Lovevery 平替推荐。",
  },
  observer: {
    kitId: "observer",
    metaTitleEn: "The Observer Play Kit (37-39 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Observer 玩具盒 (37-39个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Find affordable Lovevery Observer Play Kit alternatives for 37-39 month old preschoolers. Observation toys, nature kits, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Observer 玩具盒 (37-39个月) 完整指南：观察力玩具、自然探索套装等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Observer Play Kit is designed for 37-39 month old preschoolers who are becoming keen observers of the world. Find detailed toy guides, parent reviews, and affordable Lovevery alternatives on Amazon for this preschool stage.",
    seoDescriptionCn: "The Observer 玩具盒专为 37-39 个月学龄前儿童设计，这是孩子成为敏锐世界观察者的阶段。查看详细的玩具指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  storyteller: {
    kitId: "storyteller",
    metaTitleEn: "The Storyteller Play Kit (40-42 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Storyteller 玩具盒 (40-42个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Storyteller Play Kit alternatives for 40-42 month old preschoolers. Storytelling toys, language games, and more with Amazon prices and reviews.",
    metaDescriptionCn: "Lovevery Storyteller 玩具盒 (40-42个月) 完整指南：讲故事玩具、语言游戏等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Storyteller Play Kit is designed for 40-42 month old preschoolers with growing language skills and vivid imaginations. Explore every toy with parent reviews and find the best Lovevery dupes on Amazon.",
    seoDescriptionCn: "The Storyteller 玩具盒专为 40-42 个月学龄前儿童设计，这是孩子语言能力快速发展、想象力丰富的阶段。探索每个玩具的家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  problemSolver: {
    kitId: "problemSolver",
    metaTitleEn: "The Problem Solver Play Kit (43-45 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Problem Solver 玩具盒 (43-45个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover affordable Lovevery Problem Solver Play Kit alternatives for 43-45 month old preschoolers. Logic puzzles, STEM toys, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Problem Solver 玩具盒 (43-45个月) 完整指南：逻辑拼图、STEM 玩具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Problem Solver Play Kit is designed for 43-45 month old preschoolers developing critical thinking and problem-solving skills. Find detailed toy guides, parent reviews, and budget-friendly Lovevery alternatives on Amazon.",
    seoDescriptionCn: "The Problem Solver 玩具盒专为 43-45 个月学龄前儿童设计，这是孩子发展批判性思维和解决问题能力的阶段。查看详细的玩具指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  analyst: {
    kitId: "analyst",
    metaTitleEn: "The Analyst Play Kit (46-48 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Analyst 玩具盒 (46-48个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Analyst Play Kit alternatives for 46-48 month old preschoolers. Math toys, pattern games, and more with Amazon prices and parent reviews.",
    metaDescriptionCn: "Lovevery Analyst 玩具盒 (46-48个月) 完整指南：数学玩具、图案游戏等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Analyst Play Kit is designed for 46-48 month old preschoolers who love to categorize, sort, and analyze. Explore every toy with honest parent reviews and discover affordable Lovevery play kit dupes on Amazon.",
    seoDescriptionCn: "The Analyst 玩具盒专为 46-48 个月学龄前儿童设计，这是孩子喜欢分类、排序和分析的阶段。探索每个玩具的真实家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  connector: {
    kitId: "connector",
    metaTitleEn: "The Connector Play Kit (49-51 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Connector 玩具盒 (49-51个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Find affordable Lovevery Connector Play Kit alternatives for 49-51 month old preschoolers. Social games, building toys, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Connector 玩具盒 (49-51个月) 完整指南：社交游戏、建构玩具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Connector Play Kit is designed for 49-51 month old preschoolers who are making connections between ideas and building friendships. Find detailed toy guides and the best Lovevery alternatives on Amazon.",
    seoDescriptionCn: "The Connector 玩具盒专为 49-51 个月学龄前儿童设计，这是孩子开始建立概念联系和友谊的阶段。查看详细的玩具指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  examiner: {
    kitId: "examiner",
    metaTitleEn: "The Examiner Play Kit (52-54 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Examiner 玩具盒 (52-54个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Examiner Play Kit alternatives for 52-54 month old preschoolers. Detail-oriented toys, science experiments, and more with Amazon prices.",
    metaDescriptionCn: "Lovevery Examiner 玩具盒 (52-54个月) 完整指南：注重细节的玩具、科学实验等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Examiner Play Kit is designed for detail-oriented 52-54 month old preschoolers with sharp observation skills. Explore every toy with parent reviews and find budget-friendly Lovevery dupes on Amazon.",
    seoDescriptionCn: "The Examiner 玩具盒专为注重细节的 52-54 个月学龄前儿童设计，这是孩子观察力敏锐的阶段。探索每个玩具的家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  persister: {
    kitId: "persister",
    metaTitleEn: "The Persister Play Kit (55-57 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Persister 玩具盒 (55-57个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Discover affordable Lovevery Persister Play Kit alternatives for 55-57 month old preschoolers. Persistence toys, literacy games, and more with real Amazon prices.",
    metaDescriptionCn: "Lovevery Persister 玩具盒 (55-57个月) 完整指南：毅力培养玩具、识字游戏等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Persister Play Kit is designed for 55-57 month old preschoolers who are developing persistence and focus. Find detailed toy guides, parent reviews, and the best affordable Lovevery alternatives on Amazon.",
    seoDescriptionCn: "The Persister 玩具盒专为 55-57 个月学龄前儿童设计，这是孩子开始发展毅力和专注力的阶段。查看详细的玩具指南，以及 Amazon 上的 Lovevery 平替推荐。",
  },
  planner: {
    kitId: "planner",
    metaTitleEn: "The Planner Play Kit (58-60 Months) | Lovevery Alternatives & Dupes | Lovevery Fans",
    metaTitleCn: "The Planner 玩具盒 (58-60个月) | Lovevery 平替推荐 | Lovevery Fans",
    metaDescriptionEn: "Best Lovevery Planner Play Kit alternatives for 58-60 month old preschoolers. Time management toys, planning tools, and more with Amazon prices and reviews.",
    metaDescriptionCn: "Lovevery Planner 玩具盒 (58-60个月) 完整指南：时间管理玩具、计划工具等使用方法、家长评价，以及 Amazon 平替推荐。",
    seoDescriptionEn: "The Planner Play Kit is Lovevery's final kit, designed for 58-60 month old preschoolers preparing for school. Explore every toy with parent reviews and find affordable Lovevery play kit dupes on Amazon for school readiness.",
    seoDescriptionCn: "The Planner 是 Lovevery 的最后一个玩具盒，专为 58-60 个月学龄前儿童设计，帮助孩子为入学做准备。探索每个玩具的家长评价，以及 Amazon 上的 Lovevery 平替推荐。",
  },
};

export function getKitSeoData(kitId: string): KitSeoData | undefined {
  return kitSeoDataMap[kitId];
}
