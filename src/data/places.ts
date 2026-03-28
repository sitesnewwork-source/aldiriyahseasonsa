import placeTuraif from "@/assets/place-turaif.jpg";
import placeBujairi from "@/assets/place-bujairi.jpg";
import placeWadi from "@/assets/place-wadi.jpg";
import placeZallal from "@/assets/place-zallal.jpg";
import placeTuraifDetail from "@/assets/place-turaif-detail.jpg";
import placeBujairiDetail from "@/assets/place-bujairi-detail.jpg";
import placeWadiDetail from "@/assets/place-wadi-detail.jpg";
import placeZallalDetail from "@/assets/place-zallal-detail.jpg";

import turaif1 from "@/assets/gallery/turaif-1.jpg";
import turaif2 from "@/assets/gallery/turaif-2.jpg";
import turaif3 from "@/assets/gallery/turaif-3.jpg";
import bujairi1 from "@/assets/gallery/bujairi-1.jpg";
import bujairi2 from "@/assets/gallery/bujairi-2.jpg";
import bujairi3 from "@/assets/gallery/bujairi-3.jpg";
import wadi1 from "@/assets/gallery/wadi-1.jpg";
import wadi2 from "@/assets/gallery/wadi-2.jpg";
import wadi3 from "@/assets/gallery/wadi-3.jpg";
import zallal1 from "@/assets/gallery/zallal-1.jpg";
import zallal2 from "@/assets/gallery/zallal-2.jpg";
import zallal3 from "@/assets/gallery/zallal-3.jpg";

export interface Place {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  detailImage: string;
  subtitle: string;
  subtitleEn: string;
  fullDescription: string;
  fullDescriptionEn: string;
  hours: { label: string; labelEn: string; time: string; timeEn: string }[];
  location: string;
  locationEn: string;
  highlights: string[];
  highlightsEn: string[];
  features: string[];
  featuresEn: string[];
  tips: string[];
  tipsEn: string[];
  mapQuery: string;
  gallery: { src: string; alt: string; altEn: string }[];
}

