/**
 * Turkish content — mirrors the exports of lib/data.ts field by field.
 * Slugs, hrefs, palettes and tech identifiers stay identical to the
 * English source so both locales share the same routes and visuals.
 */

import type { Certificate, ExperienceEntry, Project, SkillTier, Ui } from "./data";

export const profile = {
  name: "Mert Ceren",
  monogram: "MC",
  wordmark: "mertceren",
  role: "Yapay Zekâ & Yazılım Mühendisliği Öğrencisi",
  tagline:
    "Yazılımın fiziksel dünyayla buluştuğu akıllı sistemler geliştiriyorum.",
  location: "İstanbul, Türkiye",
  timezone: "Europe/Istanbul",
  email: "mertceren.2003.mc@gmail.com",
  available: true,
  availabilityNote: "Staj ve freelance işlere açığım",
  image: "/portrait.png",
};

export const heroStatement = {
  lines: ["Mert", "Ceren", "Yazılım", "Öğrencisi"],
  sub: "Bandırma Onyedi Eylül Üniversitesi Yazılım Mühendisliği öğrencisiyim. YOLO ve Python ile bilgisayarlı görü sistemleri geliştiriyor, yapay zekâ destekli geliştirmeyle web platformları kuruyorum.",
};

export const projects: Project[] = [
  {
    slug: "smart-road-safety",
    title: "Akıllı Yol Güvenliği",
    year: "2026",
    category: "TEKNOFEST · Yapay Zekâ & 5G",
    description:
      "5G bağlantısını gerçek zamanlı bilgisayarlı görüyle buluşturan akıllı bir yol güvenliği sistemi — destekli ve otonom sürüş senaryoları için Python'da eğitilen YOLO tabanlı tespit modelleri. TEKNOFEST 2026 için 5Genç takımıyla geliştirildi.",
    tags: ["Python", "YOLOv11", "Bilgisayarlı Görü", "5G"],
    href: "#",
    image: "/projects/road-safety.png",
    aiPrompt: "Akıllı Yol Güvenliği projesinde 5G bağlantısı, YOLOv11 mimarisi ve takım kaptanı olarak rolünü detaylı anlatır mısın?",
    palette: { from: "#FF4D00", via: "#2952E3", to: "#0B1024" },
    caseStudy: {
      intro:
        "Trafik kazaları donanım probleminden önce bir veri problemidir. Hiç göz kırpmayan — ve hiç gecikmeyen — bir kameranın neleri önleyebileceğini sorduk.",
      facts: [
        { label: "Rol", value: "Takım Kaptanı, Proje Koordinatörü & AI/ML Mühendisi" },
        { label: "Takım", value: "5Genç" },
        { label: "Aşama", value: "Tamamlandı (TEKNOFEST 2026)" },
        { label: "Ölçülen F1", value: "0.716 — 0.250'den yükseldi" },
      ],
      challenge:
        "Destekli ve otonom sürüş sistemlerinin tehlikeleri — araçları, yayaları, beklenmedik engelleri — gerçek zamanlı görmesi gerekir; geç gelen bir tespit, hiç gelmemiş bir tespittir. Sistem, düşük gecikmeli 5G iletimini yol hızında anlam taşıyacak kadar hızlı görü modelleriyle birleştirmek zorundaydı.",
      approach:
        "Algı katmanı doğrudan benim elimden çıktı: YOLO ailesi modellerini senaryoya özel veri setleriyle Python'da eğitip yol hızında ayakta kalana kadar yineledim. Tek bir model bütün etiketleri taşımak yerine tespit, ayrı ayrı eğitilen uzman modellere bölündü — bir model eklemek ya da çıkarmak koda değil, bir yapılandırma satırına dokunmak demekti. Bu tespitleri taşıyan 5G tarafı takımın altyapı işiydi; kaptan olarak iki yarının nerede buluştuğunu koordine ettim: modeller ne üretiyor, ağ ne bekliyor ve teslim tarihi gerçekte nerede duruyor.",
      outcome:
        "Yarışma süreci Ağustos 2026'da tamamlandı. Turkcell'in doğrulama videosunda resmî ground truth'a karşı ölçülen sistem 0.716 F1 skoru aldı — üç yinelemede 0.250'den buraya geldi. Bu tırmanışın büyük kısmı yeniden eğitimden değil kalibrasyondan geldi; açıkçası aradığım yer orası değildi. Plaka modeli Tesla T4 üzerinde 0.992 mAP@50 değerini 113 FPS'te, internet kapalıyken ve on dakikalık bütçenin içinde tuttu.",
    },
  },
  {
    slug: "virtual-campus",
    title: "Sanal Kampüs",
    year: "2026",
    category: "Eğitim Teknolojisi · Web Platformu",
    description:
      "Envanter takip sistemiyle bütünleşik, yapay zekâ destekli geliştirmeyle kurulmuş 360° panoramik kampüs deneyimi — önde React, Photo Sphere Viewer ve Leaflet, arkada PostgreSQL üzerinde Express ve Prisma. Kampüsü her yerden gez; içindekileri tek panelden yönet.",
    tags: ["AI destekli", "Photo Sphere Viewer", "Leaflet", "Express", "PostgreSQL"],
    href: "#",
    image: "/projects/virtual-campus.png",
    status: "Geliştirme aşamasında",
    aiPrompt: "Sanal Kampüs projesinin 360° panoramik yapısı, harita entegrasyonu ve envanter yönetim mimarisi nasıl çalışıyor?",
    palette: { from: "#2952E3", via: "#14224F", to: "#080B18" },
    caseStudy: {
      intro:
        "Kampüs, daha varmadan gezebilmen gereken bir yerdir — ve birinin dürüst tutmak zorunda olduğu bir demirbaş listesidir. Sanal Kampüs ikisini de aynı platformdan yapıyor.",
      facts: [
        { label: "Rol", value: "Yazılım Mühendisliği Öğrencisi" },
        { label: "Nasıl geliştirildi", value: "Yapay zekâ destekli geliştirme" },
        { label: "Frontend", value: "React + Vite, Tailwind CSS" },
        { label: "360° & harita", value: "Photo Sphere Viewer + Leaflet" },
        { label: "Backend", value: "Node.js üzerinde Express + Prisma" },
        { label: "Veritabanı", value: "PostgreSQL 16 (Docker)" },
        { label: "Durum", value: "Geliştirme aşamasında" },
      ],
      challenge:
        "Aday öğrenciler kampüsü yerinde gezmeden görmek istiyor; idarenin ise aynı binalardaki envanteri takip etmesi gerekiyor — genellikle birbirinden kopuk iki araçla çözülen iki problem. Hedef tek platformdu: her cihazda akıcı 360° gezinme, arkasında yapılandırılmış, sorgulanabilir veri.",
      approach:
        "Bunu artık web işlerimin çoğunu kurduğum yöntemle geliştirdim: mimariyi ve veri modelini kendim belirleyip, her katmanı elle yazmak yerine dil modelleriyle birlikte yazdım. Benim payıma düşen işin şekli — neyin neyle konuştuğu, hangi odanın hangi kayda karşılık geldiği — ve bütünü tutarlı tutan gözden geçirme. Photo Sphere Viewer panoramik sahneleri Vite ile kurulmuş React kabuğunda işliyor, Leaflet kampüs haritasını taşıyor, Prisma destekli Express API'si sahne ve envanter verisini PostgreSQL'den sunuyor; böylece ziyaretçinin gezdiği oda, ekipman kayıtları veritabanında duran odanın ta kendisi oluyor.",
      outcome:
        "Hâlâ geliştirme aşamasında. Temel mimari ayakta — panoramik sahneler, kampüs haritası ve Prisma destekli envanter API'si birbiriyle konuşuyor — şimdiki iş yeni kampüs konumlarını çekmek ve yönetim panelini detaylandırmak. Bu yöntemin bir projeyi nereye kadar taşıdığını, kararın nerede hâlâ bana kaldığını da burada öğrendim.",
    },
  },
  {
    slug: "rosso-lounge",
    title: "Rosso Lounge",
    year: "2025",
    category: "Yeme-İçme · Web Platformu",
    description:
      "Rosso Lounge Bistro için özel yönetim panelli web platformu — işletme menüsünü ve içeriğini koda dokunmadan kendisi yönetiyor. Yapay zekâ destekli geliştirme akışlarıyla tasarlanıp yayına alındı.",
    tags: ["Web Platformu", "Yönetim Paneli", "SQL", "AI destekli"],
    href: "#",
    image: "/projects/rosso-lounge.png",
    aiPrompt: "Rosso Lounge Bistro için geliştirdiğin özel yönetim paneli ve web platformu mimarisi nasıl çalışıyor?",
    palette: { from: "#C1121F", via: "#6E0E14", to: "#170406" },
    caseStudy: {
      intro:
        "Bir restoranın sitesi, menü değiştiği ve kimsenin güncelleyemediği gün ölür. Rosso Lounge, ekibin kendi başına yönetebildiği bir site aldı.",
      facts: [
        { label: "Rol", value: "Yazılım Mühendisliği Öğrencisi" },
        { label: "Nasıl geliştirildi", value: "Yapay zekâ destekli geliştirme" },
        { label: "Müşteri", value: "Rosso Lounge Bistro" },
        { label: "Öne çıkan", value: "Özel yönetim paneli" },
      ],
      challenge:
        "Küçük işletme sitelerinin çoğu statik broşürdür: açılışta doğru görünür, birkaç hafta içinde güncelliğini yitirir. Bistronun hem vitrine hem pratikliğe ihtiyacı vardı — markayı taşıyan herkese açık bir site ve teknik olmayan ekibin müşterinin gördüğünü yönettiği özel bir panel.",
      approach:
        "Platformu, merkezinde özel bir yönetim paneliyle uçtan uca ben kurguladım: menü, içerik ve işletme bilgileri tek yerden düzenlenebiliyor, geliştirici gerekmiyor. Uygulama dil modelleriyle birlikte yazıldı — mimariyi ben belirledim, geleni gözden geçirdim ve müşterinin gerçek ihtiyacını aracın önünde tuttum. Projeyi taslaktan çalışan bir teslimata bir öğrencinin takviminde taşıyan da bu oldu.",
      outcome:
        "Bistro web varlığını kendisi işletiyor — eskiden geliştirici gerektiren güncellemeler artık panelde bir dakika sürüyor. Proje aynı zamanda yapay zekâ destekli akışların gerçek müşteri teslimatına nasıl oturduğu konusunda şablonum hâline geldi.",
    },
  },
];

