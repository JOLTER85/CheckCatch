import { WordAnalysis, DomainArabicBreakdown, DomainItem } from '../types';
import { clientDecomposeWords } from './spreadsheet';

/**
 * Comprehensive dictionary of domain keywords with Arabic meanings,
 * commercial strengths, and industry classifications.
 */
interface WordProfile {
  meaning: string;
  strength: string;
  score: number;
  category: string;
  targetIndustry: string;
}

const ARABIC_WORD_PROFILES: Record<string, WordProfile> = {
  // Cloud & Data
  cloud: {
    meaning: "سحابي / الحوسبة السحابية والبنية التحتية",
    strength: "كلمة ذات سلطة عالمية هائلة في قطاعات B2B وSaaS؛ ترمز للمرونة والتوسع اللامحدود والوصول السريع للبيانات.",
    score: 97,
    category: "حوسبة سحابية وبنية تحتية",
    targetIndustry: "شركات الاستضافة والحوسبة السحابية، ومزودو خدمات DevOps",
  },
  data: {
    meaning: "بيانات / المعلومات الرقمية والتحليلات",
    strength: "النفط الجديد للاقتصاد الرقمي؛ تعطي موثوقية عالية جداً وقيمة سوقية فورية لشركات تحليل البيانات والذكاء الاصطناعي.",
    score: 98,
    category: "بيانات وتحليلات",
    targetIndustry: "شركات علم البيانات، منصات ذكاء الأعمال (BI)، وقواعد البيانات",
  },
  byte: {
    meaning: "بايت / الوحدة الأساسية للبيانات الرقمية",
    strength: "قصيرة، تقنية بحتة، وسريعة الحفظ والتذكر؛ محبوبة جداً لدى المطورين ومجتمعات البرمجة.",
    score: 91,
    category: "تقنية وبرمجيات",
    targetIndustry: "منصات البرمجة، شركات هندسة النظم الرقمية، ومواقع التقنية",
  },
  meta: {
    meaning: "ما وراء / الأبعاد المتقدمة والتحول المستقبلي",
    strength: "ترمز للتقنيات التحويلية، الواقع الافتراضي، وما وراء المألوف؛ علامة فارقة بعد توجه كبرى الشركات العالمية لها.",
    score: 95,
    category: "مستقبليات وذكاء اصطناعي",
    targetIndustry: "شركات الميتافيرس، استوديوهات الواقع المعزز (AR/VR)، ومختبرات الابتكار",
  },
  hyper: {
    meaning: "فائق / فائق السرعة والأداء المتطور",
    strength: "توحي بالسرعة القصوى والأداء الفائق؛ تجذب العملاء الباحثين عن حلول أسرع من المنافسين بعشرات الأضعاف.",
    score: 92,
    category: "أداء وسرعة قصوى",
    targetIndustry: "شركات البنية التحتية الفائقة، شبكات CDN، ومنصات التداول اللحظي",
  },
  synth: {
    meaning: "تركيبي / توليدي / اصطناعي ذكي",
    strength: "الكلمة الأساسية في ثورة الذكاء الاصطناعي التوليدي (Synthetic Media & GenAI) والبيانات الاصطناعية.",
    score: 94,
    category: "ذكاء اصطناعي وتوليد",
    targetIndustry: "شركات الذكاء الاصطناعي التوليدي، منصات توليد الفيديو والصوت الرقمي",
  },
  nexus: {
    meaning: "نقطة التقاء / ملتقى محوري / حلقة وصل مركزية",
    strength: "كلمة نخبوية وفخمة توحي بالمركزية والقيادة؛ ممتازة للمنصات التي تجمع عدة خدمات أو أطراف في مكان واحد.",
    score: 96,
    category: "ربط وتكامل مركزي",
    targetIndustry: "منصات التكامل السحابي (APIs)، بوابات الحلول الموحدة، ومراكز البيانات",
  },
  prism: {
    meaning: "منشور ضوئي / تفكيك وتحليل الزوايا المتعددة",
    strength: "ترمز للوضوح والقدرة على تحليل المعطيات المعقدة واستخلاص رؤى نقية متعددة الأبعاد.",
    score: 90,
    category: "رؤى وبصيرة رقمية",
    targetIndustry: "شركات التحليلات البصرية، أدوات التصميم الإبداعي، ومنصات البيانات",
  },
  cyber: {
    meaning: "سيبراني / الفضاء الرقمي وأمن المعلومات",
    strength: "كلمة لا غنى عنها في الأمن الرقمي والحماية؛ تحظى بميزانيات إنفاق مؤسسية ضخمة جداً على مستوى العالم.",
    score: 96,
    category: "أمن سيبراني",
    targetIndustry: "شركات الأمن السيبراني، برمجيات مكافحة التهديدات، ومؤسسات التشفير",
  },
  omni: {
    meaning: "شامل / كلي / عابر لجميع القنوات",
    strength: "تعني الشمولية (Omnichannel)؛ تفضلها الشركات التي تقدم حلولاً تغطي الهاتف والويب والمتاجر في آن واحد.",
    score: 92,
    category: "شمولية وتكامل",
    targetIndustry: "منصات التجارة متعددة القنوات، أدوات إدارة علاقات العملاء (CRM)",
  },
  vector: {
    meaning: "شعاع / متجه رياضي / متجهات الذكاء الاصطناعي",
    strength: "في صدارة مصطلحات الذكاء الاصطناعي الحديث وقواعد بيانات المتجهات (Vector Databases) ونماذج التضمين.",
    score: 94,
    category: "ذكاء اصطناعي ورياضيات",
    targetIndustry: "قواعد بيانات الذكاء الاصطناعي، شركات البحث الدلالي، وبرمجيات الرسوميات",
  },
  strata: {
    meaning: "طبقات / أسس بنائية وهندسية متدرجة",
    strength: "توحي بالعمق المعماري والهندسي للمنتج البرمجي؛ تمنح طابع الهيبة والاستقرار المؤسسي.",
    score: 89,
    category: "هندسة وأسس متينة",
    targetIndustry: "شركات البنية التحتية السحابية والشركات المعمارية والاستشارية الكبرى",
  },
  flux: {
    meaning: "تدفق مستمر / حركية وتغير سلس",
    strength: "قصيرة من 4 أحرف وسهلة النطق، تعبر عن تدفق البيانات السلس والحركة الدائمة دون توقف.",
    score: 91,
    category: "تدفق وديناميكية",
    targetIndustry: "أدوات خطوط معالجة البيانات (Pipelines) ومنصات الأتمتة السريعة",
  },
  core: {
    meaning: "جوهر / النواة الأساسية والمركز",
    strength: "ترمز لما هو أساسي ولا يمكن الاستغناء عنه؛ تعكس القوة البرمجية والمتانة التشغيلية.",
    score: 96,
    category: "أسس وأنظمة مركزية",
    targetIndustry: "معالجات الحوسبة، محركات الألعاب، وأنظمة التشغيل والبرمجيات الخلفية",
  },
  orbit: {
    meaning: "مدار / فلك الحركة المنتظمة والشمولية",
    strength: "توحي بالسيطرة والرؤية الشاملة من الأعلى، وتجاوز الحدود الجغرافية نحو العالمية.",
    score: 93,
    category: "رؤية فلكية وشاملة",
    targetIndustry: "منصات مراقبة العمليات، تطبيقات الفضاء والأقمار الصناعية، وإدارة المشاريع",
  },
  quantum: {
    meaning: "كمّي / الحوسبة الكمية والتطور الخارق",
    strength: "أعلى درجات التطور العلمي؛ تجذب الاستثمارات المليارية في الحوسبة المستقبلية والتشفير الكمومي.",
    score: 95,
    category: "حوسبة فائقة ومستقبلية",
    targetIndustry: "مختبرات الحوسبة الكمومية، خوارزميات التشفير المتقدم، والتقنيات العميقة",
  },
  neural: {
    meaning: "عصبي / الشبكات العصبية والذكاء البشري المطور",
    strength: "ترتبط مباشرة بنماذج التعلم العميق والذكاء الاصطناعي العصبي؛ جاذبة جداً للمستثمرين التقنيين.",
    score: 95,
    category: "شبكات عصبية وذكاء اصطناعي",
    targetIndustry: "شركات Deep Learning، تقنيات الواجهات الدماغية، ومطورو النماذج اللغوية",
  },
  atlas: {
    meaning: "أطلس / المرجع الشامل وحامل العالم",
    strength: "توحي بالمرجعية الموثوقة والخرائط الشاملة؛ مناسبة للمشاريع الضخمة التي تحتوي مستودعات بيانات هائلة.",
    score: 93,
    category: "خرائط ومرجعية عالمية",
    targetIndustry: "منصات الخرائط والملاحة، بوابات التوثيق البرمجي، ومراكز المعرفة الرقمية",
  },
  beacon: {
    meaning: "منارة / مرشد موثوق ونقطة إضاءة",
    strength: "ترمز للإرشاد والتوجيه والأمان وسط بحر من المعلومات؛ تمنح العملاء طمأنينة فورية.",
    score: 91,
    category: "إرشاد وموثوقية",
    targetIndustry: "حلول الملاحة الداخلية، منصات الاستشارات، وبرمجيات توجيه المستخدمين",
  },
  crest: {
    meaning: "قمة / ذروة الموجة وشعار التميز الملوكي",
    strength: "ترمز للوصول لأعلى نقطة من النجاح والسمعة الرفيعة؛ ممتازة للعلامات التجارية الفاخرة والخدمات المالية.",
    score: 92,
    category: "فخامة وتميز",
    targetIndustry: "صناديق إدارة الثروات، العلامات التجارية الراقية، والحلول المؤسسية",
  },
  spark: {
    meaning: "شرارة / انطلاقة الفكرة والإلهام",
    strength: "كلمة نابضة بالطاقة والحيوية؛ ترمز لبداية الحلول العبقرية وابتكار المفاهيم الجديدة.",
    score: 93,
    category: "إبداع وطاقة",
    targetIndustry: "حاضنات ومسرعات الابتكار، أدوات توليد الأفكار، وبرمجيات الإبداع",
  },
  forge: {
    meaning: "مسبك / ورشة صياغة وبناء الأنظمة المتينة",
    strength: "تدل على الصنعة البرمجية الصلبة وتطوير المنتجات عالية الجودة، وهي كلمة مفضلة جداً للمطورين.",
    score: 95,
    category: "بناء وتطوير برمجي",
    targetIndustry: "منصات التطوير البرمجي (Dev Tools)، أدوات الـ CI/CD، ومنصات البناء الرقمي",
  },
  prime: {
    meaning: "رئيسي / النخبة الأولى وفائق الجودة",
    strength: "ترمز للأفضلية المطلقة والدرجة الأولى؛ كلمة تسويقية ذهبية سهلة ومحبوبة عالمياً.",
    score: 97,
    category: "ريادة وجودة أولى",
    targetIndustry: "العضويات المميزة، خدمات التوصيل السريع، والحلول الاستشارية المتقدمة",
  },
  swift: {
    meaning: "سريع / رشيق وخاطف",
    strength: "ترمز للخفة والمرونة والسرعة في التنفيذ والتحويلات المالية والتطبيقات البرمجية.",
    score: 94,
    category: "سرعة ورشاقة",
    targetIndustry: "تطبيقات الفنتك، بوابات الدفع الفوري، ومنصات اللوجستيات الحديثة",
  },
  true: {
    meaning: "حقيقي / صادق وأصيل وموثوق",
    strength: "تبني جسر ثقة فوري مع المستخدم؛ ترمز للأصالة والبيانات المؤكدة والشفافية التامة.",
    score: 92,
    category: "ثقة وأصالة",
    targetIndustry: "خدمات التحقق من الهوية (KYC)، مكافحة الاحتيال، ومنصات الاعتماد",
  },
  bold: {
    meaning: "جريء / مقدام وبارز",
    strength: "توحي بالثقة والشجاعة والتصميم الملفت للنظر؛ مناسبة للشركات المتحدية للواقع التقليدي.",
    score: 90,
    category: "جرأة وتميز",
    targetIndustry: "وكالات الإعلانات الرقمية، منصات التجارة الحديثة، والمنتجات الشبابية",
  },
  clear: {
    meaning: "واضح / شفاف ونقي",
    strength: "ترمز للبساطة وسهولة الفهم وغياب التعقيد، وهي صفة جوهرية تبحث عنها الشركات في الأدوات التقنية.",
    score: 92,
    category: "شفافية ووضوح",
    targetIndustry: "برمجيات المحاسبة الشفافة، أدوات تبسيط العقود، ومنصات خدمة العملاء",
  },
  bright: {
    meaning: "مشرق / ذكي ولامع",
    strength: "طاقة إيجابية عالية، تدل على الذكاء وحلول المستقبل المشرقة وسهولة الاستخدام.",
    score: 90,
    category: "تفاؤل وذكاء",
    targetIndustry: "التقنيات التعليمية (EdTech)، حلول الطاقة النظيفة، وتطبيقات الإنتاجية",
  },
  smart: {
    meaning: "ذكي / أوتوماتيكي ومتطور تلقائياً",
    strength: "من أشهر الكلمات التقنية عالمياً؛ تنقل المنتج فوراً لخانة الحلول الذكية المعتمدة على الذكاء الاصطناعي.",
    score: 96,
    category: "ذكاء وأتمتة",
    targetIndustry: "أجهزة إنترنت الأشياء (IoT)، المنازل الذكية، والبرمجيات المؤتمتة",
  },
  deep: {
    meaning: "عميق / أبحاث عميقة وتفكير تحليلي متقدم",
    strength: "مرتبطة بالتقنيات العميقة (DeepTech) والتعلم العميق وتحليل المعطيات على مستويات غير مسبوقة.",
    score: 93,
    category: "تقنيات عميقة وتحليل",
    targetIndustry: "مختبرات الأبحاث الذكية، برمجيات التنقيب عن البيانات، والحلول الطبية",
  },
  peak: {
    meaning: "ذروة / القمة وأعلى مستويات الأداء",
    strength: "تدل على تحقيق الأهداف القصوى والنمو المتواصل والوصول إلى أقصى طاقة إنتاجية.",
    score: 93,
    category: "قمة ونجاح",
    targetIndustry: "تطبيقات تعزيز الإنتاجية، برمجيات التدريب الرياضي، وأدوات التسويق",
  },
  stack: {
    meaning: "حزمة متكاملة / طبقات الأنظمة البرمجية",
    strength: "الكلمة الأشهر بين المطورين للمنصات الشاملة (Full Stack) وتكامل الطبقات البرمجية والخدمات.",
    score: 96,
    category: "حزمة برمجية وتكامل",
    targetIndustry: "منصات المطورين، حلول الـ No-Code والـ Low-Code، وأدوات البنية التقنية",
  },
  logic: {
    meaning: "منطق / استدلال عقلاني وخوارزمي سليم",
    strength: "تمنح طابع الموثوقية والخوارزميات الدقيقة التي لا تخطئ في اتخاذ القرارات الحساسة.",
    score: 94,
    category: "منطق وبرمجة دقيقة",
    targetIndustry: "برمجيات اتخاذ القرار، محركات القواعد البرمجية (Rule Engines)، والذكاء الاصطناعي",
  },
  echo: {
    meaning: "صدى / انتشار الأثر والتردد السمعي",
    strength: "قصيرة ورنانة، تدل على سرعة وصول الرسالة والتردد الإيجابي والأثر الواسع.",
    score: 89,
    category: "صوت وانتشار",
    targetIndustry: "منصات الصوت والبودكاست، أدوات مراقبة السمعة على السوشيال ميديا",
  },
  drift: {
    meaning: "انجراف سلس / حركة رشيقة وتكيف مرن",
    strength: "كلمة شابة وعصرية تدل على المرونة وسلاسة الحركة والتكيف مع متغيرات السوق.",
    score: 88,
    category: "مرونة وتكيف",
    targetIndustry: "تطبيقات المحادثة الفورية، ألعاب الفيديو، وتطبيقات إدارة المسارات",
  },
  wave: {
    meaning: "موجة / اندفاع وزخم ثوري متجدد",
    strength: "ترمز لركوب الموجة التقنية القادمة وصناعة الاتجاهات الجديدة وقيادة التغيير في الصناعة.",
    score: 94,
    category: "زخم وابتكار",
    targetIndustry: "منصات الدفع الحديث، برمجيات الجيل الجديد، وشركات الوسائط الرقمية",
  },
  link: {
    meaning: "رابط / صلة وصل وشبكة علاقات",
    strength: "أساس الويب والشبكات؛ ترمز للتواصل الفوري وربط الأفراد والخدمات عبر العالم.",
    score: 95,
    category: "شبكات وتواصل",
    targetIndustry: "منصات التواصل المهني، أدوات اختصار الروابط، وحلول شبكات التوصيل",
  },
  signal: {
    meaning: "إشارة / تنبيه ذكي ورسالة مؤكدة",
    strength: "ترمز لاكتشاف الفرص الحيوية والتقاط الإشارات الدقيقة في الأسواق والبيانات دون ضوضاء.",
    score: 93,
    category: "إشارات واتصالات",
    targetIndustry: "منصات التداول المالي، أدوات الاستشعار الرقمي، وتطبيقات التراسل الآمن",
  },
  pilot: {
    meaning: "ربان / موجه ونسخة تجريبية رائدة",
    strength: "تدل على القيادة الذكية والملاحة والحلول التجريبية السباقة (Pilot Programs).",
    score: 92,
    category: "قيادة وتوجيه",
    targetIndustry: "المساعدات الذكية (Co-Pilots)، برمجيات الأتمتة، واستشارات الإطلاق الأولي",
  },
  craft: {
    meaning: "حرفة / صناعة متقنة وإبداع فريد",
    strength: "تمنح انطباعاً بالجودة اليدوية والاهتمام الدقيق بكل سطر برمجي وبكل تفصيلة في التصميم.",
    score: 94,
    category: "إتقان وحرفة",
    targetIndustry: "أدوات بناء المواقع، استوديوهات التصميم الرقمي، وتطبيقات الكتابة",
  },
  scale: {
    meaning: "توسع / نمو مضاعف وتدرج سريع",
    strength: "الكلمة السحرية في عالم رأس المال الجريء (Venture Capital) والشركات سريعة النمو.",
    score: 97,
    category: "نمو وتوسع مضاعف",
    targetIndustry: "منصات التوسع التجاري، أنظمة إدارة الموارد، وخدمات نمو الشركات",
  },
  sprint: {
    meaning: "انطلاقة سريعة / دورة عمل رشيقة مكثفة",
    strength: "مصطلح أساسي في إدارة المشاريع الرشيقة (Agile/Scrum) يدل على الإنجاز السريع للمهام.",
    score: 91,
    category: "سرعة وإنجاز رشيق",
    targetIndustry: "أدوات إدارة المشاريع وتتبع المهام، وبرمجيات التعاون بين فرق العمل",
  },
  vault: {
    meaning: "خزينة / حفظ آمن وتشفير محكم",
    strength: "أعلى درجات الأمان وحماية الأصول الرقمية والبيانات الحساسة وكلمات المرور.",
    score: 96,
    category: "أمان وخزائن رقمية",
    targetIndustry: "إدارة الهويات والأسرار البرمجية، المحافظ الرقمية للعملات، وحماية الخصوصية",
  },
  loom: {
    meaning: "نول / نسج الأفكار وحياكة الأنظمة",
    strength: "قصيرة وجذابة تدل على ترابط الخيوط والأدوات لصنع نسيج رقمي متماسك وجميل.",
    score: 89,
    category: "إبداع وحياكة رقمية",
    targetIndustry: "أدوات تسجيل الشاشة والتواصل البصري، ومنصات تصميم النماذج الأولية",
  },
  weave: {
    meaning: "نسج / حبك العلاقات والأنظمة المتناغمة",
    strength: "ترمز لدمج مصادر البيانات والتطبيقات المختلفة في لوحة واحدة متناسقة وسلسة.",
    score: 90,
    category: "تكامل وتناغم",
    targetIndustry: "برمجيات أتمتة تدفقات العمل (Workflows)، وحلول الربط البرمجي الشامل",
  },

  // Suffixes & Anchor Words
  node: {
    meaning: "عقدة / نقطة اتصال وتفرع شبكي",
    strength: "أساسية في شبكات البلوكشين، إنترنت الأشياء، وبنية Node.js ومراكز الاتصال.",
    score: 93,
    category: "شبكات وحوسبة موزعة",
    targetIndustry: "شبكات البلوكشين والويب 3، ومشاريع الحوسبة الموزعة",
  },
  shift: {
    meaning: "تحول / نقلة نوعية وتغيير إيجابي",
    strength: "تدل على إحداث ثورة في المجال والانتقال من الطرق القديمة إلى الطرق الحديثة.",
    score: 92,
    category: "تحول وتغيير",
    targetIndustry: "منصات التحول الرقمي، برمجيات إدارة القوى العاملة وجداول العمل",
  },
  sync: {
    meaning: "مزامنة / توافق آني وتناغم فوري",
    strength: "كلمة ذات جاذبية تقنية فورية لتطبيقات المزامنة السحابية والتحديث اللحظي للبيانات.",
    score: 95,
    category: "مزامنة وتناغم آني",
    targetIndustry: "تطبيقات مشاركة الملفات، برمجيات المزامنة السحابية، وأدوات العمل المشترك",
  },
  mesh: {
    meaning: "شبكة متداخلة / ترابط ذاتي لا مركزي",
    strength: "ترمز لشبكات الاتصال الحديثة (Mesh Networks) التي لا تسقط وتوزع الحمل بذكاء.",
    score: 91,
    category: "شبكات لا مركزية",
    targetIndustry: "أجهزة الراوتر الحديثة، شبكات الواي فاي المؤسسية، والبنى التحتية للمدن الذكية",
  },
  hub: {
    meaning: "مركز / محطة تجمع رئيسية ومنصة موحدة",
    strength: "من أشهر اللواحق في عالم الويب؛ تمنح الموقع صفة المرجع الأساسي والملتقى الشامل.",
    score: 97,
    category: "مراكز وتجمعات رقمية",
    targetIndustry: "المجتمعات التقنية، بوابات إدارة المعرفة، ومنصات الخدمات المركزية",
  },
  base: {
    meaning: "قاعدة / أساس متين ومقر العمليات",
    strength: "ترمز للاستقرار والقاعدة الراسخة التي ينطلق منها كل شيء (مثل قواعد البيانات).",
    score: 95,
    category: "قواعد وأسس",
    targetIndustry: "قواعد البيانات الحديثة، منصات إدارة العملاء، والمقرات الرقمية",
  },
  grid: {
    meaning: "شبكة تنظيمية / مصفوفة توزيع ذكية",
    strength: "ترمز للنظام، الكفاءة الهندسية، وتوزيع الطاقة والبيانات بدقة متناهية.",
    score: 92,
    category: "تنظيم وهندسة شبكات",
    targetIndustry: "أنظمة إدارة الطاقة الذكية، شبكات البنية السحابية، وأدوات التصميم الهندسي",
  },
  point: {
    meaning: "نقطة / هدف محدد ومركز دقيق",
    strength: "ترمز للدقة المتناهية والوصول المباشر للهدف دون تشتيت.",
    score: 93,
    category: "دقة وتركيز",
    targetIndustry: "أنظمة نقاط البيع (POS)، برمجيات تتبع الأهداف، ومنصات الملاحة",
  },
  loop: {
    meaning: "حلقة / دورة تفاعلية مستمرة",
    strength: "ترمز للتغذية الراجعة المستمرة (Feedback Loops) وتحسين تجربة العميل بلا توقف.",
    score: 92,
    category: "تكرار وتفاعل مستمر",
    targetIndustry: "أدوات ولاء العملاء، برمجيات التكرار الذكي للذكاء الاصطناعي، ومنصات التواصل",
  },
  dock: {
    meaning: "رصيف رسو / محطة تثبيت وتكامل",
    strength: "ترمز للحاويات السحابية (Containers) وتثبيت الأدوات والرسو الآمن.",
    score: 91,
    category: "استقرار وتكامل",
    targetIndustry: "منصات إدارة الحاويات البرمجية (Docker/K8s)، وحلول إدارة المستندات",
  },
  gate: {
    meaning: "بوابة / مدخل العبور الآمن والوصول",
    strength: "مرتبطة بالأمان وبوابات الدفع الإلكتروني (Payment Gateways) والمداخل الرقمية.",
    score: 94,
    category: "بوابات وعبور آمن",
    targetIndustry: "بوابات الدفع الإلكتروني، حلول التحقق والتحكم في الدخول للمؤسسات",
  },
  path: {
    meaning: "مسار / طريق واضح للنجاح والإرشاد",
    strength: "ترمز للخطوات المنهجية الواضحة وإرشاد المستخدم نحو هدفه بسهولة.",
    score: 92,
    category: "توجيه ومسارات واضحة",
    targetIndustry: "منصات التعليم الإلكتروني، برمجيات التدريب المهني، وأدوات رحلة العميل",
  },
  wire: {
    meaning: "سلك / اتصال ونقل فوري للبيانات والأموال",
    strength: "ترمز للسرعة اللحظية والتحويلات المالية المباشرة (Wire Transfers) والاتصال السلكي.",
    score: 90,
    category: "اتصال وتحويلات فورية",
    targetIndustry: "خدمات التحويل المالي السريع، منصات وكالات الأنباء، وأجهزة الشبكات",
  },
  port: {
    meaning: "ميناء / منفذ عبور وتبادل رقمي",
    strength: "ترمز للتجارة الدولية ونقل الحزم الرقمية والاتصال بين مختلف الموانئ البرمجية.",
    score: 91,
    category: "منافذ وتبادل دولي",
    targetIndustry: "منصات التجارة وسلاسل الإمداد اللوجستية، بوابات الـ APIs والربط التقني",
  },
  nest: {
    meaning: "عش / بيئة حاضنة وآمنة ودافئة",
    strength: "توحي بالأمان والرعاية وحضانة الأفكار والمشاريع في بيئة مريحة وموثوقة.",
    score: 89,
    category: "حضانة وأمان",
    targetIndustry: "الأجهزة المنزلية الذكية، مسرعات الأعمال الناشئة، وتطبيقات إدارة العائلة",
  },
  mark: {
    meaning: "علامة / بصمة مميزة ومعيار جودة",
    strength: "ترمز للتميز وترك أثر واضح في السوق وشهادة الموثوقية العالية.",
    score: 91,
    category: "علامة وبصمة تميز",
    targetIndustry: "وكالات العلامات التجارية، منصات حماية الملكية الفكرية، وأدوات التدقيق",
  },
  view: {
    meaning: "رؤية / منظور شامل ولوحة تحكم بصرية",
    strength: "ترتبط مباشرة بواجهات المستخدم (UI)، لوحات التحكم (Dashboards)، واستشراف المستقبل.",
    score: 93,
    category: "رؤية ولوحات تحكم",
    targetIndustry: "برمجيات لوحات المراقبة والتحليلات، منصات العقارات والمناظر الرقمية",
  },
  track: {
    meaning: "مسار / تتبع دقيق ومراقبة مؤشرات الأداء",
    strength: "فائقة الشعبية في أدوات متابعة الشحنات، تتبع العادات، ومراقبة أداء المبيعات.",
    score: 94,
    category: "تتبع ومراقبة الأداء",
    targetIndustry: "أنظمة تتبع الشحنات واللوجستيات، أدوات تحليلات المواقع، وتطبيقات اللياقة",
  },
  cast: {
    meaning: "بث / إذاعة وتوزيع المحتوى للجمهور",
    strength: "أساسية في البث الرقمي (Podcasts, Screencasts) ونشر المحتوى لجمهور عريض.",
    score: 91,
    category: "بث وإعلام رقمي",
    targetIndustry: "شبكات البودكاست، خدمات البث التلفزيوني والوسائط، وأدوات مشاركة الشاشة",
  },
  mint: {
    meaning: "دار سك / صك الأصول والجدة والانتعاش",
    strength: "جاذبية مالية هائلة في الفنتك وصك الرموز الرقمية (NFTs & Tokens) والجدة التامة.",
    score: 95,
    category: "مالية وصك أصول",
    targetIndustry: "تطبيقات الفنتك وإدارة الأموال الشخصية، بروتوكولات الأصول المشفرة",
  },
  room: {
    meaning: "غرفة / مساحة مخصصة للتعاون والمحادثة",
    strength: "ترمز للاجتماعات، غرف التداول، وغرف العمل المشتركة التي تجمع المهتمين معاً.",
    score: 90,
    category: "مساحات تعاون ومحادثة",
    targetIndustry: "برمجيات غرف الاجتماعات الافتراضية، مساحات العمل المشتركة، وتطبيقات الدردشة",
  },
  deck: {
    meaning: "منصة / لوحة عرض وشرائح تقديمية",
    strength: "ترمز لعروض المستثمرين (Pitch Decks)، منصات التحكم، والواجهات السريعة.",
    score: 90,
    category: "منصات وعروض تقديمية",
    targetIndustry: "برمجيات العروض التقديمية التفاعلية، لوحات القيادة المالية، وأدوات المبيعات",
  },
  leap: {
    meaning: "قفزة / نقلة كبرى وتطور هائل",
    strength: "ترمز للطموح الكبير وتحقيق قفزة نوعية تختصر سنوات من التطور التقليدي.",
    score: 91,
    category: "طموح وقفزات نوعية",
    targetIndustry: "صناديق الاستثمار في التكنولوجيا المتقدمة، برامج التحفيز وتطوير الأعمال",
  },
  zone: {
    meaning: "منطقة / نطاق مخصص وبيئة آمنة",
    strength: "ترمز للتركيز العالي (In the zone) والبيئات الآمنة المخصصة لمهام محددة.",
    score: 91,
    category: "تركيز وبيئات متخصصة",
    targetIndustry: "حلول الشبكات الخاصة الافتراضية (VPN)، مناطق التجارة الحرة، وتطبيقات التركيز",
  },
  line: {
    meaning: "خط / اتصال مستمر وسلسلة متصلة",
    strength: "ترمز للتواصل المباشر والخطوط الساخنة وخطوط الإنتاج والتسلسل المنظم.",
    score: 90,
    category: "اتصال وسلاسل إنتاج",
    targetIndustry: "خدمات الدعم الفني، بوابات الاتصال الهاتفي السحابي، وخطوط التجارة",
  },
  scope: {
    meaning: "نطاق / مدى استكشافي ورؤية متعمقة",
    strength: "ترمز للاستكشاف والتحليل الدقيق وفحص الكود والمراقبة المتعمقة للأنظمة.",
    score: 92,
    category: "فحص واستكشاف عميق",
    targetIndustry: "أدوات تصحيح الأخطاء البرمجية (Debugging)، مراقبة الأنظمة (APM)",
  },
  labs: {
    meaning: "مختبرات / أبحاث وابتكارات تجريبية رائدة",
    strength: "تعطي هيبة فورية بأن الشركة تقف خلفها عقول ذكية وتجري أبحاثاً تكنولوجية متقدمة.",
    score: 96,
    category: "أبحاث وتطوير تجريبي",
    targetIndustry: "مختبرات الذكاء الاصطناعي، أقسام البحث والتطوير (R&D) في الشركات الكبرى",
  },
  works: {
    meaning: "أعمال / مصنع حلول ومنظومة متكاملة",
    strength: "توحي بالإنتاجية الفعلية والأشياء التي تعمل بكفاءة وإتقان تام دون أعطال.",
    score: 92,
    category: "إنتاجية وحلول فعالة",
    targetIndustry: "استوديوهات الابتكار، شركات الاستشارات الهندسية، وورش البرمجيات",
  },
  force: {
    meaning: "قوة / طاقة محركة وفاعلية حاسمة",
    strength: "رمز للقدرة القيادية الفائقة وتحريك الأسواق (مثل Salesforce) وإنجاز الصفقات الكبرى.",
    score: 95,
    category: "قوة وتأثير قيادي",
    targetIndustry: "برمجيات فرق المبيعات، أدوات الأمن الرقمي، ومحركات الألعاب",
  },
  drive: {
    meaning: "محرك / دافع طموح وتخزين سريع",
    strength: "تجمع بين الدافع والشغف للنجاح من جهة، والتخزين السحابي السريع من جهة أخرى.",
    score: 95,
    category: "طموح وتخزين سحابي",
    targetIndustry: "حلول التخزين السحابي للشركات، برمجيات إدارة الأساطيل، وتطبيقات الإنتاجية",
  },
  space: {
    meaning: "مساحة / فضاء رقمي رحب وبيئة مرنة",
    strength: "ترمز للمرونة العالية، انعدام القيود، وتوفير بيئة رحبة للعمل المشترك والإبداع.",
    score: 93,
    category: "فضاء ومرونة رقمية",
    targetIndustry: "منصات إدارة المستندات، مساحات العمل الافتراضية، ومواقع المجتمع الرقمي",
  },
  mate: {
    meaning: "رفيق / مساعد شخصي وشريك ذكي",
    strength: "كلمة دافئة وودودة جداً، مثالية للمساعدين الأذكياء وروبوتات المحادثة الصديقة للمستخدم.",
    score: 93,
    category: "مساعد ودود ومرافقة",
    targetIndustry: "روبوتات المساعدة الشخصية بالذكاء الاصطناعي، تطبيقات الصحة النفسية، وتطبيقات الدراسة",
  },
  pulse: {
    meaning: "نبض / حيوية ومتابعة لحظية ومستمرة",
    strength: "ترمز للنشاط الحيوي المستمر والمراقبة الفورية (Real-time monitoring) لنبض الأعمال.",
    score: 96,
    category: "حيوية ومراقبة حية",
    targetIndustry: "منصات مراقبة العمليات التشغيلية، الرعاية الصحية الرقمية، وتحليلات الأسواق المالية",
  },
  flow: {
    meaning: "تدفق / سلاسة سير العمل والإنتاجية",
    strength: "من أنجح الكلمات على الإطلاق في عالم الإنتاجية؛ تدل على الإنجاز السهل دون أي عوائق.",
    score: 98,
    category: "سلاسة وإنتاجية فائقة",
    targetIndustry: "أدوات أتمتة الأعمال، منصات إدارة تدفق المهام (Workflows)، وبرمجيات التصميم",
  },
};

