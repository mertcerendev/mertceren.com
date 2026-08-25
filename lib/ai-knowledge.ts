/**
 * Knowledge Base & Local Smart Response Engine for Mert Ceren AI Assistant
 */

import { certificates } from "./data";

export type ActionLink = {
  label: string;
  href: string;
  isAnchor?: boolean;
};

export type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  actionLinks?: ActionLink[];
  timestamp: string;
};

export const MERT_KNOWLEDGE = {
  profile: {
    name: "Mert Ceren",
    birthYear: 2003,
    age: 23,
    roleTr: "Yapay Zekâ & Yazılım Mühendisliği Öğrencisi",
    roleEn: "AI & Software Engineering Student",
    university: "Bandırma Onyedi Eylül Üniversitesi (BANÜ)",
    department: "Yazılım Mühendisliği (B.Sc. 2024 - 2028)",
    prepSchool: "İsteğe Bağlı İngilizce Hazırlık Programı (2023 - 2024)",
    highSchool: "Eyüpsultan Anadolu Lisesi (Sayısal, 2018 - 2022)",
    location: "İstanbul / Bandırma, Türkiye",
    email: "mertceren.2003.mc@gmail.com",
    github: "https://github.com/mertcerendev",
    linkedin: "https://linkedin.com/in/mertceren",
    status: "Staj ve freelance iş birliklerine açık",
  },
  projects: [
    {
      title: "Akıllı Yol Güvenliği (TEKNOFEST 2026)",
      role: "Takım Kaptanı, Proje Koordinatörü & AI/ML Mühendisi",
      team: "5Genç",
      category: "Yapay Zekâ & 5G Haberleşme",
      tech: ["Python", "YOLOv11", "Bilgisayarlı Görü", "5G Edge"],
      summary:
        "5G bağlantısını gerçek zamanlı bilgisayarlı görüyle buluşturan akıllı yol güvenliği sistemi. Destekli ve otonom sürüş senaryoları için Python'da eğitilen YOLO tabanlı nesne tespit modelleri. TEKNOFEST 2026 için 5Genç takımı bünyesinde geliştirildi; yarışma Ağustos 2026'da tamamlandı ve teslim edilen sistem resmî doğrulama verisinde 0.716 F1 skoru aldı.",
      href: "/work/smart-road-safety",
    },
    {
      title: "Sanal Kampüs (Virtual Campus)",
      role: "Yazılım Mühendisliği Öğrencisi",
      category: "Eğitim Teknolojisi & 360° Web Platformu",
      tech: ["Yapay zekâ destekli geliştirme", "Photo Sphere Viewer", "Leaflet", "Express", "PostgreSQL"],
      summary:
        "Ziyaretçiler için 360° panoramik sanal kampüs turu ve üniversite idaresi için oda tabanlı envanter yönetim sistemi. Mimarisini Mert kurdu, uygulaması dil modelleriyle birlikte yazıldı; iki bağımsız ihtiyacı PostgreSQL üzerinde tek bir veri şemasında birleştiriyor.",
      href: "/work/virtual-campus",
    },
    {
      title: "Rosso Lounge Bistro Web Platformu",
      role: "Yazılım Mühendisliği Öğrencisi",
      category: "İşletme & Web Platformu",
      tech: ["Yapay zekâ destekli geliştirme", "HTML", "C#", "CSS"],
      summary:
        "Rosso Lounge Bistro için özel geliştirilen dinamik dijital menü, rezervasyon yönetimi ve yönetim paneli çözümü. Yapay zekâ destekli geliştirmeyle kurgulanıp teslim edildi.",
      href: "/work/rosso-lounge",
    },
  ],
  openSourceRepos: [
    { name: "bwai-IK-Karar-Motoru", desc: "İnsan Kaynakları Karar Destek Motoru (Python / Yapay Zekâ)", href: "https://github.com/mertcerendev/bwai-IK-Karar-Motoru" },
    { name: "RossoLoungeWeb", desc: "Rosso Lounge Bistro Web Platformu Kaynak Kodları", href: "https://github.com/mertcerendev/RossoLoungeWeb" },
    { name: "yeniportfo", desc: "Mert Ceren Kişisel Portfolyo Web Uygulaması", href: "https://github.com/mertcerendev/yeniportfo" },
  ],
  /**
   * Kept in step with skillTiers in lib/data.ts — this is what the assistant
   * answers when a visitor asks what he knows, so it is the one place an
   * inflated list would actually be tested. Rewritten 2026-08-13 to match
   * his CV; do not re-add frameworks he has not worked in.
   */
  skills: {
    languages: ["C#", "Python"],
    ai: ["YOLOv8 / YOLOv11", "Bilgisayarlı Görü / Nesne Tespiti", "Prompt Mühendisliği (Gemini, Claude)", "Yapay Zekâ Destekli Yazılım Geliştirme"],
    frontend: ["HTML", "CSS"],
    tools: ["Git & GitHub", "Microsoft Office (Word, Excel, PowerPoint)"],
    personal: ["Analitik düşünme & problem çözme", "Etkinlik koordinasyonu", "Takım çalışması & proje yönetimi"],
  },
  /* Counted from the list rather than typed: it was stuck at 22 while the
     English data had 23 and the Turkish 22, so every answer quoting it was
     wrong for at least one locale. */
  certificatesCount: certificates.length,
  awards: [
    { title: "TEKNOFEST 2026 Finalisti", issuer: "T3 Vakfı & Sanayi ve Teknoloji Bakanlığı", year: "2026", project: "5G & Yapay Zeka ile Akıllı Yol Güvenliği" },
  ],
};

