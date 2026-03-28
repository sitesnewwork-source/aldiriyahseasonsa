import italianImg from "@/assets/restaurant-italian.jpg";
import frenchImg from "@/assets/restaurant-french.jpg";
import saudiImg from "@/assets/restaurant-saudi.jpg";
import fusionImg from "@/assets/restaurant-fusion.jpg";
import japaneseImg from "@/assets/restaurant-japanese.jpg";
import foodPasta from "@/assets/food-pasta.jpg";
import foodPastry from "@/assets/food-pastry.jpg";
import foodSpread from "@/assets/food-spread.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodDessert from "@/assets/food-dessert.jpg";
import menuSaudi from "@/assets/menu-saudi-1.jpg";
import menuItalian from "@/assets/menu-italian-1.jpg";
import menuFrench from "@/assets/menu-french-1.jpg";
import menuJapanese from "@/assets/menu-japanese-1.jpg";
import menuFusion from "@/assets/menu-fusion-1.jpg";
import interiorImg from "@/assets/restaurant-interior.jpg";
import restAokKitchen from "@/assets/rest-aok-kitchen.jpg";
import restArchi from "@/assets/rest-archi.jpg";
import restAssouline from "@/assets/rest-assouline.jpg";
import restBrunchCake from "@/assets/rest-brunch-cake.jpg";
import restLongChim from "@/assets/rest-long-chim.jpg";
import restVillaMamas from "@/assets/rest-villa-mamas.jpg";
import restFlamingoRoom from "@/assets/rest-flamingo-room.jpg";
import restMaiz from "@/assets/rest-maiz.jpg";
import restNakhati from "@/assets/rest-nakhati.jpg";
import restSomewhere from "@/assets/rest-somewhere.jpg";
import restSumthings from "@/assets/rest-sumthings.jpg";
import restTakya from "@/assets/rest-takya.jpg";
import restTatel from "@/assets/rest-tatel.jpg";
import restSarabeths from "@/assets/rest-sarabeths.jpg";
import restSomewhereDessert from "@/assets/rest-somewhere-dessert.jpg";

// Unique gallery images
import galleryAltopianoInterior from "@/assets/gallery-altopiano-interior.jpg";
import galleryAltopianoFood from "@/assets/gallery-altopiano-food.jpg";
import galleryAngelinaInterior from "@/assets/gallery-angelina-interior.jpg";
import galleryAngelinaFood from "@/assets/gallery-angelina-food.jpg";
import galleryAokInterior from "@/assets/gallery-aok-interior.jpg";
import galleryAokFood from "@/assets/gallery-aok-food.jpg";
import galleryArchiInterior from "@/assets/gallery-archi-interior.jpg";
import galleryAseebFood from "@/assets/gallery-aseeb-food.jpg";
import galleryAseebInterior from "@/assets/gallery-aseeb-interior.jpg";
import galleryAssoulineInterior from "@/assets/gallery-assouline-interior.jpg";
import galleryBrunchInterior from "@/assets/gallery-brunch-interior.jpg";
import galleryLongchimInterior from "@/assets/gallery-longchim-interior.jpg";
import galleryLongchimFood from "@/assets/gallery-longchim-food.jpg";
import galleryVillamamasInterior from "@/assets/gallery-villamamas-interior.jpg";
import galleryFlamingoInterior from "@/assets/gallery-flamingo-interior.jpg";
import galleryMaizFood from "@/assets/gallery-maiz-food.jpg";
import galleryMaizInterior from "@/assets/gallery-maiz-interior.jpg";
import galleryNakhatiInterior from "@/assets/gallery-nakhati-interior.jpg";
import gallerySomewhereFood from "@/assets/gallery-somewhere-food.jpg";
import gallerySumthingsInterior from "@/assets/gallery-sumthings-interior.jpg";
import galleryTakyaInterior from "@/assets/gallery-takya-interior.jpg";
import galleryTatelInterior from "@/assets/gallery-tatel-interior.jpg";
import gallerySarabethsInterior from "@/assets/gallery-sarabeths-interior.jpg";
import gallerySomewhereDessertFood from "@/assets/gallery-somewhere-dessert-food.jpg";