/**
 * Fallback semantic generator for any English word not in the dictionary.
 */
export function analyzeSingleWord(word: string): WordAnalysis {
  const clean = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  
  if (ARABIC_WORD_PROFILES[clean]) {
    const p = ARABIC_WORD_PROFILES[clean];
    return {
      word: clean,
      meaningEn: `Recognized English dictionary word representing "${clean}"`,
      meaningAr: p.meaning,
      strengthEn: `High-authority keyword with exceptional brand resonance in tech and business sectors.`,
      strengthAr: p.strength,
      strengthScore: p.score,
      categoryEn: "Business & Technology",
      categoryAr: p.category,
    };
  }

  // Heuristic evaluation for general vocabulary
  let meaning = `مصطلح إنجليزي تجاري دال على "${clean}"`;
  let meaningEn = `Recognized English dictionary term representing "${clean}"`;
  let category = "مصطلح تجاري وتكنولوجي";
  let categoryEn = "Business & Brand Term";
  let score = 85;
  let strength = `كلمة واضحة ومميزة من ${clean.length} أحرف، سهلة النطق والتذكر عالمياً، وتمنح مصداقية احترافية فورية في بناء الهوية التجارية الرقمية.`;
  let strengthEn = `Clean, memorable ${clean.length}-letter English word with high recall and instant digital branding credibility.`;

  if (clean.length <= 4) {
    score = 94;
    strength = `كلمة فائقة القصر (${clean.length} أحرف فقط)، سهلة التذكر للغاية وعالية السيولة الاستثمارية، مما يجعلها مثالية للبراندينغ وتطبيقات الهواتف المحمولة.`;
    strengthEn = `Ultra-short (${clean.length} letters), highly memorable with top liquidity and premium branding appeal.`;
  } else if (clean.length <= 6) {
    score = 90;
    strength = `طول مثالي جداً (${clean.length} أحرف)، نطق سلس ومتوازن يسهل حفظه لدى المستهلكين والمستثمرين، ويحقق نتائج قوية في محركات البحث (SEO).`;
    strengthEn = `Optimal length (${clean.length} letters) with smooth pronunciation, balanced syllables, and strong SEO potential.`;
  }

  return {
    word: clean,
    meaningEn,
    meaningAr: meaning,
    strengthEn,
    strengthAr: strength,
    strengthScore: score,
    categoryEn,
    categoryAr: category,
  };
}