/**
 * Short keywords that have to match a whole word. Turkish stacks suffixes, so
 * matching the start of a word is the right default — "proje" should catch
 * "projeleri". These few would otherwise fire from inside unrelated words:
 * "sa" inside "saat" and "tasarım", "kim" inside "kimya" and "ekim", "old"
 * inside "oldu", "git" inside "gitti".
 */
const WHOLE_WORD_KEYWORDS = new Set([
  "sa",
  "kim",
  "old",
  "git",
  "iş",
  "age",
  "cv",
  "hey",
  // Prefix matching would fire these on "his", "him", "high", "whose".
  "hi",
  "who",
  // Folded to "yas", a prefix match would fire on "yasaklı"/"yasal".
  "yaş",
]);

/**
 * Turkish keywords that collide with everyday English words once folded —
 * "iş" becomes "is", so an English sentence like "what is your name" would
 * otherwise trigger the job/contact branch. Skipped while answering in English.
 */
const TURKISH_ONLY_KEYWORDS = new Set(["iş", "sa", "kim"]);

/**
 * Turkish is very often typed without its diacritics ("odulleri", "kac
 * yasinda"), so both the query and the keywords are folded before matching.
 */
const foldTurkish = (value: string) =>
  value
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[âà]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/û/g, "u");

/**
 * Fast Local Response Engine with 100% comprehensive coverage of all portfolio sections
 */
/**
 * Off-topic replies. Deliberately several, with different openers and
 * different moods — warm, wry, briefly grumpy — so consecutive off-topic
 * questions never come back with the same sentence. `{email}` is filled in
 * by the caller.
 */
const OFF_TOPIC_TR = [
  "Orası tam benim uzmanlık alanım değil 😅 Ama Mert'in projeleri, yetenekleri ve sertifikaları konusunda ne sorarsan anlatırım.\n\nDoğrudan Mert'e ulaşmak istersen: **{email}**",
  "Bunu bilseydim burada değil, bir arama motorunda çalışıyor olurdum 😄 Benim işim Mert'i anlatmak — projelerinden eğitimine kadar merak ettiğini sor.\n\nMert'e yazmak için: **{email}**",
  "Vallahi o konuda pas geçeyim, yanlış bilgi vermekten iyidir. Ama Mert'in yaptığı işleri sorarsan tam kapasite çalışırım 🚀\n\nİletişim: **{email}**",
  "Hmm, o benim veri tabanımda yok. Mert'in projeleri, TEKNOFEST macerası, sertifikaları… işte onlar tam benim konum ✨\n\nMert'e doğrudan yazabilirsin: **{email}**",
  "O soruya cevap versem uydurmuş olurum, uydurmak da işim değil 🤖 Mert hakkında ne merak ediyorsan sor, oradan devam edelim.\n\nİletişim: **{email}**",
  "Ben daha çok Mert'in işlerinden anlarım; genel kültür kısmında biraz zayıfım 😅 Projelerinden mi başlayalım, yeteneklerinden mi?\n\nMert'e ulaşmak için: **{email}**",
] as const;