export const about = {
  manifesto:
    "Gerçek problemleri çözen, temiz, yüksek performanslı ve güvenilir çalışan yazılımlar geliştirmeye odaklanıyorum.",
  paragraphs: [
    "Projeler üreterek öğrenen bir yazılım mühendisliği öğrencisiyim. Otonom sürüş için bilgisayarlı görü tabanlı yol güvenliği sistemi, geliştirmekte olduğum envanter takip entegrasyonlu 360° sanal tur platformu ve yerel işletmeler için özel yönetim panelleri üzerinde çalışıyorum.",
    "Ağırlık merkezim yapay zekânın çalışan sistemlerle buluştuğu alanlar — bir tarafta Python ve YOLO modelleri, diğer tarafta dil modelleriyle birlikte kurduğum web platformları. Şu sıralar İSKİ Yazılım Şube Müdürlüğü'nde 20 günlük zorunlu stajımı gerçekleştiriyorum.",
  ],
};

export const experience: ExperienceEntry[] = [
  {
    period: "Haz 2026 — Şu an",
    title: "Yazılım Mühendisliği Stajyeri",
    place: "İSKİ (Yazılım Şube Müdürlüğü)",
    summary: "20 günlük zorunlu yazılım mühendisliği stajı.",
    detail:
      "İSKİ Bilgi İşlem Dairesi Başkanlığı Yazılım Şube Müdürlüğü bünyesinde 20 günlük zorunlu yazılım mühendisliği stajımı gerçekleştiriyorum.",
    logo: "/logos/iski.png",
  },
  {
    period: "Ara 2025 — Haz 2026",
    title: "Bilgi İşlem Öğrenci Asistanı",
    place: "Bandırma Onyedi Eylül Üniversitesi (Yarı Zamanlı)",
    summary: "Teknik destek, envanter takibi ve donanım kurulumu.",
    detail:
      "İŞKUR destekli kısmi zamanlı öğrenci programı kapsamında üniversitenin Bilgi İşlem Daire Başkanlığı bünyesinde teknik destek, kullanıcı desteği, bilgisayar/yazıcı kurulumu ve envanter takibi süreçlerinde görev aldım.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "Kas 2024 — Mar 2025",
    title: "Kampüs Temsilcisi",
    place: "Etkin Kampüs (Yarı Zamanlı)",
    summary: "Bir platformla kampüsü arasındaki köprü.",
    detail:
      "Etkin Kampüs'ü BANÜ'de temsil ettim — topluluk kurma, iletişim ve ulusal bir öğrenci platformunun yereldeki yüzü olmak.",
    logo: "/logos/etkin-kampus.png",
  },
  {
    period: "2024 — 2028",
    title: "Yazılım Mühendisliği Lisansı",
    place: "Bandırma Onyedi Eylül Üniversitesi",
    summary: "Temellerin oturduğu yer.",
    detail:
      "Algoritmalar, yazılım mimarisi, sistemler ve mühendislik prensipleri. Teorik bilgileri gerçek projeler üreterek pratiğe döküyorum.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "2024 — Şu an",
    title: "Sınıf Temsilcisi",
    place: "BANÜ Yazılım Mühendisliği",
    summary: "Akademisyenler ve öğrenciler arası iletişim köprüsü.",
    detail:
      "Akademisyenlerimiz ile öğrenci arkadaşlarım arasındaki iletişimi, bilgi akışını ve ders/bölüm süreçlerindeki koordinasyonu sağlıyorum.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "2023 — 2024",
    title: "İngilizce Hazırlık Eğitimi (İsteğe Bağlı)",
    place: "Bandırma Onyedi Eylül Üniversitesi",
    summary: "İsteğe bağlı 1 yıllık İngilizce hazırlık programı.",
    detail:
      "Yazılım mühendisliği lisans eğitimi öncesinde 1 yıllık isteğe bağlı İngilizce hazırlık eğitimini başarıyla tamamladım.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "Eyl 2018 — Haz 2022",
    title: "Lise Eğitimi",
    place: "Eyüpsultan Anadolu Lisesi",
    summary: "Sayısal ağırlıklı lise eğitimi.",
    detail: "Lise öğrenimi döneminde sayısal ve fen bilimleri odaklı eğitim aldım.",
    logo: "/logos/eyupsultan.png",
  },
];