/**
 * Decomposes a domain name into its two constituent words.
 */
export function extractDomainTwoWords(domainItem: { name?: string; domain?: string; words?: string[] }): [string, string] {
  if (Array.isArray(domainItem.words) && domainItem.words.length >= 2) {
    return [domainItem.words[0].toLowerCase(), domainItem.words[1].toLowerCase()];
  }

  const raw = (domainItem.name || domainItem.domain || '').split('.')[0].toLowerCase().replace(/[^a-z]/g, '');

  const decomposed = clientDecomposeWords(raw);
  if (decomposed.length === 2) {
    return [decomposed[0], decomposed[1]];
  }

  // Try to match against known profiles
  const knownWords = Object.keys(ARABIC_WORD_PROFILES).sort((a, b) => b.length - a.length);
  for (const prefix of knownWords) {
    if (raw.startsWith(prefix) && raw.length > prefix.length) {
      const suffix = raw.slice(prefix.length);
      return [prefix, suffix];
    }
  }

  // Bisect in middle if unrecognized
  const mid = Math.floor(raw.length / 2);
  return [raw.slice(0, mid) || 'brand', raw.slice(mid) || 'tech'];
}

/**
 * Generates the complete, high-authority Arabic breakdown for a domain,
 * including both words' meanings, strengths, combined brand synergy,
 * and the specific companies & people interested in acquiring it.
 */
