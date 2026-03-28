import expTuraif from "@/assets/exp-turaif-tour.jpg";
import expGuided from "@/assets/exp-guided-tour.jpg";
import expHorse from "@/assets/exp-horse-gallery.jpg";
import placeTuraif from "@/assets/place-turaif.jpg";
import expTuraifDetail from "@/assets/exp-turaif-detail.jpg";
import expGuidedDetail from "@/assets/exp-guided-detail.jpg";
import expHorseDetail from "@/assets/exp-horse-detail.jpg";
import expMuseumDetail from "@/assets/exp-museum-detail.jpg";
import expVisitorCenter from "@/assets/exp-visitor-center.jpg";
import expArchitecture from "@/assets/exp-architecture.jpg";
import expMilitary from "@/assets/exp-military.jpg";
import expSbalaModhi from "@/assets/exp-sbala-modhi.jpg";

export interface Experience {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  schedule: string;
  scheduleEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  detailImage: string;
  fullDescription: string;
  fullDescriptionEn: string;
  duration: string;
  durationEn: string;
  price: string;
  priceEn: string;
  location: string;
  locationEn: string;
  highlights: string[];
  highlightsEn: string[];
  includes: string[];
  includesEn: string[];
  tips: string[];
  tipsEn: string[];
}

export const experiences: Experience[] = [
  {
    id: "turaif-tour",
    title: "جولة الطريف",
    titleEn: "At-Turaif Tour",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "استمتع بالمشي عبر شوارع حيّ الطريف التاريخي، واكتشف مبانيه الطينية التي حافظت على بهائها عبر القرون.",
    descriptionEn: "Walk through the streets of the historic At-Turaif district and discover its mud-brick buildings that have maintained their beauty over centuries.",
    image: expTuraif,
    detailImage: expTuraifDetail,
    fullDescription: "انطلق في رحلة عبر الزمن واستكشف حي الطريف التاريخي، المدرج ضمن قائمة التراث العالمي لمنظمة اليونسكو. تمشّى بين أزقّته الضيقة وتعرّف على العمارة النجدية التقليدية المبنية من الطوب اللبن. يعود تاريخ الحي إلى القرن الخامس عشر الميلادي، وكان مقراً لأسرة آل سعود وعاصمة الدولة السعودية الأولى.",
    fullDescriptionEn: "Embark on a journey through time and explore At-Turaif Historic District, a UNESCO World Heritage Site. Walk through its narrow alleyways and discover the traditional Najdi architecture built from mud-brick. The district dates back to the 15th century and served as the seat of the Al Saud family and capital of the First Saudi State.",
    duration: "٤٥ - ٦٠ دقيقة",
    durationEn: "45 – 60 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["المباني الطينية التاريخية المرممة", "قصر سلوى الشهير", "الأسواق التراثية القديمة", "إطلالات بانورامية على وادي حنيفة"],
    highlightsEn: ["Restored historic mud-brick buildings", "The famous Salwa Palace", "Ancient heritage markets", "Panoramic views of Wadi Hanifa"],
    includes: ["الدخول لجميع المباني المفتوحة في الحي", "لوحات إرشادية تفاعلية بالعربية والإنجليزية", "مناطق استراحة مظللة"],
    includesEn: ["Access to all open buildings in the district", "Interactive signage in Arabic and English", "Shaded rest areas"],
    tips: ["يُنصح بارتداء أحذية مريحة للمشي", "أفضل وقت للزيارة عند غروب الشمس", "تتوفر مياه شرب مجانية في نقاط محددة"],
    tipsEn: ["Wear comfortable walking shoes", "Best time to visit is at sunset", "Free drinking water available at designated points"],
  },
  {
    id: "guided-tour",
    title: "جولة الطريف – مع مرشد",
    titleEn: "At-Turaif Guided Tour",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "تجربة متكاملة برفقة مرشد في حي الطريف المدرج في قائمة التراث العالمي \"يونيسكو\". ستستكشف من خلالها أزقّته وحكاياته.",
    descriptionEn: "A comprehensive experience with a guide in At-Turaif, a UNESCO World Heritage Site. Explore its alleyways and stories.",
    image: expGuided,
    detailImage: expGuidedDetail,
    fullDescription: "استمتع بجولة حصرية برفقة مرشد سياحي متخصص يأخذك في رحلة معرفية عميقة عبر تاريخ الدرعية. ستتعرف على القصص الحقيقية وراء كل مبنى وكل زاوية في حي الطريف التاريخي، بما في ذلك الأحداث المفصلية التي شكّلت تاريخ المملكة العربية السعودية.",
    fullDescriptionEn: "Enjoy an exclusive tour with a specialized guide who takes you on a deep knowledge journey through Diriyah's history. Learn the real stories behind every building and corner in At-Turaif Historic District, including pivotal events that shaped Saudi Arabia's history.",
    duration: "٩٠ دقيقة",
    durationEn: "90 minutes",
    price: "١٥٠ ر.س للشخص",
    priceEn: "150 SAR per person",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["مرشد سياحي متخصص في التاريخ السعودي", "قصص حصرية عن الدولة السعودية الأولى", "زيارة أماكن لا تُتاح في الجولة العادية", "صور تذكارية في مواقع مميزة"],
    highlightsEn: ["Guide specialized in Saudi history", "Exclusive stories about the First Saudi State", "Access to areas not available on regular tours", "Photo opportunities at special locations"],
    includes: ["مرشد سياحي معتمد", "سماعة أذن شخصية", "مشروب ترحيبي", "كتيب تذكاري عن الدرعية"],
    includesEn: ["Certified tour guide", "Personal earpiece", "Welcome drink", "Diriyah souvenir booklet"],
    tips: ["الحجز المسبق مطلوب قبل 24 ساعة", "الجولة متاحة بالعربية والإنجليزية", "الحد الأقصى 15 شخصاً في المجموعة"],
    tipsEn: ["Advance booking required 24 hours ahead", "Tour available in Arabic and English", "Maximum 15 people per group"],
  },
  {
    id: "visitor-centre",
    title: "مركز الزوار بحي الطريف",
    titleEn: "At-Turaif Visitor Centre",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "في مركز الزوار، تعرف على بداية هجرة بنو حنيفة للمنطقة واستيطانهم بها مروراً بتاريخ الدرعية والتأسيس.",
    descriptionEn: "At the Visitor Centre, learn about the migration of Banu Hanifa to the region and the founding history of Diriyah.",
    image: expVisitorCenter,
    detailImage: expVisitorCenter,
    fullDescription: "يعد مركز الزوار نقطة الانطلاق المثالية لاستكشاف حي الطريف التاريخي. هنا ستتعرف على قصة المنطقة منذ بداية استيطان قبيلة بنو حنيفة وصولاً إلى تأسيس الدولة السعودية الأولى. يضم المركز عروضاً تفاعلية ومجسمات توضيحية تساعدك على فهم السياق التاريخي قبل بدء جولتك.",
    fullDescriptionEn: "The Visitor Centre is the ideal starting point for exploring At-Turaif Historic District. Here you'll learn about the region's story from the settlement of the Banu Hanifa tribe to the founding of the First Saudi State. The centre features interactive displays and models to help you understand the historical context before starting your tour.",
    duration: "٣٠ - ٤٥ دقيقة",
    durationEn: "30 – 45 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["عروض مرئية تفاعلية عن تاريخ المنطقة", "مجسمات توضيحية للحي التاريخي", "خرائط وأدلة إرشادية للزوار", "معروضات أثرية أصلية"],
    highlightsEn: ["Interactive visual displays about the region's history", "Explanatory models of the historic district", "Maps and visitor guides", "Original archaeological exhibits"],
    includes: ["الدخول المجاني مع تصريح الطريف", "أدلة إرشادية متعددة اللغات", "منطقة استراحة مكيفة"],
    includesEn: ["Free entry with At-Turaif pass", "Multilingual guides", "Air-conditioned rest area"],
    tips: ["ابدأ زيارتك من هنا قبل التجول في الحي", "متوفر فيه خدمة الواي فاي المجانية", "مناسب لجميع الأعمار"],
    tipsEn: ["Start your visit here before touring the district", "Free Wi-Fi available", "Suitable for all ages"],
  },
  {
    id: "horse-gallery",
    title: "معرض الخيل العربي",
    titleEn: "Arabian Horse Gallery",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "نحكي لك في هذا المعرض قصة الخيل العربي الأصيل، عن تاريخها وفصائلها وأصالتها، إذ تحتفي ثقافة هذا المكان بهذا الكائن النبيل.",
    descriptionEn: "This gallery tells the story of the Arabian horse – its history, breeds, and heritage – celebrating this noble creature.",
    image: expHorse,
    detailImage: expHorseDetail,
    fullDescription: "اغمر نفسك في عالم الخيل العربية الأصيلة، رمز الفخر والأصالة في الثقافة السعودية. يقدم المعرض رحلة بصرية وتفاعلية تروي قصة العلاقة العريقة بين الإنسان العربي وخيله، منذ آلاف السنين وحتى يومنا هذا. ستتعرف على أشهر السلالات والفصائل، وأساليب التربية والعناية التي جعلت من الخيل العربي الأكثر شهرة في العالم.",
    fullDescriptionEn: "Immerse yourself in the world of purebred Arabian horses, a symbol of pride and authenticity in Saudi culture. The gallery offers a visual and interactive journey telling the story of the ancient bond between Arabs and their horses, spanning thousands of years. Learn about the most famous breeds and the breeding and care methods that made Arabian horses the most renowned in the world.",
    duration: "٣٠ - ٤٥ دقيقة",
    durationEn: "30 – 45 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["مجسمات واقعية للخيل العربية بأحجام طبيعية", "عروض مرئية تفاعلية عن تاريخ الخيل", "معروضات أدوات الفروسية التاريخية", "ركن التصوير مع مجسمات الخيل"],
    highlightsEn: ["Life-size realistic horse models", "Interactive visual displays on horse history", "Historical equestrian equipment exhibits", "Photo corner with horse models"],
    includes: ["الدخول للمعرض الرئيسي", "شاشات تفاعلية بالعربية والإنجليزية", "منطقة مخصصة للأطفال"],
    includesEn: ["Main gallery access", "Interactive screens in Arabic and English", "Dedicated children's area"],
    tips: ["المعرض مناسب لجميع الأعمار", "يتوفر تطبيق جوال للمزيد من المعلومات", "التصوير مسموح في جميع أرجاء المعرض"],
    tipsEn: ["Gallery is suitable for all ages", "Mobile app available for more information", "Photography allowed throughout the gallery"],
  },
  {
    id: "diriyah-museum",
    title: "معرض الدرعية",
    titleEn: "Diriyah Exhibition",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "رحلة تمتد محطاتها عبر أكثر من 1400 عام تكتشف فيها قصص أهل الدرعية منذ عهد السكان الأوائل وحتى أسرة آل سعود.",
    descriptionEn: "A journey spanning over 1,400 years, discovering the stories of Diriyah's people from the earliest inhabitants to the Al Saud family.",
    image: placeTuraif,
    detailImage: expMuseumDetail,
    fullDescription: "يأخذك معرض الدرعية في رحلة عبر أكثر من 1400 عام من التاريخ العريق. اكتشف كيف تحولت الدرعية من واحة صغيرة إلى عاصمة الدولة السعودية الأولى، وتعرف على الشخصيات التاريخية والأحداث المفصلية التي شكّلت ملامح المملكة. يضم المعرض مخطوطات نادرة، وقطع أثرية أصلية، وعروض مرئية حديثة تروي القصة بطريقة مبتكرة.",
    fullDescriptionEn: "The Diriyah Exhibition takes you on a journey through over 1,400 years of rich history. Discover how Diriyah transformed from a small oasis into the capital of the First Saudi State, and learn about historical figures and pivotal events that shaped the Kingdom. The exhibition features rare manuscripts, original artifacts, and modern visual displays that tell the story in innovative ways.",
    duration: "٦٠ - ٩٠ دقيقة",
    durationEn: "60 – 90 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["مخطوطات ووثائق تاريخية نادرة", "قطع أثرية أصلية من حقب مختلفة", "عروض ضوئية وصوتية غامرة", "جدار زمني تفاعلي لتاريخ الدرعية"],
    highlightsEn: ["Rare historical manuscripts and documents", "Original artifacts from various eras", "Immersive light and sound shows", "Interactive timeline wall of Diriyah's history"],
    includes: ["الدخول لجميع أقسام المعرض", "دليل صوتي بالعربية والإنجليزية", "كتيب المعرض"],
    includesEn: ["Access to all exhibition sections", "Audio guide in Arabic and English", "Exhibition booklet"],
    tips: ["خصص وقتاً كافياً لاستكشاف جميع الأقسام", "العروض الضوئية تبدأ كل 20 دقيقة", "يتوفر مقهى صغير عند المخرج"],
    tipsEn: ["Allocate enough time to explore all sections", "Light shows start every 20 minutes", "A small café is available at the exit"],
  },
  {
    id: "architecture-gallery",
    title: "معرض العمارة النجدية",
    titleEn: "Najdi Architecture Gallery",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "في هذا المعرض ستتعرف أكثر على قواعد الطراز المعماري النجدي، الذي صمدت مبانيه عبر سنين طويلة ولم تفقد جمالها.",
    descriptionEn: "In this gallery, learn about the principles of Najdi architectural style, whose buildings have stood for centuries without losing their beauty.",
    image: expArchitecture,
    detailImage: expArchitecture,
    fullDescription: "يكشف معرض العمارة النجدية أسرار البناء التقليدي في منطقة نجد، حيث استخدم البنّاؤون الطين واللبن والحجر لتشييد مبانٍ تتحدى الزمن. ستتعرف على تقنيات البناء الفريدة، والزخارف الهندسية، والتصاميم الداخلية التي تعكس حكمة أجيال في التعامل مع المناخ الصحراوي.",
    fullDescriptionEn: "The Najdi Architecture Gallery reveals the secrets of traditional construction in the Najd region, where builders used mud, adobe, and stone to erect buildings that defy time. Discover unique building techniques, geometric decorations, and interior designs that reflect generations of wisdom in dealing with the desert climate.",
    duration: "٣٠ - ٤٥ دقيقة",
    durationEn: "30 – 45 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["نماذج حقيقية لتقنيات البناء بالطين", "زخارف ونقوش معمارية أصلية", "مقارنة بين العمارة النجدية والحديثة", "عروض توضيحية لمراحل البناء"],
    highlightsEn: ["Real examples of mud construction techniques", "Original architectural decorations and engravings", "Comparison between Najdi and modern architecture", "Demonstrations of building stages"],
    includes: ["الدخول للمعرض", "لوحات شرح تفصيلية", "عينات من مواد البناء التقليدية"],
    includesEn: ["Gallery access", "Detailed explanation panels", "Samples of traditional building materials"],
    tips: ["تأمّل التفاصيل الدقيقة في الزخارف", "قارن ما تراه في المعرض بالمباني الحقيقية حولك", "مناسب لعشاق العمارة والتصميم"],
    tipsEn: ["Observe the fine details in the decorations", "Compare what you see with the real buildings around you", "Ideal for architecture and design enthusiasts"],
  },
  {
    id: "military-gallery",
    title: "معرض التاريخ العسكري",
    titleEn: "Military History Gallery",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "اعرف أكثر عن المعارك التي خاضتها الدولة السعودية الأولى في أوائل خطواتها لتأسيس دولتنا العظيمة.",
    descriptionEn: "Learn about the battles fought by the First Saudi State in the early steps of establishing our great nation.",
    image: expMilitary,
    detailImage: expMilitary,
    fullDescription: "يروي معرض التاريخ العسكري قصة الشجاعة والبطولة في تاريخ الدولة السعودية الأولى. ستتعرف على المعارك الحاسمة والاستراتيجيات العسكرية التي اتبعها المؤسسون، وتشاهد أسلحة وأدوات حربية أصلية من تلك الحقبة. المعرض يقدم رواية مشوقة عن كيف تحولت الدرعية إلى قوة إقليمية عظيمة.",
    fullDescriptionEn: "The Military History Gallery tells the story of courage and heroism in the First Saudi State's history. Learn about decisive battles and military strategies followed by the founders, and see original weapons and war tools from that era. The gallery presents an exciting narrative of how Diriyah became a great regional power.",
    duration: "٣٠ - ٤٥ دقيقة",
    durationEn: "30 – 45 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["أسلحة وأدوات حربية أصلية", "خرائط المعارك التاريخية", "مجسمات للحصون والتحصينات", "عروض مرئية عن الحملات العسكرية"],
    highlightsEn: ["Original weapons and war tools", "Historic battle maps", "Fortress and fortification models", "Visual displays of military campaigns"],
    includes: ["الدخول للمعرض", "شاشات عرض تفاعلية", "كتيب تعريفي"],
    includesEn: ["Gallery access", "Interactive display screens", "Information booklet"],
    tips: ["اقرأ اللوحات التوضيحية بتمعّن", "المعرض مناسب للأعمار فوق 10 سنوات", "التصوير مسموح"],
    tipsEn: ["Read the explanatory panels carefully", "Gallery suitable for ages 10+", "Photography allowed"],
  },
  {
    id: "sbala-modhi",
    title: "سبالة موضي",
    titleEn: "Sbala Modhi",
    category: "التاريخ والثقافة",
    categoryEn: "History & Culture",
    schedule: "كل يوم | الطريف",
    scheduleEn: "Daily | At-Turaif",
    description: "كان الهدف من بناء سبالة موضي انعكاساً لعطاء الأميرة موضي وإيثارها، لإيواء الزائر والمسافر والمحتاج.",
    descriptionEn: "Sbala Modhi was built to reflect Princess Modhi's generosity and selflessness, providing shelter for visitors, travelers, and those in need.",
    image: expSbalaModhi,
    detailImage: expSbalaModhi,
    fullDescription: "سبالة موضي هي وقف خيري أسسته الأميرة موضي بنت أبي وهطان، وتعكس قيم العطاء والكرم المتجذرة في الثقافة السعودية. كانت السبالة بمثابة دار ضيافة تستقبل المسافرين والمحتاجين، وتقدم لهم الماء والطعام والمأوى. اليوم، تم ترميمها لتروي قصة الإيثار والعطاء في المجتمع السعودي التقليدي.",
    fullDescriptionEn: "Sbala Modhi is a charitable endowment founded by Princess Modhi bint Abi Wahtan, reflecting the values of generosity and hospitality deeply rooted in Saudi culture. The Sbala served as a guesthouse welcoming travelers and those in need, providing water, food, and shelter. Today, it has been restored to tell the story of selflessness and giving in traditional Saudi society.",
    duration: "٢٠ - ٣٠ دقيقة",
    durationEn: "20 – 30 minutes",
    price: "مجاناً مع تصريح الدخول",
    priceEn: "Free with entry pass",
    location: "حي الطريف، الدرعية",
    locationEn: "At-Turaif District, Diriyah",
    highlights: ["مبنى تاريخي مرمم بعناية", "قصة الأميرة موضي وعطائها", "نموذج للوقف الخيري في التراث السعودي", "إطلالة جميلة على الحي التاريخي"],
    highlightsEn: ["Carefully restored historic building", "Story of Princess Modhi and her generosity", "Model of charitable endowment in Saudi heritage", "Beautiful view of the historic district"],
    includes: ["الدخول المجاني", "لوحات شرح عن تاريخ السبالة", "منطقة جلوس مظللة"],
    includesEn: ["Free entry", "Explanatory panels about the Sbala's history", "Shaded seating area"],
    tips: ["موقع رائع للتأمل والاستراحة", "مناسب لجميع الأعمار", "نقطة تصوير مميزة"],
    tipsEn: ["Great spot for contemplation and rest", "Suitable for all ages", "Excellent photo opportunity"],
  },
];

export const getExperienceById = (id: string) =>
  experiences.find((exp) => exp.id === id);