export interface MenuItem {
  name: string;
  description: string;
  price: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export type RestaurantCategory = "مطاعم فاخرة" | "مطعم ومقهى" | "زلال" | "باب سمحان";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  category: RestaurantCategory;
  image: string;
  logo: string;
  hasBooking: boolean;
  bookingUrl?: string;
  menuUrl?: string;
  phone?: string;
  mapUrl?: string;
  description: string;
  fullDescription: string;
  hours: {
    weekdays: string;
    weekend: string;
    eid?: string;
  };
  location: string;
  gallery: string[];
  rules?: string[];
  menu: MenuCategory[];
}

export const restaurants: Restaurant[] = [
  {
    id: "altopiano",
    category: "مطاعم فاخرة" as const,
    name: "التبيانو",
    cuisine: "إيطالي",
    image: italianImg,
    logo: foodPasta,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/17/altopiano",
    menuUrl: "https://qr.finedinemenu.com/q2xxvJzlC?table=sample",
    phone: "+966 50 634 8683",
    mapUrl: "https://maps.app.goo.gl/vVM4E9dfeurNRokw8",
    description: "مطبخ جنوب إيطاليا… بروحه الأصيلة",
    fullDescription: "في ألتيبيانو، تتحوّل المكونات البسيطة والوصفات المتوارثة إلى أطباق تُروى. كل طبق يستلهم دفء جنوب إيطاليا، حيث البساطة فن، والطهي حكاية، والمائدة مساحة تجمع الناس على طعم صادق وتجربة نابضة بالأصالة. هنا، لكل نكهة جذور، ولكل طبق قصة تُقدَّم بشغف وتُشارك بفرح.",
    hours: { weekdays: "٤:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "٣:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [italianImg, galleryAltopianoInterior, galleryAltopianoFood, menuItalian],
    rules: [
      "لن يُسمح بدخول الرضع أو الأطفال بعمر 7 سنوات أو أقل بعد الساعة 7:00 مساءً",
      "الوصول المتأخر بعد 15 دقيقة من وقت الحجز لن يضمن جلوسك عند الوصول",
    ],
    menu: [
      { category: "المقبلات", items: [
        { name: "بروشيتا", description: "خبز محمّص مع طماطم طازجة وريحان وزيت زيتون", price: "٤٥ ر.س" },
        { name: "كاربتشيو", description: "شرائح لحم بقري رقيقة مع جرجير وبارميجان", price: "٦٥ ر.س" },
      ]},
      { category: "الباستا", items: [
        { name: "تالياتيلي بالكمأة", description: "باستا طازجة مع صلصة الكمأة الكريمية", price: "١١٠ ر.س" },
        { name: "رافيولي بالجبن", description: "رافيولي محشو بالريكوتا والسبانخ", price: "٩٥ ر.س" },
        { name: "سباغيتي فروتي دي ماري", description: "سباغيتي مع فواكه البحر الطازجة", price: "١٢٥ ر.س" },
      ]},
      { category: "الحلويات", items: [
        { name: "تيراميسو", description: "كعكة إيطالية كلاسيكية بالماسكاربوني والقهوة", price: "٥٥ ر.س" },
        { name: "بانا كوتا", description: "حلوى كريمية مع صلصة التوت", price: "٤٥ ر.س" },
      ]},
    ],
  },
  {
    id: "angelina",
    category: "مطاعم فاخرة" as const,
    name: "أنجلينا",
    cuisine: "فرنسي",
    image: frenchImg,
    logo: foodPastry,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/10/angelina",
    menuUrl: "https://angelinaparis.redro.menu/en/restaurant/riyadh.html",
    phone: "+966 50 955 3788",
    mapUrl: "https://maps.app.goo.gl/pB2WrYxpYKck3vQG8",
    description: "فن الحلويات الباريسية الراقي",
    fullDescription: "يدعوك مقهى أنجلينا لتذوق فن الحلويات الباريسية من خلال إبداعاته المميزة، بما في ذلك مونت-بلان الشهير، حيث يلتقي الميرانغ والكستناء والكريمة في انسجام فريد. كل قطعة حلوى تجسد رقي مقاهي باريس وجاذبيتها الخالدة، لتكون تجربة تتجاوز المذاق وتحيي لحظات الفرح واللقاء.",
    hours: { weekdays: "٩:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "٩:٠٠ صباحاً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [frenchImg, galleryAngelinaInterior, galleryAngelinaFood, foodPastry],
    menu: [
      { category: "المقبلات", items: [
        { name: "سوب أونيون", description: "حساء البصل الفرنسي مع خبز الغراتان والجبن", price: "٥٥ ر.س" },
        { name: "فوا غرا", description: "كبد الإوز مع مربى التين والخبز المحمّص", price: "١٢٠ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "كوك أو فان", description: "دجاج مطهو ببطء في صلصة النبيذ مع الخضروات", price: "١٣٥ ر.س" },
      ]},
      { category: "الحلويات", items: [
        { name: "مونت بلان", description: "حلوى الكستناء الشهيرة مع الميرانغ والكريمة", price: "٦٥ ر.س" },
        { name: "كريم بروليه", description: "كاسترد فانيلا مع طبقة كراميل مقرمشة", price: "٥٥ ر.س" },
      ]},
    ],
  },
  {
    id: "aok-kitchen",
    category: "زلال" as const,
    name: "A.O.K Kitchen",
    cuisine: "البحر المتوسط",
    image: restAokKitchen,
    logo: foodDessert,
    hasBooking: true,
    bookingUrl: "https://www.sevenrooms.com/explore/aokzallal/reservations/create/search/",
    menuUrl: "https://assets.diriyah.me/pdf/AOK+Zallal+Menu.pdf",
    phone: "+966 92 0025 304",
    description: "الطعام المتوازن بأناقة سلسة",
    fullDescription: "يدعوك A.O.K Kitchen لتجربة تناول الطعام بحرية وراحة، حيث يلتقي الطهي المتوازن مع التصميم الراقي. يحتفل المطعم بالمكونات الطبيعية والنكهات المتوازنة، الخالية من السكر المكرر وبأقل قدر من الألبان والغلوتين. كل طبق يعكس اهتمامًا مدروسًا بالتفاصيل، لتصبح كل وجبة لحظة تستحق التذوق والاستمتاع.",
    hours: { weekdays: "١١:٠٠ صباحاً - ١:٠٠ ليلاً", weekend: "٩:٠٠ صباحاً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "زلّال",
    gallery: [restAokKitchen, galleryAokInterior, galleryAokFood, menuFusion],
    menu: [
      { category: "المقبلات", items: [
        { name: "حمص بالطحينة", description: "حمص كريمي مع زيت زيتون وصنوبر", price: "٣٥ ر.س" },
        { name: "سلطة كينوا", description: "كينوا مع خضروات موسمية وصلصة الليمون", price: "٤٥ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "سلمون مشوي", description: "سلمون مع خضروات مشوية وصلصة أعشاب", price: "١٢٠ ر.س" },
        { name: "دجاج عضوي", description: "صدر دجاج عضوي مع بطاطا حلوة", price: "٩٥ ر.س" },
      ]},
    ],
  },
  {
    id: "archi",
    category: "مطعم ومقهى" as const,
    name: "آرتشي",
    cuisine: "مقهى ومخبوزات",
    image: restArchi,
    logo: foodSushi,
    hasBooking: false,
    phone: "+966 13 575 6664",
    description: "جوهر وفن القهوة السعودية",
    fullDescription: "يقدّم آرتشي تجربة المقاهي السعودية بشكل جديد، حيث تمتزج الحرفية باللمسة العصرية. من القهوة المحمصة بعناية إلى الحلويات والمأكولات الخفيفة المميزة، كل تفصيل يعكس الجودة والراحة والألفة، هنا حيث يلتقي الطعم الرفيع مع التصميم بانسجام.",
    hours: { weekdays: "٧:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "٧:٠٠ صباحاً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restArchi, galleryArchiInterior, foodPastry],
    menu: [
      { category: "المشروبات", items: [
        { name: "قهوة سعودية", description: "قهوة محمصة محلياً بعناية", price: "٢٥ ر.س" },
        { name: "لاتيه بالهيل", description: "لاتيه بنكهة الهيل العربي", price: "٣٠ ر.س" },
      ]},
      { category: "المخبوزات", items: [
        { name: "كرواسون زبدة", description: "كرواسون فرنسي طازج بالزبدة", price: "٢٠ ر.س" },
      ]},
    ],
  },
  {
    id: "aseeb",
    category: "مطاعم فاخرة" as const,
    name: "عسيب",
    cuisine: "سعودي",
    image: saudiImg,
    logo: foodSpread,
    hasBooking: true,
    bookingUrl: "https://widget.wddk.sa/123",
    menuUrl: "https://aseeb.com.sa/menu/alzallal/12",
    phone: "+966 9200 282 26",
    description: "التجربة النجدية الأصيلة",
    fullDescription: "يقدّم عسيب جوهر المطبخ النجدي الأصيل من خلال وصفات متوارثة وضيافة نجدية من القلب. من دفء الجريش إلى غنى القرصان، كل طبق يروي القصص المتوارثة والذكريات والنكهات الدائمة التي شكّلت الثقافة السعودية عبر الأجيال.",
    hours: { weekdays: "٢:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "٢:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [saudiImg, galleryAseebInterior, galleryAseebFood, menuSaudi],
    menu: [
      { category: "المقبلات", items: [
        { name: "سمبوسة لحم", description: "سمبوسة محشوة بلحم الضأن المتبّل بالبهارات", price: "٤٥ ر.س" },
        { name: "متبّل باذنجان", description: "باذنجان مشوي مع الطحينة وزيت الزيتون", price: "٣٥ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "كبسة لحم", description: "أرز بسمتي مع لحم الضأن والبهارات السعودية", price: "١٢٠ ر.س" },
        { name: "جريش", description: "قمح مجروش مع مرق اللحم التقليدي", price: "٧٥ ر.س" },
        { name: "قرصان", description: "خبز رقيق مع مرق الخضروات واللحم", price: "٨٥ ر.س" },
      ]},
      { category: "الحلويات", items: [
        { name: "لقيمات بالتمر", description: "لقيمات ذهبية مع دبس التمر والسمسم", price: "٣٥ ر.س" },
      ]},
    ],
  },
  {
    id: "assouline",
    category: "مطعم ومقهى" as const,
    name: "ميزون أسولين",
    cuisine: "فرنسي",
    image: restAssouline,
    logo: foodPastry,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/20/maison-asssouline-riyadh",
    menuUrl: "https://assets.diriyah.me/pdf/Travel+Cocktail+%2B+A+La+Carte+Menu.pdf",
    phone: "+966 92 0014 627",
    mapUrl: "https://maps.app.goo.gl/nPJPyTXyevdmW3Tz8",
    description: "ملتقى الثقافة والذوق الرفيع",
    fullDescription: "في ميزون أسولين الدرعية، يلتقي شغف الثقافة بالفضول الراقي. في ملاذ طابقين، تتناغم الكتب الثمينة مع المأكولات الراقية وألحان البيانو الحية، لتشكل تجربة تحتفي بالثقافة، والحوارات الملهمة، وروعة العيش المليء بالمعنى.",
    hours: { weekdays: "٤:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "٤:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restAssouline, galleryAssoulineInterior, menuFrench],
    menu: [
      { category: "المشروبات", items: [
        { name: "قهوة فرنسية", description: "قهوة محضرة بالطريقة الفرنسية التقليدية", price: "٣٥ ر.س" },
        { name: "شاي أسولين", description: "شاي فاخر بنكهات مختارة", price: "٤٠ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "كروك مسيو", description: "ساندويش فرنسي كلاسيكي بالجبن واللحم", price: "٧٥ ر.س" },
      ]},
    ],
  },
  {
    id: "brunch-and-cake",
    category: "مطعم ومقهى" as const,
    name: "برنش آند كيك",
    cuisine: "عالمي",
    image: restBrunchCake,
    logo: foodPasta,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/1/brunch-and-cake",
    menuUrl: "https://qr.finedinemenu.com/brunch-and-cake-al-bujairi/menu/6523d60111d51700149013ef",
    phone: "+966 59 265 7843",
    mapUrl: "https://maps.app.goo.gl/QYAKPe1oDuZ8yQqV9",
    description: "صحي بطبيعته.. ممتع بتصميمه",
    fullDescription: "حيث تتحوّل النكهات والمكونات العضوية والصحية إلى أطباق تغذي الجسد وتبهج الحواس، في أجواء مشرقة ودافئة تعكس متعة الطعام والمشاركة.",
    hours: { weekdays: "٩:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "٩:٠٠ صباحاً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restBrunchCake, galleryBrunchInterior, foodPasta, foodDessert],
    menu: [
      { category: "البرانش", items: [
        { name: "أفوكادو توست", description: "خبز محمّص مع أفوكادو وبيض مسلوق", price: "٥٥ ر.س" },
        { name: "بانكيك", description: "بانكيك مع فواكه طازجة وشراب القيقب", price: "٤٥ ر.س" },
        { name: "أسايي بول", description: "وعاء أسايي مع جرانولا وفواكه طازجة", price: "٥٠ ر.س" },
      ]},
      { category: "المشروبات", items: [
        { name: "سموذي أخضر", description: "سبانخ وموز وتفاح أخضر وزنجبيل", price: "٣٥ ر.س" },
      ]},
    ],
  },
  {
    id: "long-chim",
    category: "مطاعم فاخرة" as const,
    name: "لونغ تشيم",
    cuisine: "تايلندي",
    image: restLongChim,
    logo: foodSushi,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/5/long-chim",
    menuUrl: "https://qr.finedinemenu.com/long-chim/menu/68c43845d9ce5ed36ced407c",
    phone: "+966 59 158 3694",
    mapUrl: "https://maps.app.goo.gl/6fptEuN1GWVHvbqj9",
    description: "أجواء شوارع بانكوك بلمسة ميشلان",
    fullDescription: "يعكس لونغ تشيم الروح النابضة لأسواق بانكوك، حيث تلتقي المواقد الصاخبة، والأعشاب العطرية، والنكهات الجريئة مع براعة الطهاة الحاصلين على نجمة ميشلان. كل طبق يلتقط جوهر تايلاند الذي لا يقاوم، مقدّمًا تجربة أصيلة لا تُنسى.",
    hours: { weekdays: "٥:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restLongChim, galleryLongchimInterior, galleryLongchimFood, menuJapanese],
    menu: [
      { category: "المقبلات", items: [
        { name: "سبرنغ رول تايلندي", description: "لفائف مقرمشة مع صلصة حلوة حارة", price: "٤٠ ر.س" },
        { name: "توم يام", description: "حساء تايلندي حار بالروبيان وعشب الليمون", price: "٥٥ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "باد تاي", description: "نودلز مقلية مع الروبيان والفول السوداني", price: "٧٥ ر.س" },
        { name: "كاري أخضر", description: "كاري أخضر تايلندي مع الدجاج وحليب جوز الهند", price: "٨٥ ر.س" },
      ]},
    ],
  },
  {
    id: "villa-mamas",
    category: "مطاعم فاخرة" as const,
    name: "فيلا ماماز",
    cuisine: "بحريني",
    image: restVillaMamas,
    logo: foodSpread,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/9/villa-mamas",
    menuUrl: "https://assets.diriyah.me/pdf/VMR+MENU+EN+%26+AR+(15).pdf",
    phone: "+966 92 0066 880",
    mapUrl: "https://maps.app.goo.gl/TyzZkt7rrp6ux7Y68",
    description: "من تقاليد الخليج إلى نكهات عالمية",
    fullDescription: "من البحرين إلى لندن وأبوظبي، تقدّم ڤيلا ماماز نكهات الخليج الأصيلة للعالم. باستخدام مكوّنات عضوية وموسمية، تصنع الشيف رؤيا صالح أطباقًا نابضة بالدفء تجمع بين التراث والحداثة.. كل طبق غني بالذكريات والمعاني.",
    hours: { weekdays: "١:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restVillaMamas, galleryVillamamasInterior, foodSpread],
    menu: [
      { category: "الأطباق الرئيسية", items: [
        { name: "مچبوس دجاج", description: "أرز بسمتي مع دجاج وبهارات خليجية أصيلة", price: "٩٥ ر.س" },
        { name: "هامور مشوي", description: "سمك هامور مشوي مع أرز وصلصة خاصة", price: "١٤٠ ر.س" },
      ]},
      { category: "المقبلات", items: [
        { name: "فتوش", description: "سلطة فتوش مع خبز محمّص ودبس الرمان", price: "٤٠ ر.س" },
      ]},
    ],
  },
  {
    id: "flamingo-room",
    category: "مطاعم فاخرة" as const,
    name: "فلامينغو روم",
    cuisine: "أوروبي",
    image: restFlamingoRoom,
    logo: foodDessert,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/12/flamingo-room",
    description: "تجربة أوروبية فاخرة في قلب الدرعية",
    fullDescription: "يقدم فلامينغو روم أطباقاً أوروبية فاخرة بلمسة عصرية راقية، في أجواء أنيقة ومميزة تجمع بين الذوق الرفيع والتصميم العصري.",
    hours: { weekdays: "١:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restFlamingoRoom, galleryFlamingoInterior, foodDessert],
    menu: [
      { category: "الأطباق الرئيسية", items: [
        { name: "ستيك فيليه", description: "لحم بقري مشوي مع صلصة الفطر والبطاطا", price: "١٨٠ ر.س" },
        { name: "باستا ترافل", description: "باستا طازجة بصلصة الكمأة السوداء", price: "١٢٠ ر.س" },
      ]},
    ],
  },
  {
    id: "maiz",
    category: "مطاعم فاخرة" as const,
    name: "ميز",
    cuisine: "سعودي",
    image: restMaiz,
    logo: foodSpread,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/6/maiz",
    description: "نكهات سعودية أصيلة بلمسة معاصرة",
    fullDescription: "يقدّم مطعم ميز تجربة طعام سعودية أصيلة تحتفي بثراء المطبخ السعودي التقليدي مع لمسة معاصرة، في أجواء تراثية دافئة.",
    hours: { weekdays: "١٢:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١٢:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restMaiz, galleryMaizInterior, galleryMaizFood, menuSaudi],
    menu: [
      { category: "الأطباق الرئيسية", items: [
        { name: "مندي لحم", description: "لحم ضأن مدخّن على الحطب مع أرز المندي", price: "١١٠ ر.س" },
        { name: "كبسة دجاج", description: "أرز بسمتي مع دجاج متبّل بالبهارات", price: "٨٥ ر.س" },
      ]},
    ],
  },
  {
    id: "nakhati",
    category: "مطعم ومقهى" as const,
    name: "نكهتي",
    cuisine: "مقهى | جيلاتو",
    image: restNakhati,
    logo: foodPasta,
    hasBooking: false,
    description: "جيلاتو ومشروبات بنكهات مميزة",
    fullDescription: "يقدم نكهتي تشكيلة من الجيلاتو الإيطالي الأصيل والمشروبات المنعشة، بنكهات فريدة مستوحاة من التراث المحلي والعالمي.",
    hours: { weekdays: "١٠:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "١٠:٠٠ صباحاً - ١:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restNakhati, galleryNakhatiInterior, foodDessert],
    menu: [
      { category: "الجيلاتو", items: [
        { name: "جيلاتو تمر", description: "جيلاتو بنكهة التمر السعودي", price: "٢٥ ر.س" },
        { name: "جيلاتو فستق", description: "جيلاتو بالفستق الحلبي", price: "٢٥ ر.س" },
      ]},
    ],
  },
  {
    id: "somewhere",
    category: "مطاعم فاخرة" as const,
    name: "سموير",
    cuisine: "عربي",
    image: restSomewhere,
    logo: foodDessert,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/8/somewhere",
    description: "تجربة عربية مميزة بأجواء دافئة",
    fullDescription: "يقدم سموير تجربة طعام عربية مميزة تجمع بين النكهات العربية الأصيلة والأجواء العصرية الدافئة.",
    hours: { weekdays: "١:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restSomewhere, gallerySomewhereFood, foodSpread],
    menu: [
      { category: "الأطباق الرئيسية", items: [
        { name: "مشاوي مشكلة", description: "تشكيلة من اللحوم والدجاج المشوي", price: "١٣٠ ر.س" },
      ]},
    ],
  },
  {
    id: "sumthings",
    category: "مطعم ومقهى" as const,
    name: "صم + ثينغز",
    cuisine: "عالمي",
    image: restSumthings,
    logo: foodSushi,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/11/sum-things",
    description: "نكهات عالمية في أجواء مبتكرة",
    fullDescription: "يقدّم صم + ثينغز مزيجاً مبتكراً من الأطباق العالمية في أجواء عصرية وحيوية، حيث تلتقي المكونات المختارة بعناية مع الإبداع في التقديم.",
    hours: { weekdays: "١٢:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١٢:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restSumthings, gallerySumthingsInterior, foodSushi],
    menu: [
      { category: "المقبلات", items: [
        { name: "ديمسم مشكل", description: "تشكيلة من الديمسم الآسيوية الطازجة", price: "٦٥ ر.س" },
      ]},
    ],
  },
  {
    id: "takya",
    category: "مطاعم فاخرة" as const,
    name: "تكية",
    cuisine: "سعودي",
    image: restTakya,
    logo: foodSpread,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/16/takya",
    description: "ضيافة سعودية تقليدية بامتياز",
    fullDescription: "يحتفي مطعم تكية بالضيافة السعودية التقليدية، حيث يُقدّم أطباقاً مستوحاة من المطبخ النجدي في أجواء تراثية أصيلة تعكس كرم الضيافة العربية.",
    hours: { weekdays: "٢:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "٢:٠٠ مساءً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restTakya, galleryTakyaInterior, galleryAseebFood],
    menu: [
      { category: "الأطباق الرئيسية", items: [
        { name: "مفطح لحم", description: "خروف كامل مع أرز وبهارات تقليدية", price: "٢٥٠ ر.س" },
        { name: "هريس", description: "قمح مطحون مع لحم الضأن المطبوخ ببطء", price: "٨٥ ر.س" },
      ]},
    ],
  },
  {
    id: "tatel",
    category: "باب سمحان" as const,
    name: "تاتيل",
    cuisine: "إسباني",
    image: restTatel,
    logo: foodDessert,
    hasBooking: false,
    description: "النكهات الإسبانية بأسلوب عصري",
    fullDescription: "يقدم تاتيل تجربة طعام إسبانية أصيلة بأسلوب عصري، حيث تلتقي التاباس الكلاسيكية مع الأطباق الإسبانية الحديثة في أجواء نابضة بالحياة.",
    hours: { weekdays: "١:٠٠ مساءً - ١٢:٠٠ ليلاً", weekend: "١:٠٠ مساءً - ١:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restTatel, galleryTatelInterior, foodPasta],
    menu: [
      { category: "التاباس", items: [
        { name: "باتاتاس برافاس", description: "بطاطا مقلية مع صلصة حارة وأيولي", price: "٤٠ ر.س" },
        { name: "كروكيتاس", description: "كروكيت بالجبن والهام الإسباني", price: "٤٥ ر.س" },
      ]},
      { category: "الأطباق الرئيسية", items: [
        { name: "باييلا", description: "أرز إسباني مع فواكه البحر والزعفران", price: "١٤٠ ر.س" },
      ]},
    ],
  },
  {
    id: "sarabeths",
    category: "مطعم ومقهى" as const,
    name: "سارابيث",
    cuisine: "أمريكي",
    image: restSarabeths,
    logo: foodPasta,
    hasBooking: true,
    bookingUrl: "https://tickets.bujairi.sa/ar/Restaurants/b/7/sarabeth",
    description: "كلاسيكيات أمريكية بلمسة راقية",
    fullDescription: "يقدم سارابيث تجربة البرانش والوجبات الأمريكية الكلاسيكية بلمسة راقية، مع معجنات وحلويات محضرة يدوياً يومياً.",
    hours: { weekdays: "٩:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "٩:٠٠ صباحاً - ١:٠٠ ليلاً", eid: "١٢:٠٠ مساءً - ٢:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restSarabeths, gallerySarabethsInterior, foodPastry],
    menu: [
      { category: "البرانش", items: [
        { name: "فرنش توست", description: "توست فرنسي مع فراولة طازجة وكريمة", price: "٦٠ ر.س" },
        { name: "بيض بنديكت", description: "بيض مسلوق مع صلصة هولنديز ولحم مقدد", price: "٧٠ ر.س" },
      ]},
    ],
  },
  {
    id: "somewhere-dessert",
    category: "مطعم ومقهى" as const,
    name: "مقهى وحلويات سموير",
    cuisine: "عربي",
    image: restSomewhereDessert,
    logo: foodPastry,
    hasBooking: false,
    description: "حلويات عربية بتجربة مميزة",
    fullDescription: "يقدم مقهى وحلويات سموير تشكيلة مميزة من الحلويات العربية والمشروبات الساخنة والباردة في أجواء مريحة.",
    hours: { weekdays: "١٠:٠٠ صباحاً - ١٢:٠٠ ليلاً", weekend: "١٠:٠٠ صباحاً - ١:٠٠ ليلاً" },
    location: "مطل البجيري",
    gallery: [restSomewhereDessert, gallerySomewhereDessertFood, foodPastry],
    menu: [
      { category: "الحلويات", items: [
        { name: "كنافة", description: "كنافة نابلسية بالجبن مع شراب القطر", price: "٤٥ ر.س" },
        { name: "بقلاوة", description: "بقلاوة مشكلة بالفستق والجوز", price: "٣٥ ر.س" },
      ]},
    ],
  },
];