// Bkz. lib/data.ts'teki aynı listenin başındaki not: 2026-08-13'te CV ile
// birebir eşleşecek şekilde yeniden yazıldı.
export const skillTiers: SkillTier[] = [
  {
    tier: "Yazılım & Diller",
    blurb: "Kod yazdığım diller ve işimi sürümlediğim araçlar.",
    skills: [
      { name: "C#", discipline: "Languages", note: "Nesne yönelimli programlama" },
      { name: "Python", discipline: "Languages", note: "Görüntü işleme & otomasyon" },
      { name: "HTML & CSS", discipline: "Frontend", note: "Modern arayüz geliştirme" },
      { name: "Git & GitHub", discipline: "Tooling", note: "Versiyon kontrolü & depo yönetimi" },
    ],
  },
  {
    tier: "Yapay Zekâ & Görüntü İşleme",
    blurb: "Proje işlerimin çoğunun geçtiği yer — tespit modelleri ve yapay zekâ destekli geliştirme.",
    skills: [
      { name: "YOLOv8 / v11", discipline: "AI / ML", note: "Nesne tespiti uygulamaları" },
      { name: "Bilgisayarlı Görü", discipline: "AI / ML", note: "Görüntü akışında nesne tanıma" },
      { name: "Prompt Mühendisliği", discipline: "AI / ML", note: "Gemini, Claude" },
      { name: "AI Destekli Geliştirme", discipline: "Tooling", note: "Dil modelleriyle yazılım geliştirme" },
    ],
  },
  {
    tier: "Ofis & Profesyonel",
    blurb: "İnsanlarla çalışma biçimim ve işin ürettiği belgeler.",
    skills: [
      { name: "Microsoft Office", discipline: "Tooling", note: "Word, Excel, PowerPoint" },
      { name: "Analitik Düşünme", discipline: "Professional", note: "Problem çözme" },
      { name: "Takım Çalışması", discipline: "Professional", note: "Proje yönetimi" },
      { name: "Etkinlik Koordinasyonu", discipline: "Professional", note: "Organizasyon ve planlama" },
    ],
  },
];

