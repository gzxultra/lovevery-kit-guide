export interface Testimonial {
  id: string;
  kitId: string;
  kitName: string;
  toyName: string;
  toyNameCn: string;
  reviewCn: string;
  reviewEn: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "looker-1",
    kitId: "looker",
    kitName: "The Looker",
    toyName: "Black & White Mobile",
    toyNameCn: "黑白床铃",
    reviewCn: "高对比度设计非常吸引新生儿注意力，有助于早期视觉追踪能力的开发。旋转时的视觉效果让宝宝感到安宁。",
    reviewEn: "The high-contrast design captivates newborns and supports early visual tracking. The rotating effect creates a calming experience.",
    rating: 5,
  },
  {
    id: "senser-1",
    kitId: "senser",
    kitName: "The Senser",
    toyName: "Magic Tissue Box",
    toyNameCn: "魔术纸巾盒",
    reviewCn: "这是 Lovevery 最具代表性的玩具之一，完美替代了宝宝抽纸巾的行为。锻炼精细动作和物体恒存感。",
    reviewEn: "A signature Lovevery toy that redirects the natural urge to pull tissues. Perfect for developing fine motor skills and object permanence.",
    rating: 5,
  },
  {
    id: "charmer-1",
    kitId: "charmer",
    kitName: "The Charmer",
    toyName: "Wooden Rattle",
    toyNameCn: "木制摇铃",
    reviewCn: "经典蒙氏设计，声音清脆，木质手感极佳。非常适合练习抓握和手眼协调。",
    reviewEn: "Classic Montessori design with a crisp sound and beautiful wood feel. Excellent for practicing grasp and hand-eye coordination.",
    rating: 5,
  },
  {
    id: "inspector-1",
    kitId: "inspector",
    kitName: "The Inspector",
    toyName: "Stacking Cups",
    toyNameCn: "堆叠杯",
    reviewCn: "简单却百玩不厌，宝宝可以堆叠、嵌套、倒水，每个阶段都有新的玩法。质量非常耐用，经得起折腾。",
    reviewEn: "Simple yet endlessly entertaining. Stacking, nesting, pouring—there's always something new to discover. Built to last through years of play.",
    rating: 5,
  },
  {
    id: "adventurer-1",
    kitId: "adventurer",
    kitName: "The Adventurer",
    toyName: "Wooden Puzzle",
    toyNameCn: "木制拼图",
    reviewCn: "精心设计的难度梯度，宝宝一开始可以随意放入，逐渐学会形状匹配。木质手感温润，安全可靠。",
    reviewEn: "Thoughtfully designed difficulty progression. Babies start with free play and gradually learn shape matching. Beautiful wood craftsmanship.",
    rating: 5,
  },
  {
    id: "thinker-1",
    kitId: "thinker",
    kitName: "The Thinker",
    toyName: "Shape Sorter",
    toyNameCn: "形状分类盒",
    reviewCn: "通过形状识别和手眼协调的练习，宝宝的问题解决能力得到明显提升。每次成功放入都能获得成就感。",
    reviewEn: "Problem-solving through shape recognition and hand-eye coordination. The satisfaction of successful placement is priceless.",
    rating: 5,
  },
  {
    id: "companion-1",
    kitId: "companion",
    kitName: "The Companion",
    toyName: "Soft Dolls",
    toyNameCn: "柔软娃娃",
    reviewCn: "宝宝开始有了社交意识，这些娃娃成为了他最好的陪伴。材质柔软安全，宝宝很喜欢抱着睡觉。",
    reviewEn: "As social awareness develops, these soft companions become best friends. Soft, safe, and perfect for cuddles and comfort.",
    rating: 5,
  },
  {
    id: "helper-1",
    kitId: "helper",
    kitName: "The Helper",
    toyName: "Cleaning Set",
    toyNameCn: "清洁工具套装",
    reviewCn: "宝宝模仿家长做家务，既能参与家务，又能锻炼生活技能。真实尺寸的工具让宝宝感到被尊重。",
    reviewEn: "Real-sized tools empower toddlers to help with chores. It's amazing to watch them develop life skills while feeling truly helpful.",
    rating: 5,
  },
  {
    id: "storyteller-1",
    kitId: "storyteller",
    kitName: "The Storyteller",
    toyName: "Picture Books",
    toyNameCn: "图画书",
    reviewCn: "精美的插画和简洁的文字，宝宝开始能理解故事情节。亲子阅读时光成为每天最期待的时刻。",
    reviewEn: "Beautiful illustrations and simple text introduce storytelling. These become the most anticipated moments of the day.",
    rating: 5,
  },
  {
    id: "analyst-1",
    kitId: "analyst",
    kitName: "The Analyst",
    toyName: "Building Blocks",
    toyNameCn: "积木",
    reviewCn: "从简单的堆叠到复杂的结构，宝宝的创意和空间想象力得到充分发展。每个作品都值得骄傲。",
    reviewEn: "From simple stacking to complex structures, creativity and spatial awareness flourish. Every creation is a masterpiece.",
    rating: 5,
  },
];

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

export function getTestimonialsByKit(kitId: string): Testimonial[] {
  return testimonials.filter((t) => t.kitId === kitId);
}