const OFF_TOPIC_EN = [
  "That's a bit outside my wheelhouse 😅 But ask me anything about Mert's projects, skills or certificates and I'm all yours.\n\nReach Mert directly: **{email}**",
  "If I knew that, I'd be working at a search engine instead 😄 My job is Mert — his work, his studies, his projects. Ask away.\n\nEmail: **{email}**",
  "I'll pass on that one rather than make something up. Ask me about Mert's work though, and I'm fully operational 🚀\n\nContact: **{email}**",
  "Not in my database, I'm afraid. Mert's projects, his TEKNOFEST run, his certificates — those I can talk about all day ✨\n\nWrite to Mert: **{email}**",
  "Answering that would mean inventing something, and inventing isn't my job 🤖 Ask me about Mert instead and we're back in business.\n\nContact: **{email}**",
] as const;

/** Picks a random line so repeated off-topic turns don't echo each other. */
function pickVariant(variants: readonly string[]): string {
  return variants[Math.floor(Math.random() * variants.length)];
}

export function getLocalAiResponse(query: string, locale: "tr" | "en" = "tr"): { text: string; actionLinks?: ActionLink[] } {
  const q = query.toLowerCase().trim();
  const folded = foldTurkish(q);
  // Keep # and + so "c#" and "c++" survive as single words.
  const words = folded.split(/[^\p{L}\p{N}#+]+/u).filter(Boolean);

  const has = (...keywords: string[]) =>
    keywords.some((raw) => {
      if (locale === "en" && TURKISH_ONLY_KEYWORDS.has(raw)) return false;
      const keyword = foldTurkish(raw);
      // Multi-word phrases are specific enough to match anywhere.
      if (keyword.includes(" ")) return folded.includes(keyword);
      if (WHOLE_WORD_KEYWORDS.has(raw)) return words.includes(keyword);
      return words.some((word) => word.startsWith(keyword));
    });

  // YAŞ & DOĞUM TARİHİ
  // "yaşı" catches the inflected forms ("yaşında", "yaşın kaç") that the
  // whole-word "yaş" no longer reaches.
  if (has("yaş", "yaşı", "kaç yaşında", "doğum", "2003", "age", "old")) {
    if (locale === "tr") {
      return {
        text: "Mert Ceren 2003 doğumludur ve şu an 23 yaşındadır 😄 (2026 yılı itibarıyla). Bandırma Onyedi Eylül Üniversitesi Yazılım Mühendisliği öğrencisidir 🚀",
        actionLinks: [
          { label: "Hakkımda & Zaman Çizelgesi ↗", href: "#about", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "Mert Ceren was born in 2003 and is currently 23 years old 😄 (as of 2026). He studies Software Engineering at BANÜ 🚀",
        actionLinks: [
          { label: "View About & Timeline ↗", href: "#about", isAnchor: true },
        ],
      };
    }
  }

  // ÖDÜLLER & DERECELER (Awards & Honors)
  if (has("ödül", "derece", "yarısm", "yarışm", "başarı", "finalist", "t3", "award", "honor")) {
    if (locale === "tr") {
      return {
        text: "🏆 **Ödüller & Dereceler (TEKNOFEST'te finale kaldık bile! 😄)**:\n\n• **TEKNOFEST 2026 Finalisti** — *T3 Vakfı & Sanayi ve Teknoloji Bakanlığı*\n  **Proje**: 5G & Yapay Zekâ ile Akıllı Yol Güvenliği (5Genç Takım Kaptanı)\n\nMert ve 5Genç takımı YOLOv11 modeliyle finale yükseldi. Ben de burada sevinçten nöronlarımı çalıştırıyorum 🤖✨",
        actionLinks: [
          { label: "Ödüller Bölümüne Git 🏆", href: "#awards", isAnchor: true },
          { label: "Seçilmiş Projeler Bölümüne Git 🚀", href: "#work", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🏆 **Awards & Honors Summary**:\n\n• **TEKNOFEST 2026 Finalist** — *T3 Foundation & Ministry of Industry and Technology*\n  **Project**: 5G & AI Smart Road Safety (Team 5Genç Captain)",
        actionLinks: [
          { label: "Jump to Awards Section 🏆", href: "#awards", isAnchor: true },
          { label: "Jump to Projects Section 🚀", href: "#work", isAnchor: true },
        ],
      };
    }
  }

  // GITHUB & AÇIK KAYNAK PROJELER (GitHub & Open Source)
  if (has("github", "repo", "kod", "code", "open source", "açık kaynak", "git")) {
    if (locale === "tr") {
      return {
        text: "🐙 **GitHub & Açık Kaynak Repoları (Kodlarımızı rahatça inceleyebilirsin 😄)**:\n\nResmi GitHub profili: `github.com/mertcerendev`\n\nÖne çıkan açık kaynak repoları:\n1. 🤖 **bwai-IK-Karar-Motoru** — İnsan Kaynakları Karar Destek Motoru (Python / Yapay Zekâ)\n2. 🍷 **RossoLoungeWeb** — Rosso Lounge Bistro Web Platformu Kaynak Kodları\n3. 💻 **yeniportfo** — Şu an gezdiğin bu güzel portfolyonun kaynak kodları ✨",
        actionLinks: [
          { label: "GitHub Repolarına Git 🐙", href: "#github", isAnchor: true },
          { label: "GitHub Profilini Aç ↗", href: "https://github.com/mertcerendev" },
        ],
      };
    } else {
      return {
        text: "🐙 **GitHub & Open Source Repositories**:\n\nOfficial GitHub Profile: `github.com/mertcerendev`\n\nFeatured open-source repositories:\n1. 🤖 **bwai-IK-Karar-Motoru** — HR Decision Support Engine (Python / AI)\n2. 🍷 **RossoLoungeWeb** — Rosso Lounge Bistro Web Platform\n3. 💻 **yeniportfo** — Personal Portfolio Web App",
        actionLinks: [
          { label: "Jump to GitHub Section 🐙", href: "#github", isAnchor: true },
          { label: "Open GitHub Profile ↗", href: "https://github.com/mertcerendev" },
        ],
      };
    }
  }

  // İLETİŞİM, E-POSTA, CV & ÖZGEÇMİŞ
  if (has("iletişim", "konuş", "ulaş", "görüş", "mesaj", "mail", "eposta", "email", "cv", "özgeçmiş", "staj", "iş", "freelance", "indir", "contact", "resume", "hire", "hiring", "reach", "internship", "get in touch")) {
    if (locale === "tr") {
      return {
        text: "✉️ **İletişim & CV (Staj veya proje teklifin varsa hemen konuşalım! 😄)**:\n\n• **E-posta**: `mertceren.2003.mc@gmail.com`\n• **Lokasyon**: İstanbul / Bandırma, Türkiye\n• **İş Birlikleri**: Staj ve freelance proje tekliflerine sonuna kadar açık!\n• **Özgeçmiş (CV)**: Sayfadan 1 tıkla önizleyip PDF indirebilirsin ✨",
        actionLinks: [
          { label: "Özgeçmişi İncele & İndir (PDF) 📄", href: "#contact", isAnchor: true },
          { label: "İletişim Bölümüne Git ✉️", href: "#contact", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "✉️ **Contact & Resume (CV)**:\n\n• **Email**: `mertceren.2003.mc@gmail.com`\n• **Location**: Istanbul / Bandirma, Turkey\n• **Status**: Open for internships & freelance work!\n• **CV**: Available for 1-click full screen preview and PDF download.",
        actionLinks: [
          { label: "Preview & Download Resume (PDF) 📄", href: "#contact", isAnchor: true },
        ],
      };
    }
  }

  // ROSSO LOUNGE BISTRO
  if (has("rosso", "rosso lounge", "bistro", "menü", "restoran", "restaurant", "lounge")) {
    if (locale === "tr") {
      return {
        text: "🍷 **Rosso Lounge Bistro Web Platformu**:\n\n• **Müşteri**: Rosso Lounge Bistro\n• **Rol**: Yapay Zekâ Destekli Web Geliştirme (Mert Ceren)\n• **Öne Çıkan Özellik**: Özel Yönetim Paneli (Admin Panel)\n• **Mimari**: HTML, C#, CSS, SQL\n\n**Nasıl Çalışıyor?**\nKüçük işletmelerin en büyük sorunu menü veya fiyat değiştiğinde sitenin atıl kalmasıdır. Mert bu proje için işletme personelinin teknik bilgiye ihtiyaç duymadan menüyü, fotoğrafları ve işletme bilgilerini tek panelden güncelleyebildiği dinamik bir yönetim paneli kurguladı. Dil modelleriyle birlikte mimarisi tasarlanıp teslim edildi 🚀",
        actionLinks: [
          { label: "Rosso Lounge Vaka İncelemesi ↗", href: "/work/rosso-lounge" },
          { label: "Seçilmiş Projeler 🚀", href: "#work", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🍷 **Rosso Lounge Bistro Web Platform**:\n\n• **Client**: Rosso Lounge Bistro\n• **Role**: AI-assisted Web Development (Mert Ceren)\n• **Key Feature**: Custom Admin & Management Panel\n• **Tech**: HTML, C#, CSS, SQL\n\n**How it works:**\nRestaurant sites often become outdated when menus change. Mert engineered a complete web platform with an intuitive management panel allowing non-technical staff to update food items, pricing, and operating hours instantly without touching code.",
        actionLinks: [
          { label: "View Rosso Lounge Case Study ↗", href: "/en/work/rosso-lounge" },
          { label: "Featured Projects 🚀", href: "#work", isAnchor: true },
        ],
      };
    }
  }

  // SANAL KAMPÜS (VIRTUAL CAMPUS)
  if (has("sanal kampüs", "virtual campus", "kampüs", "campus", "panorama", "panoramik", "sphere", "envanter")) {
    if (locale === "tr") {
      return {
        text: "🏫 **Sanal Kampüs (Virtual Campus & Envanter Yönetimi)**:\n\n• **Rol**: Yazılım Mühendisliği Öğrencisi (Mert Ceren)\n• **Frontend**: React + Vite, Tailwind CSS, Photo Sphere Viewer, Leaflet\n• **Backend & DB**: Node.js, Express, Prisma, PostgreSQL 16 (Docker)\n• **Geliştirme Metodu**: Yapay zekâ destekli geliştirme\n\n**Nasıl Çalışıyor?**\nSanal Kampüs iki büyük ihtiyacı tek platformda birleştiriyor: Aday öğrencilerin kampüsü 360° panoramik sahnelerle gezebilmesi ve üniversite idaresinin aynı binalardaki oda ve demirbaş envanterini Leaflet haritası ve PostgreSQL veritabanı üzerinden tek panelden yönetebilmesi ✨",
        actionLinks: [
          { label: "Sanal Kampüs Vaka İncelemesi ↗", href: "/work/virtual-campus" },
          { label: "Seçilmiş Projeler 🚀", href: "#work", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🏫 **Virtual Campus & Inventory Management**:\n\n• **Role**: Software Engineering Student (Mert Ceren)\n• **Frontend**: React + Vite, Tailwind CSS, Photo Sphere Viewer, Leaflet\n• **Backend & DB**: Node.js, Express, Prisma, PostgreSQL 16 (Docker)\n• **Methodology**: AI-assisted development\n\n**How it works:**\nCombines an immersive 360° panoramic virtual tour for visitors with a comprehensive room-by-room inventory tracking system for campus administration, querying unified PostgreSQL records.",
        actionLinks: [
          { label: "View Virtual Campus Case Study ↗", href: "/en/work/virtual-campus" },
          { label: "Featured Projects 🚀", href: "#work", isAnchor: true },
        ],
      };
    }
  }

  // TEKNOFEST & YOL GÜVENLİĞİ & 5GENÇ
  if (has("teknofest", "yol güvenliği", "road safety", "5genç", "5genc", "yolo", "yolov11", "kaptan", "captain")) {
    if (locale === "tr") {
      return {
        text: "🚦 **Akıllı Yol Güvenliği (TEKNOFEST 2026 — 5Genç)**:\n\n• **Takım**: 5Genç (Takım Kaptanı: Mert Ceren)\n• **Mert'in Rolü**: Takım Kaptanı, Proje Koordinatörü & AI/ML Mühendisi\n• **Teknolojiler**: Python, YOLOv11, Bilgisayarlı Görü, 5G Düşük Gecikmeli İletim\n• **Aşama**: Tamamlandı — Ağustos 2026 (TEKNOFEST 2026 Finalisti)\n• **Ölçülen Sonuç**: 0.716 F1 (0.250'den yükseldi)\n\n**Nasıl Çalışıyor?**\nDestekli ve otonom sürüş senaryolarında yol üzerindeki araç, yaya ve engelleri tespit etmek için Python ortamında YOLOv11 modelleri eğitildi. Tespit edilen risk verileri 5G düşük gecikmeli iletişim altyapısıyla yol hızında araçlara ve kontrol merkezine aktarılıyor 🤖✨",
        actionLinks: [
          { label: "Akıllı Yol Güvenliği Vaka İncelemesi ↗", href: "/work/smart-road-safety" },
          { label: "Ödüller & TEKNOFEST 🏆", href: "#awards", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🚦 **Smart Road Safety (TEKNOFEST 2026 — 5Genç)**:\n\n• **Team**: 5Genç (Team Captain: Mert Ceren)\n• **Mert's Role**: Team Captain, Project Coordinator & AI/ML Engineer\n• **Tech**: Python, YOLOv11, Computer Vision, Low-latency 5G\n• **Stage**: Completed — August 2026 (TEKNOFEST 2026 Finalist)\n• **Measured result**: F1 0.716, up from 0.250\n\n**How it works:**\nPairs scenario-trained YOLOv11 vision models with low-latency 5G communication to detect hazards, vehicles, and pedestrians in real time for assisted and autonomous driving.",
        actionLinks: [
          { label: "View Smart Road Safety Case Study ↗", href: "/en/work/smart-road-safety" },
          { label: "Awards Section 🏆", href: "#awards", isAnchor: true },
        ],
      };
    }
  }

  // İSKİ STAJI & BANÜ DENEYİMİ
  if (has("iski", "staj", "intern", "internship", "asistan", "assistant", "etkin kampus", "etkin kampüs")) {
    if (locale === "tr") {
      return {
        text: "💼 **Mert'in Deneyimleri & İSKİ Stajı**:\n\n• **İSKİ (Yazılım Şube Müdürlüğü)** — *Yazılım Mühendisliği Stajyeri (Haz 2026 — Güncel)*: Bilgi İşlem Dairesi Başkanlığı Yazılım Şube Müdürlüğü bünyesinde 20 günlük zorunlu yazılım mühendisliği stajını gerçekleştiriyor.\n• **BANÜ Bilgi İşlem** — *Öğrenci Asistanı (Ara 2025 — Haz 2026)*: Kullanıcı desteği, donanım kurulumu ve envanter yönetimi.\n• **BANÜ Yazılım Mühendisliği** — *Sınıf Temsilcisi (2024 — Güncel)*: Akademisyenler ve öğrenciler arası iletişim koordinatörü ✨",
        actionLinks: [
          { label: "Hakkımda & Zaman Çizelgesi ↗", href: "#about", isAnchor: true },
          { label: "İletişime Geç ✉️", href: "#contact", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "💼 **Mert's Experience & İSKİ Internship**:\n\n• **İSKİ (Software Branch Directorate)** — *Software Engineering Intern (Jun 2026 — Present)*: 20-day compulsory software engineering internship at Istanbul Water and Sewerage Administration.\n• **BANÜ IT Department** — *Student Assistant (Dec 2025 — Jun 2026)*: Technical support, hardware installation, and inventory.\n• **BANÜ Software Engineering** — *Class Representative (2024 — Present)*: Coordination between faculty and students.",
        actionLinks: [
          { label: "View About & Timeline ↗", href: "#about", isAnchor: true },
          { label: "Contact Mert ✉️", href: "#contact", isAnchor: true },
        ],
      };
    }
  }

  // SERTİFİKALAR & BELGELER
  if (has("sertifika", "certificate", "btk", "edx", "udemy", "belge")) {
    if (locale === "tr") {
      return {
        text: `📜 **Sertifikalar (Tam ${MERT_KNOWLEDGE.certificatesCount} tane onaylı sertifika topladık! 😄)**:\n\nMert Ceren'in yapay zekâ ve yazılım alanında **${MERT_KNOWLEDGE.certificatesCount} adet onaylı sertifikası** var.\n\n• **BTK Akademi**: Versiyon Kontrolleri — Git ve GitHub\n• **BTK Akademi**: Bilgisayarlı Görü ve YOLO\n• **edX & HP**: Generative AI for Games Development ✨`,
        actionLinks: [
          { label: `Sertifikalar Galerisini Aç (${MERT_KNOWLEDGE.certificatesCount}) 📜`, href: "#certificates", isAnchor: true },
        ],
      };
    } else {
      return {
        text: `📜 **Certificates Summary**:\n\nMert Ceren holds **${MERT_KNOWLEDGE.certificatesCount} verified professional certificates** in AI, Computer Vision, and Software Engineering.\n\nKey credentials include BTK Version Control with Git and GitHub, BTK YOLO Computer Vision, and edX HP Generative AI.`,
        actionLinks: [
          { label: `Open Certificates Gallery (${MERT_KNOWLEDGE.certificatesCount}) 📜`, href: "#certificates", isAnchor: true },
        ],
      };
    }
  }

  // GENEL PROJELER (TEKNOFEST, Sanal Kampüs, Rosso Lounge, bwai İK)
  if (has("proje", "project", "işler", "works")) {
    if (locale === "tr") {
      return {
        text: "💻 **Projeler (Mert'in geliştirdiği harika işlere bakalım 😄)**:\n\n1. 🚦 **Akıllı Yol Güvenliği (TEKNOFEST 2026)** — 5G & YOLOv11 ile Otonom Sürüş Desteği (5Genç Takım Kaptanı)\n2. 🏫 **Sanal Kampüs** — 360° Panoramik Sanal Tur & İdare Envanter Yönetim Platformu\n3. 🍷 **Rosso Lounge Bistro** — Özel Yönetim Panelli Web Platformu & Menü Sistemi\n4. 🤖 **bwai İK Karar Motoru** — Açık kaynak yapay zekâ İK karar destek motoru ✨",
        actionLinks: [
          { label: "Seçilmiş Projeler Bölümünü Gör 🚀", href: "#work", isAnchor: true },
          { label: "GitHub Repolarını İncele ↗", href: "#github", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "💻 **Featured Projects Summary**:\n\n1. 🚦 **Smart Road Safety (TEKNOFEST 2026)** — 5G & YOLOv11 (Team 5Genç Captain)\n2. 🏫 **Virtual Campus** — 360° Panoramic Tour & Inventory Platform\n3. 🍷 **Rosso Lounge Bistro** — Web platform & custom management panel",
        actionLinks: [
          { label: "Jump to Projects Section 🚀", href: "#work", isAnchor: true },
        ],
      };
    }
  }

  // YETENEKLER & TEKNOLOJİ STACK (C#, Python, YOLO, prompt mühendisliği)
  if (has("yetenek", "skill", "dil", "tech", "python", "c#", "react", "stack", "teknoloji", "yazılım")) {
    if (locale === "tr") {
      return {
        text: "🛠️ **Yetenekler**:\n\n• **Diller**: C#, Python\n• **Yapay Zekâ & Görü**: YOLOv8 / YOLOv11 ile nesne tespiti, prompt mühendisliği (Gemini, Claude), yapay zekâ destekli yazılım geliştirme\n• **Arayüz**: HTML, CSS\n• **Araçlar**: Git & GitHub, Microsoft Office\n• **Kişisel**: Analitik düşünme, takım çalışması, etkinlik koordinasyonu ✨",
        actionLinks: [
          { label: "Yetenekler Bölümünü Gör 🛠️", href: "#skills", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🛠️ **Skills**:\n\n• **Languages**: C#, Python\n• **AI & Computer Vision**: object detection with YOLOv8 / YOLOv11, prompt engineering (Gemini, Claude), AI-assisted software development\n• **Interface**: HTML, CSS\n• **Tools**: Git & GitHub, Microsoft Office\n• **Professional**: analytical thinking, teamwork, event coordination",
        actionLinks: [
          { label: "Jump to Skills Section 🛠️", href: "#skills", isAnchor: true },
        ],
      };
    }
  }

  // EĞİTİM & ÜNİVERSİTE & LİSE
  if (has("okul", "üniversite", "öğrenci", "banü", "bandırma", "lise", "hazırlık", "eğitim", "school", "universit", "student", "education", "study", "studi", "degree", "graduat")) {
    if (locale === "tr") {
      return {
        text: "🎓 **Eğitim (Bandırma Onyedi Eylül Üni - Yazılım Mühendisliği 😄)**:\n\nMert şu an BANÜ Yazılım Mühendisliği öğrencisi ✨\n\n• **Lisans**: BANÜ Yazılım Mühendisliği (2024 - 2028)\n• **Hazırlık**: BANÜ İsteğe Bağlı İngilizce Hazırlık (2023 - 2024)\n• **Lise**: Eyüpsultan Anadolu Lisesi (2018 - 2022)",
        actionLinks: [
          { label: "Zaman Çizelgesinde Detaylı Gör ↗", href: "#about", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "🎓 **Education Summary**:\n\n• **Degree**: Bandırma Onyedi Eylül University (BANÜ) — B.Sc. Software Engineering (2024 - 2028)\n• **Prep School**: 1-Year Optional English Prep Program (2023 - 2024)",
        actionLinks: [
          { label: "View Timeline ↗", href: "#about", isAnchor: true },
        ],
      };
    }
  }

  // SELAMLAMA & GENEL SORULAR
  if (has("merhaba", "selam", "sa", "hey", "günaydın", "iyi günler", "hello", "hi", "good morning")) {
    if (locale === "tr") {
      return {
        text: "Selam! 👋 Ben Mert Ceren'in yapay zekâ asistanıyım, hoş geldin! 😄☕\n\nMert Ceren; Bandırma Onyedi Eylül Üniversitesi Yazılım Mühendisliği öğrencisi, TEKNOFEST 2026 **5Genç** Takım Kaptanı ve yapay zekâ geliştiricisidir.\n\nSöyle bakalım, projeleri mi, 22 sertifikayı mı yoksa iletişim bilgilerini mi merak ediyorsun? ✨",
        actionLinks: [
          { label: "Seçilmiş Projeler 🚀", href: "#work", isAnchor: true },
          { label: "Ödüller & Dereceler 🏆", href: "#awards", isAnchor: true },
          { label: "GitHub Repoları 🐙", href: "#github", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "Hello! 👋 I am Mert Ceren's AI assistant.\n\nMert is a Software Engineering Student at BANÜ, Team Captain for TEKNOFEST 2026 (Team 5Genç), and an AI developer.\n\nHow can I help you regarding his projects, awards, GitHub repos, skills, or certifications?",
        actionLinks: [
          { label: "Featured Projects 🚀", href: "#work", isAnchor: true },
          { label: "Awards & Honors 🏆", href: "#awards", isAnchor: true },
        ],
      };
    }
  }

  // BİYOGRAFİ & KİMDİR
  if (has("kimdir", "kim", "hakkında", "tanıt", "biyografi", "who", "about", "biography", "introduce", "tell me")) {
    if (locale === "tr") {
      return {
        text: "Mert Ceren, **Bandırma Onyedi Eylül Üniversitesi (BANÜ) Yazılım Mühendisliği** öğrencisi ve TEKNOFEST 2026 **5Genç** takımının **Takım Kaptanıdır** 😄\n\nBilgisayarlı görü (YOLOv11), C#, Python ve yapay zekâ destekli yazılım geliştirme üzerine çalışır 🚀 Merak ettiğin her şeyi sorabilirsin ✨",
        actionLinks: [
          { label: "Hakkımda & Zaman Çizelgesi ↗", href: "#about", isAnchor: true },
          { label: "Seçilmiş Projeleri Gör 🚀", href: "#work", isAnchor: true },
        ],
      };
    } else {
      return {
        text: "Mert Ceren is a B.Sc. **Software Engineering Student at Bandırma Onyedi Eylül University** (2024 - 2028) and Team Captain of **5Genç** for TEKNOFEST 2026.",
        actionLinks: [
          { label: "View About & Timeline ↗", href: "#about", isAnchor: true },
        ],
      };
    }
  }

  // FALLBACK FOR UNMATCHED QUERIES
  // These lines answer EVERY unmatched topic, so none of them may name a
  // specific subject (weather, food…) or they read as non sequiturs. Several
  // variants exist because this path also serves as the upstream-model
  // fallback — a single fixed sentence would repeat on every off-topic turn.
  const text = pickVariant(locale === "tr" ? OFF_TOPIC_TR : OFF_TOPIC_EN).replace(
    "{email}",
    MERT_KNOWLEDGE.profile.email
  );

  return {
    text,
    actionLinks:
      locale === "tr"
        ? [
            { label: "Projeleri İncele 🚀", href: "#work", isAnchor: true },
            { label: "Ödüller & Dereceler 🏆", href: "#awards", isAnchor: true },
            { label: "GitHub Repoları 🐙", href: "#github", isAnchor: true },
            { label: `Sertifikalar (${MERT_KNOWLEDGE.certificatesCount}) 📜`, href: "#certificates", isAnchor: true },
            { label: "İletişime Geç ✉️", href: "#contact", isAnchor: true },
          ]
        : [
            { label: "Explore Projects 🚀", href: "#work", isAnchor: true },
            { label: "Awards 🏆", href: "#awards", isAnchor: true },
            { label: "GitHub Repos 🐙", href: "#github", isAnchor: true },
            { label: "Contact ✉️", href: "#contact", isAnchor: true },
          ],
  };
}