export const navItems = [
  { label: "Projeler", href: "#work" },
  { label: "Hakkımda", href: "#about" },
  { label: "Yetenekler", href: "#skills" },
  { label: "GitHub", href: "#github" },
  { label: "Sertifikalar", href: "#certificates" },
  { label: "Ödüller", href: "#awards" },
  { label: "İletişim", href: "#contact" },
] as const;

export const site = {
  url: "https://mertceren.com",
  title: "Mert Ceren — Yapay Zekâ & Yazılım Mühendisliği Öğrencisi",
  description:
    "Mert Ceren'in kişisel portfolyosu — Bandırma Onyedi Eylül Üniversitesi Yazılım Mühendisliği öğrencisi. YOLO tabanlı bilgisayarlı görü, 5G akıllı yol güvenliği ve web platformları geliştiriyor.",
};

export const ui: Ui = {
  skipToContent: "İçeriğe atla",
  backToTopAria: "başa dön",
  menu: { open: "Menüyü aç", close: "Menüyü kapat" },
  theme: {
    light: "Açık",
    dark: "Koyu",
    fallback: "Tema",
    switchToLight: "Açık temaya geç",
    switchToDark: "Koyu temaya geç",
    toggle: "Temayı değiştir",
  },
  langToggle: { label: "EN", aria: "Switch to English" },
  hero: { scroll: "Kaydır", localSuffix: "yerel" },
  sections: {
    work: { label: "Seçilmiş Projeler", metaSuffix: "proje — 2025 / 2026" },
    about: {
      label: "Hakkımda & Deneyim",
      timeline: "Zaman çizelgesi",
      portrait: "Portre — d. 2003",
    },
    skills: { label: "Yetenekler & Stack", meta: "Hiçbir ilerleme çubuğu zarar görmedi" },
    awards: {
      label: "Ödüller & Başarılar",
      meta: "Dış onaylar",
    },
    certificates: {
      label: "Sertifikalar",
      meta: "Kurslar & belgeler",
      view: "Sertifikayı gör ↗",
      showMore: "Daha fazla göster",
      showLess: "Daha az göster",
    },
    github: {
      label: "GitHub & Kod Aktivitesi",
      meta: "@mertcerendev hesabından canlı veriler",
      metaStale: "Derlenmiş özet — @mertcerendev",
      viewProfile: "GitHub Profilini Gör ↗",
      viewRepo: "GitHub'da Gör ↗",
      reposTitle: "Aktif Depolar & Projeler",
      commitsNote: "Düzenli commit'ler ve aktif kod geliştirme süreci",
      stackTitle: "Kodlama Dağılımı & Teknolojiler",
      stackNote: "Aktif geliştirilen depolara göre dil ağırlıkları",
      lastPush: "Son push",
      publicRepos: "public depo",
    },
    contact: {
      label: "İletişim",
      meta: "24 saat içinde yanıt",
      lines: ["Birlikte", "çalışalım."],
      form: {
        title: "Ya da doğrudan yaz",
        name: "Ad",
        email: "E-posta",
        message: "Mesaj",
        namePlaceholder: "Adınız",
        emailPlaceholder: "siz@sirket.com",
        messagePlaceholder: "Ne hakkında konuşmak istersiniz?",
        send: "Mesajı gönder",
        sending: "Gönderiliyor…",
        sent: "Teşekkürler — mesajınız yola çıktı. Bu adrese döneceğim.",
        invalid: "İşaretli alanları kontrol eder misiniz?",
        rateLimited: "Kısa sürede birkaç mesaj oldu. On dakika sonra tekrar deneyin.",
        failed: "Mesaj iletilemedi. Doğrudan e-posta atabilirsiniz:",
      },
    },
  },
  projectCard: {
    cta: "Projeyi incele",
    ctaAria: "Vaka incelemesini gör:",
    askAi: "Asistana Sor",
    askAiAria: "Yapay zekâ asistanına sor:",
  },
  workIndex: {
    back: "← Ana sayfa",
    meta: "Tüm projeler, yeniden eskiye",
    view: "Projeyi aç",
    allProjects: "Tüm projeler",
  },
  caseStudy: {
    back: "← Seçilmiş Projeler",
    live: "Canlı",
    visit: "Siteye git ↗",
    next: "Sıradaki proje",
    askAiPrompt: "Bu projeyi Asistana Sor ✨",
    blocks: { challenge: "Zorluk", approach: "Yaklaşım", outcome: "Sonuç" },
  },
  copyEmail: {
    copy: "Kopyala",
    copied: "Kopyalandı ✓",
    srCopied: "E-posta panoya kopyalandı",
    srCopy: "E-postayı kopyala",
  },
  footer: { built: "Sıfırdan yazıldı, şablon yok", backToTop: "Başa dön ↑" },
  preloader: "Portfolyo",
  notFound: {
    kicker: "Kayıp makara",
    titleA: "Bu sahne",
    titleB: "kesildi",
    body: "Aradığın sayfa final kurgusuna hiç giremedi — ya da daha sakin bir yere taşındı.",
    cta: "Açılış sahnesine dön",
  },
};