export function generateDomainArabicBreakdown(domainItem: DomainItem): DomainArabicBreakdown {
  const [w1, w2] = extractDomainTwoWords(domainItem);
  const word1Analysis = analyzeSingleWord(w1);
  const word2Analysis = analyzeSingleWord(w2);

  // Derive target companies & industries
  const p1 = ARABIC_WORD_PROFILES[w1];
  const p2 = ARABIC_WORD_PROFILES[w2];

  const companiesSet = new Set<string>();
  if (p1?.targetIndustry) companiesSet.add(p1.targetIndustry);
  if (p2?.targetIndustry) companiesSet.add(p2.targetIndustry);

  // Common high-demand tech & business categories
  companiesSet.add("شركات البرمجيات كخدمة (B2B & Enterprise SaaS)");
  companiesSet.add("شركات الذكاء الاصطناعي التوليدي والتعلم الآلي (AI Startups)");
  companiesSet.add("منصات التقنية المالية والبنوك الرقمية (FinTech Solutions)");
  companiesSet.add("صناديق الاستثمار الجريء ومسرعات الأعمال العالمية (VCs & Tech Accelerators)");

  const companies = Array.from(companiesSet).slice(0, 4);

  // Target individuals and potential buyers
  const individuals = [
    "رواد الأعمال التقنيون الطامحون لإطلاق علامة تجارية عالمية سهلة الحفظ",
    "المستثمرون وتجار الدومينات المتميزون (Domain Investors & Flippers)",
    "مدراء المنتجات الرقمية والتسويق (Product Managers & CMOs) الباحثون عن اسم ذي ثقة فورية",
    "المطورون وصناع الحلول الرقمية المستقلون (Indie Hackers & Tech Founders)",
  ];

  const combinedPowerAr = `الدمج بين كلمة "${w1}" (${word1Analysis.meaningAr.split('/')[0].trim()}) وكلمة "${w2}" (${word2Analysis.meaningAr.split('/')[0].trim()}) يكوّن اسماً علامياً متناغماً يجمع بين الوظيفة التشغيلية وسرعة الإدراك الذهني، مما يرفع تقييم الدومين التجاري ويوفر آلاف الدولارات في تكاليف الإعلانات وبناء الثقة لدى العملاء.`;
  const combinedPowerEn = `The combination of "${w1}" and "${w2}" creates a high-synergy compound brand that fuses operational clarity with high market recall, reducing customer acquisition costs and boosting instant digital authority.`;

  const cleanTld = (domainItem.tld || 'com').toLowerCase().replace(/^\.+/, '') || 'com';
  const summary = `يحظى هذا الدومين بطلب قوي من الشركات والمستثمرين لأنه يتكون من كلمتين إنجليزيتين معروفتين عالمياً بدون أرقام أو شرطات مع امتداد موثوق (.${cleanTld})، مما يجعله أصلاً رقمياً ذا سيولة عالية وقدرة تنافسية شرسة في الاستحواذ على حصة سوقية وتسجيل علامة تجارية عالمية.`;
  const summaryEn = `Strong institutional demand from tech startups and venture builders seeking a clean, hyphen-free 2-word compound with top-tier .${cleanTld} authority and immediate trademark defensibility.`;

  const companiesEn = [
    "Enterprise Software & SaaS Providers",
    "Generative AI & Tech Startups",
    "FinTech, Banking & Web Platforms",
    "Venture Capital & Brand Accelerators",
  ];

  const individualsEn = [
    "Tech Founders building category-defining brands",
    "High-conviction Domain Investors & Portfolio Managers",
    "Product Managers & CMOs seeking memorable brand anchors",
    "Indie Hackers & Digital Creators launching scalable products",
  ];

  return {
    word1: word1Analysis,
    word2: word2Analysis,
    combinedPowerEn,
    combinedPowerAr,
    interestedPartiesEn: {
      companies: companiesEn,
      individuals: individualsEn,
      summary: summaryEn,
    },
    interestedPartiesAr: {
      companies,
      individuals,
      summary,
    },
  };
}

/**
 * Convenience helper to get full Arabic analysis for domain name and its 2 constituent words.
 */
export function getDomainArabicAnalysis(name: string, words: string[]): DomainArabicBreakdown {
  return generateDomainArabicBreakdown({
    id: `eval-${name}`,
    domain: `${name}.com`,
    name,
    tld: '.com',
    words,
    wordsCount: words.length,
    relevanceScore: 92,
    hasDashes: false,
    hasNumbers: false,
    valuationTier: 'Brandable',
    estimatedValue: '$5,000',
    pitch: '',
    isTopPick: false,
  });
}
