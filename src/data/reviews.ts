export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

const avatarColors = ["#C4A265", "#8B7355", "#6B8E6B", "#7B8FA1", "#9B7E9B", "#A17B5E"];

const getInitials = (name: string) => name.charAt(0);

export const generateAvatarUrl = (name: string, index: number) => {
  const color = avatarColors[index % avatarColors.length];
  return { initial: getInitials(name), color };
};

// Reviews for places
export const placeReviews: Record<string, Review[]> = {
  turaif: [
    {
      id: "t1",
      userName: "محمد العتيبي",
      avatar: "",
      rating: 5,
      date: "2026-03-10",
      comment: "مكان رائع ويستحق الزيارة! العمارة التاريخية مذهلة والأجواء المسائية ساحرة. أنصح الجميع بزيارته عند الغروب.",
      helpful: 24,
    },
    {
      id: "t2",
      userName: "سارة الشمري",
      avatar: "",
      rating: 4,
      date: "2026-03-05",
      comment: "تجربة ممتعة جداً، المكان نظيف ومنظم. فقط أتمنى لو كانت هناك مقاعد أكثر للاستراحة خلال الجولة.",
      helpful: 18,
    },
    {
      id: "t3",
      userName: "عبدالله الدوسري",
      avatar: "",
      rating: 5,
      date: "2026-02-28",
      comment: "من أجمل الأماكن التاريخية في الرياض. قصر سلوى تحفة معمارية والمعارض التفاعلية ممتازة. سأعود مرة أخرى بالتأكيد.",
      helpful: 31,
    },
    {
      id: "t4",
      userName: "نورة القحطاني",
      avatar: "",
      rating: 4,
      date: "2026-02-20",
      comment: "زيارة عائلية رائعة، الأطفال استمتعوا كثيراً. الإضاءة الليلية على المباني أضافت جمالاً خاصاً.",
      helpful: 12,
    },
  ],
  bujairi: [
    {
      id: "b1",
      userName: "خالد المطيري",
      avatar: "",
      rating: 5,
      date: "2026-03-12",
      comment: "أفضل مكان للعشاء في الرياض! الإطلالة على حي الطريف مع الإضاءة المسائية لا تُوصف. المطاعم متنوعة وراقية.",
      helpful: 35,
    },
    {
      id: "b2",
      userName: "ريم الحربي",
      avatar: "",
      rating: 5,
      date: "2026-03-08",
      comment: "تجربة طعام استثنائية! جربنا مطعم دولتشي آند غابانا وكان رائعاً. الأجواء فخمة والخدمة ممتازة.",
      helpful: 28,
    },
    {
      id: "b3",
      userName: "فهد السبيعي",
      avatar: "",
      rating: 4,
      date: "2026-02-25",
      comment: "المكان جميل جداً لكن الأسعار مرتفعة بعض الشيء. ميزة استرداد قيمة التذكرة في المطاعم ممتازة.",
      helpful: 22,
    },
    {
      id: "b4",
      userName: "هند العنزي",
      avatar: "",
      rating: 5,
      date: "2026-02-18",
      comment: "مكان مثالي للقهوة مع إطلالة لا مثيل لها. أنصح بزيارته في المساء، الأجواء ساحرة.",
      helpful: 19,
    },
  ],
  "wadi-hanifa": [
    {
      id: "w1",
      userName: "أحمد الزهراني",
      avatar: "",
      rating: 5,
      date: "2026-03-15",
      comment: "واحة حقيقية وسط المدينة! مسارات المشي ممتازة والمناظر الطبيعية خلابة. أفضل مكان للرياضة الصباحية.",
      helpful: 27,
    },
    {
      id: "w2",
      userName: "مريم السالم",
      avatar: "",
      rating: 4,
      date: "2026-03-01",
      comment: "مكان هادئ ومريح للنزهات العائلية. الأطفال أحبوا اللعب بالقرب من المياه. أتمنى توفير المزيد من المظلات.",
      helpful: 15,
    },
    {
      id: "w3",
      userName: "يوسف الغامدي",
      avatar: "",
      rating: 5,
      date: "2026-02-22",
      comment: "ركوب الدراجات هنا تجربة لا تُنسى! المسارات طويلة ومعتنى بها. الغروب من هنا مشهد يستحق التصوير.",
      helpful: 20,
    },
  ],
  zallal: [
    {
      id: "z1",
      userName: "عمر الشهري",
      avatar: "",
      rating: 5,
      date: "2026-03-11",
      comment: "تجربة ثقافية فريدة! ورشة الخط العربي كانت ممتعة جداً والقهوة السعودية التقليدية لذيذة. مكان يعكس الأصالة السعودية.",
      helpful: 23,
    },
    {
      id: "z2",
      userName: "لطيفة الراشد",
      avatar: "",
      rating: 4,
      date: "2026-03-03",
      comment: "المكان مصمم بعناية فائقة. العروض الفلكلورية ممتعة والحرف اليدوية جميلة. اشتريت هدايا تذكارية رائعة.",
      helpful: 16,
    },
    {
      id: "z3",
      userName: "سلطان العمري",
      avatar: "",
      rating: 5,
      date: "2026-02-26",
      comment: "أفضل تجربة ثقافية في الدرعية! الفناء الداخلي مع النافورة مكان ساحر. أنصح بحضور العروض المسائية.",
      helpful: 29,
    },
  ],
};