export const places: Place[] = [
  {
    id: "turaif",
    name: "الطريف",
    nameEn: "At-Turaif",
    image: placeTuraif,
    detailImage: placeTuraifDetail,
    subtitle: "موقع التراث العالمي لليونسكو",
    subtitleEn: "UNESCO World Heritage Site",
    fullDescription:
      "حي الطريف التاريخي هو أحد أبرز مواقع التراث العالمي لليونسكو في المملكة العربية السعودية. يعود تاريخه إلى القرن الخامس عشر الميلادي، وكان مقراً لأسرة آل سعود وعاصمة الدولة السعودية الأولى. يتميز الحي بعمارته النجدية الفريدة المبنية من الطوب اللبن، ويضم قصر سلوى الشهير والعديد من المباني التاريخية المرممة التي تروي قصة تأسيس المملكة.",
    fullDescriptionEn:
      "At-Turaif Historic District is one of the most prominent UNESCO World Heritage Sites in Saudi Arabia. Dating back to the 15th century, it served as the seat of the Al Saud family and capital of the First Saudi State. The district features unique Najdi architecture built from mud-brick, and houses the famous Salwa Palace along with many restored historic buildings that tell the story of the Kingdom's founding.",
    hours: [
      { label: "السبت – الخميس", labelEn: "Sat – Thu", time: "10:00 صباحاً – 12:00 منتصف الليل", timeEn: "10:00 AM – 12:00 AM" },
      { label: "الجمعة", labelEn: "Friday", time: "2:00 مساءً – 12:00 منتصف الليل", timeEn: "2:00 PM – 12:00 AM" },
    ],
    location: "حي الطريف، الدرعية، الرياض",
    locationEn: "At-Turaif District, Diriyah, Riyadh",
    highlights: [
      "قصر سلوى التاريخي – مقر الحكم في الدولة السعودية الأولى",
      "المباني الطينية المرممة بالطراز النجدي الأصيل",
      "الأسواق التراثية والممرات الضيقة",
      "إطلالات بانورامية على وادي حنيفة",
      "معارض تفاعلية عن تاريخ الدرعية",
      "عروض ضوئية مسائية على المباني التاريخية",
    ],
    highlightsEn: [
      "Salwa Palace – Seat of government in the First Saudi State",
      "Restored mud-brick buildings in authentic Najdi style",
      "Heritage markets and narrow alleyways",
      "Panoramic views of Wadi Hanifa",
      "Interactive exhibitions about Diriyah's history",
      "Evening light shows on historic buildings",
    ],
    features: [
      "مدرج ضمن قائمة التراث العالمي لليونسكو",
      "مرافق خدمية ودورات مياه",
      "مسارات مشي مُعبّدة ومُنارة",
      "لوحات إرشادية بالعربية والإنجليزية",
      "مناطق استراحة مظللة",
      "متاجر هدايا تذكارية",
    ],
    featuresEn: [
      "Listed as a UNESCO World Heritage Site",
      "Service facilities and restrooms",
      "Paved and lit walking paths",
      "Signage in Arabic and English",
      "Shaded rest areas",
      "Souvenir shops",
    ],
    tips: [
      "يُنصح بارتداء أحذية مريحة للمشي على الأراضي الصخرية",
      "أفضل وقت للزيارة عند غروب الشمس للاستمتاع بالإضاءة الطبيعية",
      "آخر دخول الساعة 11 مساءً",
      "يتوفر دليل صوتي مجاني عبر تطبيق الجوال",
    ],
    tipsEn: [
      "Wear comfortable shoes for walking on rocky terrain",
      "Best time to visit is at sunset for natural lighting",
      "Last entry at 11:00 PM",
      "Free audio guide available via mobile app",
    ],
    mapQuery: "At-Turaif+District+Diriyah+Saudi+Arabia",
    gallery: [
      { src: turaif1, alt: "نقوش جدارية تقليدية في الطريف", altEn: "Traditional wall engravings at At-Turaif" },
      { src: turaif2, alt: "أزقة حي الطريف التاريخية", altEn: "Historic alleyways of At-Turaif" },
      { src: turaif3, alt: "قصر سلوى في الطريف", altEn: "Salwa Palace at At-Turaif" },
    ],
  },
  {
    id: "bujairi",
    name: "مطل البجيري",
    nameEn: "Bujairi Terrace",
    image: placeBujairi,
    detailImage: placeBujairiDetail,
    subtitle: "وجهة الطعام والترفيه الفاخرة",
    subtitleEn: "Premium Dining & Entertainment Destination",
    fullDescription:
      "مطل البجيري هو وجهة الطعام والترفيه الأولى في الدرعية، يقع على حافة وادي حنيفة مقابل حي الطريف التاريخي. يضم أكثر من 20 مطعماً ومقهى عالمياً ومحلياً، ويقدم تجربة طعام استثنائية مع إطلالات خلابة على المواقع التاريخية. يجمع المطل بين الفخامة العصرية والأصالة التراثية في أجواء لا مثيل لها.",
    fullDescriptionEn:
      "Bujairi Terrace is Diriyah's premier dining and entertainment destination, situated on the edge of Wadi Hanifa overlooking the historic At-Turaif district. It features over 20 international and local restaurants and cafés, offering exceptional dining with breathtaking views of historic sites. The terrace blends modern luxury with heritage authenticity in an unmatched atmosphere.",
    hours: [
      { label: "أيام الأسبوع", labelEn: "Weekdays", time: "9:00 صباحاً – 12:00 منتصف الليل", timeEn: "9:00 AM – 12:00 AM" },
      { label: "نهاية الأسبوع", labelEn: "Weekends", time: "9:00 صباحاً – 1:00 صباحاً", timeEn: "9:00 AM – 1:00 AM" },
    ],
    location: "مطل البجيري، الدرعية، الرياض",
    locationEn: "Bujairi Terrace, Diriyah, Riyadh",
    highlights: [
      "أكثر من 20 مطعماً ومقهى عالمياً",
      "إطلالة مباشرة على حي الطريف التاريخي",
      "علامات تجارية فاخرة مثل دولتشي آند غابانا كافيه",
      "ساحات خارجية مفتوحة بتصميم نجدي حديث",
      "فعاليات موسمية وعروض حية",
      "أجواء مسائية ساحرة مع الإضاءة المعمارية",
    ],
    highlightsEn: [
      "Over 20 international restaurants and cafés",
      "Direct views of At-Turaif Historic District",
      "Luxury brands like Dolce & Gabbana Caffè",
      "Open-air plazas with modern Najdi design",
      "Seasonal events and live performances",
      "Enchanting evening ambiance with architectural lighting",
    ],
    features: [
      "مواقف سيارات مجانية",
      "خدمة صف السيارات (فاليه)",
      "مناطق جلوس خارجية وداخلية",
      "ملائم للعائلات والأطفال",
      "شبكة واي فاي مجانية",
      "إمكانية استرداد قيمة تذكرة الدخول في المطاعم",
    ],
    featuresEn: [
      "Free parking",
      "Valet parking service",
      "Indoor and outdoor seating areas",
      "Family and children friendly",
      "Free Wi-Fi",
      "Entry ticket value redeemable at restaurants",
    ],
    tips: [
      "يُنصح بالحجز المسبق في المطاعم خلال عطلة نهاية الأسبوع",
      "تذكرة الدخول للدرعية قابلة للاسترداد في معظم المطاعم",
      "الأجواء المسائية هي الأجمل للزيارة",
      "تتوفر قائمة طعام متنوعة تناسب جميع الأذواق",
    ],
    tipsEn: [
      "Advance booking recommended for weekend dining",
      "Diriyah entry ticket is redeemable at most restaurants",
      "Evening atmosphere is the best for visiting",
      "Diverse menu options to suit all tastes",
    ],
    mapQuery: "Bujairi+Terrace+Diriyah+Saudi+Arabia",
    gallery: [
      { src: bujairi1, alt: "مطاعم مطل البجيري في المساء", altEn: "Bujairi Terrace restaurants in the evening" },
      { src: bujairi2, alt: "مقهى فاخر في مطل البجيري", altEn: "Luxury café at Bujairi Terrace" },
      { src: bujairi3, alt: "ساحة مطل البجيري", altEn: "Bujairi Terrace plaza" },
    ],
  },
  {
    id: "wadi-hanifa",
    name: "وادي حنيفة",
    nameEn: "Wadi Hanifa",
    image: placeWadi,
    detailImage: placeWadiDetail,
    subtitle: "واحة طبيعية في قلب الرياض",
    subtitleEn: "A Natural Oasis in the Heart of Riyadh",
    fullDescription:
      "وادي حنيفة هو أحد أجمل المعالم الطبيعية في منطقة الرياض، يمتد لأكثر من 120 كيلومتراً ويمر بقلب الدرعية التاريخية. بعد مشروع التأهيل الكبير، أصبح الوادي وجهة مثالية للتنزه والرياضة والاسترخاء وسط الطبيعة الخلابة. تحيط به المساحات الخضراء وأشجار النخيل، مع مسارات مشي وركوب دراجات مُعتنى بها.",
    fullDescriptionEn:
      "Wadi Hanifa is one of the most beautiful natural landmarks in the Riyadh region, stretching over 120 kilometers and passing through the heart of historic Diriyah. After a major rehabilitation project, the valley has become an ideal destination for walks, sports, and relaxation amid beautiful nature. Surrounded by green spaces and palm trees, with well-maintained walking and cycling paths.",
    hours: [
      { label: "يومياً", labelEn: "Daily", time: "مفتوح على مدار الساعة", timeEn: "Open 24 hours" },
    ],
    location: "وادي حنيفة، الدرعية، الرياض",
    locationEn: "Wadi Hanifa, Diriyah, Riyadh",
    highlights: [
      "مسارات مشي وركوب دراجات بطول كيلومترات",
      "مناظر طبيعية خلابة مع أشجار النخيل",
      "بحيرات صناعية وشلالات صغيرة",
      "مناطق نزهات عائلية",
      "إطلالات على حي الطريف من الأسفل",
      "حياة برية متنوعة من الطيور والنباتات",
    ],
    highlightsEn: [
      "Kilometers of walking and cycling paths",
      "Stunning landscapes with palm trees",
      "Artificial lakes and small waterfalls",
      "Family picnic areas",
      "Views of At-Turaif from below",
      "Diverse wildlife including birds and plants",
    ],
    features: [
      "دخول مجاني",
      "مسارات مُعبّدة ومُنارة",
      "مناطق جلوس ومظلات",
      "دورات مياه عامة",
      "مواقف سيارات مجانية",
      "مناسب لجميع الأعمار",
    ],
    featuresEn: [
      "Free entry",
      "Paved and lit pathways",
      "Seating areas and shade structures",
      "Public restrooms",
      "Free parking",
      "Suitable for all ages",
    ],
    tips: [
      "أفضل أوقات الزيارة في الصباح الباكر أو عند الغروب",
      "أحضر مياه كافية خلال أشهر الصيف",
      "المسارات مناسبة للعربات والكراسي المتحركة",
      "التصوير مسموح في جميع أنحاء الوادي",
    ],
    tipsEn: [
      "Best times to visit are early morning or sunset",
      "Bring enough water during summer months",
      "Paths are suitable for strollers and wheelchairs",
      "Photography is allowed throughout the valley",
    ],
    mapQuery: "Wadi+Hanifa+Diriyah+Saudi+Arabia",
    gallery: [
      { src: wadi1, alt: "مسار المشي في وادي حنيفة", altEn: "Walking path in Wadi Hanifa" },
      { src: wadi2, alt: "شلال صغير في وادي حنيفة", altEn: "Small waterfall in Wadi Hanifa" },
      { src: wadi3, alt: "ركوب الدراجات عند الغروب", altEn: "Cycling at sunset" },
    ],
  },
  {
    id: "zallal",
    name: "الزلّال",
    nameEn: "Zallal",
    image: placeZallal,
    detailImage: placeZallalDetail,
    subtitle: "تجربة ضيافة سعودية أصيلة",
    subtitleEn: "An Authentic Saudi Hospitality Experience",
    fullDescription:
      "الزلّال هو منطقة الضيافة والتجارب الثقافية في الدرعية، يقدم للزوار تجربة غامرة في الثقافة السعودية الأصيلة. يضم مساحات مصممة بعناية تجمع بين العمارة النجدية التقليدية واللمسات العصرية، مع أنشطة تراثية تفاعلية وورش عمل حرفية وعروض فنية. المكان مثالي لمن يبحث عن تجربة ثقافية عميقة ومميزة.",
    fullDescriptionEn:
      "Zallal is Diriyah's hospitality and cultural experiences zone, offering visitors an immersive experience in authentic Saudi culture. It features carefully designed spaces that blend traditional Najdi architecture with modern touches, along with interactive heritage activities, artisan workshops, and artistic performances. The perfect place for those seeking a deep and distinctive cultural experience.",
    hours: [
      { label: "السبت – الخميس", labelEn: "Sat – Thu", time: "10:00 صباحاً – 11:00 مساءً", timeEn: "10:00 AM – 11:00 PM" },
      { label: "الجمعة", labelEn: "Friday", time: "2:00 مساءً – 11:00 مساءً", timeEn: "2:00 PM – 11:00 PM" },
    ],
    location: "الزلّال، الدرعية، الرياض",
    locationEn: "Zallal, Diriyah, Riyadh",
    highlights: [
      "ورش عمل حرفية تقليدية (الخط العربي، النسيج)",
      "عروض فلكلورية حية",
      "أركان القهوة السعودية والتمور",
      "معارض فنية متجددة",
      "فناء داخلي مع نافورة تراثية",
      "متجر حرف يدوية ومنتجات محلية",
    ],
    highlightsEn: [
      "Traditional craft workshops (Arabic calligraphy, weaving)",
      "Live folkloric performances",
      "Saudi coffee and dates corners",
      "Rotating art exhibitions",
      "Interior courtyard with heritage fountain",
      "Handicrafts and local products shop",
    ],
    features: [
      "مشمول مع تصريح دخول الدرعية",
      "جلسات تراثية مريحة",
      "مكيف ومظلل بالكامل",
      "ملائم للعائلات",
      "إمكانية الوصول لذوي الاحتياجات الخاصة",
      "مرشدون متخصصون",
    ],
    featuresEn: [
      "Included with Diriyah entry pass",
      "Comfortable heritage seating",
      "Fully air-conditioned and shaded",
      "Family friendly",
      "Accessible for people with special needs",
      "Specialized guides",
    ],
    tips: [
      "احجز ورش العمل مسبقاً لضمان مكانك",
      "العروض الفلكلورية تبدأ عادةً عند الساعة 7 مساءً",
      "لا تفوّت تجربة القهوة السعودية التقليدية",
      "خصص ساعتين على الأقل للاستمتاع بالتجربة الكاملة",
    ],
    tipsEn: [
      "Book workshops in advance to secure your spot",
      "Folkloric shows usually start at 7:00 PM",
      "Don't miss the traditional Saudi coffee experience",
      "Allow at least 2 hours for the full experience",
    ],
    mapQuery: "Diriyah+Zallal+Saudi+Arabia",
    gallery: [
      { src: zallal1, alt: "الفناء الداخلي في الزلّال", altEn: "Interior courtyard at Zallal" },
      { src: zallal2, alt: "القهوة السعودية التقليدية", altEn: "Traditional Saudi coffee" },
      { src: zallal3, alt: "الحرف اليدوية والمنسوجات", altEn: "Handicrafts and textiles" },
    ],
  },
];

export const getPlaceById = (id: string) =>
  places.find((place) => place.id === id);