export const awards = [
  {
    year: "2026",
    title: "TEKNOFEST 2026 Finalisti",
    issuer: "T3 Vakfı & Sanayi ve Teknoloji Bakanlığı",
    project: "5G & Yapay Zeka ile Akıllı Yol Güvenliği",
  },
];

// EDIT: örnek satırlar — canlıya almadan gerçek sertifikalarınla değiştir.
export const certificates: Certificate[] = [
  {
    title: "Versiyon Kontrolleri: Git ve GitHub",
    issuer: "BTK Akademi",
    issued: "Ağu 2026",
    image: "/certificates/btk-versiyon-kontrolleri-git-github.jpg",
  },
  {
    title: "Generative AI for Games Development",
    issuer: "HP & edX",
    issued: "Tem 2026",
    href: "https://courses.edx.org/certificates/9716406a25684da384f57cea96bdfeee",
    image: "/certificates/edx-hp-hpgg04-en-sertifikasi.jpg",
  },
  {
    title: "Araştırmada Üretken Yapay Zekâ Kullanımı",
    issuer: "BTK Akademi",
    issued: "Haz 2026",
    image: "/certificates/arastirmada-uretken-yapay-zek-kullanimi-sertifika.jpg",
  },
  {
    title: "Anthropic Claude Uygulamalı Yapay Zekâ Eğitimi",
    issuer: "BTK Akademi",
    issued: "Haz 2026",
    image: "/certificates/anthropic-claude-sertifika-1.jpg",
  },
  {
    title: "Sosyal Medyada Yapay Zeka ile Dijital Pazarlama",
    issuer: "BTK Akademi & ASBÜ",
    issued: "Haz 2026",
    image: "/certificates/sosyal-medyada-yapay-zeka-ile-dijital-pazarlama-sertifika.jpg",
  },
  {
    title: "ChatGPT Prompt Mühendisliği, İçerik ve Görsel Üretme",
    issuer: "Udemy",
    issued: "Oca 2026",
    image: "/certificates/chatgpt-2026-prompt-muhendisligi-icerik-ve-gorsel-uretme.jpg",
  },
  {
    title: "C# Programlama Sertifikası",
    issuer: "BTK Akademi",
    issued: "Eyl 2025",
    image: "/certificates/c-programlama-sertifika.jpg",
  },
  {
    title: "Yapay Zeka ve Algoritmalarına Giriş",
    issuer: "BTK Akademi",
    issued: "Eki 2024",
    image: "/certificates/yapay-zeka-ve-algoritmalarina-giris-sertifika.jpg",
  },
  {
    title: "C# ile Derinlemesine Kodlama 101 ve Yazılımda Kariyer Eğitimi",
    issuer: "Bahçeşehir Wissen Akademie",
    issued: "Eki 2024",
    image: "/certificates/c-ile-derinlemesine-kodlama-101-ve-yazilimda-kariyer-egitimi.jpg",
  },
  {
    title: "PESNERGY Kariyer Zirvesi",
    issuer: "IEEE BANÜ Öğrenci Kolu",
    issued: "Haz 2024",
    image: "/certificates/pesnergy-kariyer-zirvesi-1-haziran-2024.png",
  },
  {
    title: "MII (Management Informatics Innovation) Zirvesi",
    issuer: "BANÜ Yönetim Bilişim Sistemleri Topluluğu",
    issued: "May 2024",
    image: "/certificates/mii-management-informatics-innovation.jpg",
  },
  {
    title: "Başarılı Bir Mühendisin Kariyer Ufukları",
    issuer: "BANÜ Bilişim ve Teknoloji Topluluğu",
    issued: "Nis 2024",
    image: "/certificates/basarili-bir-muhendisin-kariyer-ufuklari-1-nisan-2024.png",
  },
  {
    title: "Web ve Mobil Uygulama Geliştirmede React'ın Katkıları",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Mar 2024",
    image: "/certificates/web-ve-mobil-uygulama-gelistirmede-react-in-katkilari-30-mart-2024.jpg",
  },
  {
    title: "İş Hayatında En Çok Kullanılan Excel Fonksiyonları",
    issuer: "BANÜ Yönetim Bilişim Sistemleri Topluluğu",
    issued: "Mar 2024",
    image: "/certificates/is-hayatinda-en-cok-kullanilan-excel-fonksiyonlari-25-mart-2024.jpg",
  },
  {
    title: "Okul Bitti Ya Sonra?",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Mar 2024",
    image: "/certificates/okul-bitti-ya-sonra-7-mart-2024.jpg",
  },
  {
    title: "Temel Network Eğitimi",
    issuer: "BANÜ Cyber",
    issued: "Ara 2023",
    image: "/certificates/temel-network-egitimi.png",
  },
  {
    title: "Yeni Başlayanlar için Python Programlama",
    issuer: "BTK Akademi",
    issued: "Ara 2023",
    image: "/certificates/yeni-baslayanlar-icin-python-programlama-sertifika-1.png",
  },
  {
    title: "Sağlıklı Yaşam ve Ek Gıdaların Önemi",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Ara 2023",
    image: "/certificates/saglikli-yasam-ve-ek-gidalarin-onemi.jpg",
  },
  {
    title: "Mülakat 101 (kariyer.net)",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Ara 2023",
    image: "/certificates/mulakat-101-kariyer-net-11-aralik-2023.png",
  },
  {
    title: "Yazılım Zirvesi Katılım Sertifikası",
    issuer: "BANÜ Bilişim ve Teknoloji Topluluğu",
    issued: "Ara 2023",
    image: "/certificates/yazilimzirvesi.png",
  },
  {
    title: "Kariyer.net İş Hayatına İlk Adım",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Ara 2023",
    image: "/certificates/kariyer-net-is-hayatina-ilk-adim-4-aralik-2023-1.png",
  },
  {
    title: "Yazılımda Kariyer Yolu 5",
    issuer: "BANÜ Yazılım Mühendisliği Topluluğu",
    issued: "Kas 2023",
    image: "/certificates/yazilimda-kariyer-yolu-5-6-kasim-2023.jpg",
  },
  {
    title: "Siber Güvenlik Eğitimi",
    issuer: "BTK Akademi",
    issued: "Kas 2023",
    image: "/certificates/siber-guvenlik-5-kasim-2023.png",
  },
  // Was missing here while the English list carried it, so the Turkish site
  // — the default one — showed one certificate fewer than the English.
  {
    title: "Udemy Yazılım Mühendisliği Sertifikası",
    issuer: "Udemy",
    issued: "2024",
    image: "/certificates/uc-e1fa22eb-86d3-4ebc-94b6-1b3f6d638308.jpg",
  },
];