// Reviews for experiences
export const experienceReviews: Record<string, Review[]> = {
  "turaif-tour": [
    {
      id: "et1",
      userName: "فيصل الحميد",
      avatar: "",
      rating: 5,
      date: "2026-03-14",
      comment: "جولة رائعة! التجول بين المباني التاريخية كأنك عدت بالزمن. اللوحات الإرشادية مفيدة جداً.",
      helpful: 21,
    },
    {
      id: "et2",
      userName: "منيرة العجمي",
      avatar: "",
      rating: 4,
      date: "2026-03-06",
      comment: "تجربة جميلة ومعلومات قيّمة عن تاريخ المملكة. يُفضل الزيارة في الأوقات الأقل ازدحاماً.",
      helpful: 14,
    },
    {
      id: "et3",
      userName: "بندر الشريف",
      avatar: "",
      rating: 5,
      date: "2026-02-27",
      comment: "من أفضل الأنشطة في الدرعية. الإطلالات على وادي حنيفة من الأعلى مذهلة!",
      helpful: 17,
    },
  ],
  "guided-tour": [
    {
      id: "eg1",
      userName: "ثامر النهدي",
      avatar: "",
      rating: 5,
      date: "2026-03-13",
      comment: "المرشد كان ممتازاً ومعلوماته غنية. تعلمنا أشياء كثيرة لم نكن نعرفها عن تاريخ الدرعية. تستحق كل ريال!",
      helpful: 33,
    },
    {
      id: "eg2",
      userName: "دانة الخالد",
      avatar: "",
      rating: 5,
      date: "2026-03-02",
      comment: "أفضل جولة مع مرشد جربتها! القصص التي يرويها المرشد تجعلك تعيش التاريخ. السماعة الشخصية ميزة ممتازة.",
      helpful: 26,
    },
    {
      id: "eg3",
      userName: "راكان الفيصل",
      avatar: "",
      rating: 4,
      date: "2026-02-19",
      comment: "جولة شاملة ومفيدة. المشروب الترحيبي لمسة جميلة. أنصح بالحجز المسبق لأن الأماكن محدودة.",
      helpful: 11,
    },
  ],
  "horse-gallery": [
    {
      id: "eh1",
      userName: "تركي القرني",
      avatar: "",
      rating: 5,
      date: "2026-03-09",
      comment: "معرض مميز! المجسمات واقعية جداً والمعلومات عن الخيل العربية شاملة. الأطفال استمتعوا كثيراً بركن التصوير.",
      helpful: 19,
    },
    {
      id: "eh2",
      userName: "أمل البقمي",
      avatar: "",
      rating: 4,
      date: "2026-02-24",
      comment: "معرض تعليمي وترفيهي في نفس الوقت. تعرفنا على سلالات الخيل المختلفة. المعرض مناسب لجميع الأعمار.",
      helpful: 13,
    },
  ],
  "diriyah-museum": [
    {
      id: "em1",
      userName: "ماجد العسيري",
      avatar: "",
      rating: 5,
      date: "2026-03-07",
      comment: "متحف رائع يروي قصة الدرعية بطريقة مبتكرة! العروض الضوئية مذهلة والمخطوطات التاريخية ثمينة.",
      helpful: 30,
    },
    {
      id: "em2",
      userName: "وفاء الحازمي",
      avatar: "",
      rating: 5,
      date: "2026-02-21",
      comment: "من أجمل المتاحف التي زرتها. الجدار الزمني التفاعلي يجعلك تفهم تاريخ الدرعية بسهولة. خصصوا وقتاً كافياً.",
      helpful: 25,
    },
    {
      id: "em3",
      userName: "حسن الجهني",
      avatar: "",
      rating: 4,
      date: "2026-02-15",
      comment: "معرض ممتاز ومعلومات غنية. الدليل الصوتي ساعدني كثيراً في فهم القطع الأثرية. أنصح بالزيارة بشدة.",
      helpful: 18,
    },
  ],
};

export const getPlaceReviews = (placeId: string): Review[] =>
  placeReviews[placeId] || [];

export const getExperienceReviews = (expId: string): Review[] =>
  experienceReviews[expId] || [];

export const getAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};
