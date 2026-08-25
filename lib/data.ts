/**
 * Single source of truth for all site content.
 * Real profile data — review the `EDIT:` comments for the few fields
 * that still need your confirmation (dates, links, domain).
 */

export const profile = {
  name: "Mert Ceren",
  monogram: "MC",
  wordmark: "mertceren",
  role: "AI & Software Engineering Student",
  tagline: "Building intelligent systems where software meets the physical world.",
  location: "Istanbul, Türkiye", // EDIT: or "Bandırma, Türkiye" outside internship season
  timezone: "Europe/Istanbul",
  email: "mertceren.2003.mc@gmail.com",
  available: true,
  availabilityNote: "Open to internships & freelance",
  image: "/portrait.png",
};

export const heroStatement = {
  lines: ["Mert", "Ceren", "Software", "Student"],
  sub: "I am a software engineering student at Bandırma Onyedi Eylül University. I build computer vision systems using YOLO and Python, and put web platforms together with AI-assisted development.",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/mertcerendev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mert-ceren-1a7b10297" },
] as const;

export type Project = {
  slug: string;
  title: string;
  year: string;
  category: string;
  description: string;
  tags: string[];
  href: string;
  image?: string;
  /** Shown as a badge on the card while a project is still being built. */
  status?: string;
  /** Contextual prompt sent to the AI Assistant when asked from the card or case study. */
  aiPrompt?: string;
  /** Colors driving the CSS-generated visual for each card. */
  palette: { from: string; via: string; to: string };
  caseStudy: {
    intro: string;
    facts: Array<{ label: string; value: string }>;
    challenge: string;
    approach: string;
    outcome: string;
  };
};

// EDIT: case narratives below are drafted from your project notes —
// review the details (dates, team size, results) and adjust freely.
export const projects: Project[] = [
  {
    slug: "smart-road-safety",
    title: "Smart Road Safety",
    year: "2026",
    category: "TEKNOFEST · AI & 5G",
    description:
      "An intelligent road-safety system pairing 5G connectivity with real-time computer vision — YOLO-based detection models trained in Python for assisted and autonomous driving scenarios. Built with Team 5Genç for TEKNOFEST 2026.",
    tags: ["Python", "YOLOv11", "Computer Vision", "5G"],
    href: "#", // EDIT: project/demo link if public
    image: "/projects/road-safety.png",
    aiPrompt: "Can you explain the 5G and YOLOv11 architecture and your role as Team Captain in the Smart Road Safety project in detail?",
    palette: { from: "#FF4D00", via: "#2952E3", to: "#0B1024" },
    caseStudy: {
      intro:
        "Road accidents are a data problem before they are a hardware problem. We asked what a camera could prevent if it never blinked — and never lagged.",
      facts: [
        { label: "Role", value: "Team Captain, Project Coordinator & AI/ML Engineer" },
        { label: "Team", value: "5Genç" },
        { label: "Stage", value: "Completed (TEKNOFEST 2026)" },
        { label: "Measured F1", value: "0.716, up from 0.250" },
      ],
      challenge:
        "Assisted and autonomous driving systems need to see hazards — vehicles, pedestrians, unexpected obstacles — in real time, and a detection that arrives late is a detection that never happened. The system had to combine low-latency 5G transport with vision models fast enough to matter at road speed.",
      approach:
        "The perception layer was my own hands-on work: YOLO-family models, trained and iterated in Python on scenario-specific datasets until they held up at road speed. Rather than one model carrying every label, detection was split into separately trained experts — adding or removing one is a line in a config file, not a change to the code. The 5G transport carrying those detections was the team's infrastructure side, and as captain I coordinated where the two halves met: what the models emit, what the network expects, and where the deadline actually sat.",
      outcome:
        "The competition run closed in August 2026. Measured against the official ground truth on Turkcell's validation footage, the delivered system scored an F1 of 0.716 — up from 0.250 over three iterations. Most of that climb came from calibration rather than retraining, which is not where I expected to find it. The plate model reached mAP@50 0.992 at 113 FPS on a Tesla T4, with the machine offline and inside a ten-minute budget.",
    },
  },
  {
    slug: "virtual-campus",
    title: "Virtual Campus",
    year: "2026",
    category: "EdTech · Web Platform",
    description:
      "A 360° panoramic campus experience with an integrated inventory tracking system, built with AI-assisted development — React, Photo Sphere Viewer and Leaflet on the front, Express and Prisma over PostgreSQL behind it. Walk the campus from anywhere; manage what's inside it from one panel.",
    tags: ["AI-assisted", "Photo Sphere Viewer", "Leaflet", "Express", "PostgreSQL"],
    href: "#",
    image: "/projects/virtual-campus.png",
    status: "In development",
    aiPrompt: "Can you explain the 360° panoramic scenes, map integration, and inventory management architecture in the Virtual Campus project?",
    palette: { from: "#2952E3", via: "#14224F", to: "#080B18" },
    caseStudy: {
      intro:
        "A campus is a place you should be able to visit before you arrive — and an asset list someone has to keep honest. Virtual Campus does both from the same platform.",
      facts: [
        { label: "Role", value: "Software Engineering Student" },
        { label: "How it was built", value: "AI-assisted development" },
        { label: "Frontend", value: "React + Vite, Tailwind CSS" },
        { label: "360° & maps", value: "Photo Sphere Viewer + Leaflet" },
        { label: "Backend", value: "Express + Prisma on Node.js" },
        { label: "Database", value: "PostgreSQL 16 (Docker)" },
        { label: "Status", value: "In development" },
      ],
      challenge:
        "Prospective students want to see the campus without traveling to it, and administration needs to track inventory across the same buildings — two problems usually solved by two disconnected tools. The goal was one platform: smooth 360° navigation on any device, backed by structured, queryable data.",
      approach:
        "I built this the way I build most web work now: deciding the architecture and the data model myself, then writing it alongside language models rather than hand-rolling every layer. My part is the shape of the thing — what talks to what, which room maps to which record — and the review that keeps it coherent. Photo Sphere Viewer renders the panoramic scenes inside a React shell built with Vite, Leaflet carries the campus map, and an Express API backed by Prisma serves scene and inventory data from PostgreSQL, so the room a visitor tours is the room whose equipment records live in the database.",
      outcome:
        "Still in development. The core architecture is standing — panoramic scenes, the campus map and the Prisma-backed inventory API all talk to each other — and the work now is capturing new campus locations and building out the admin dashboard. It is also where I learned how far this way of working carries a project, and where the judgement still has to be mine.",
    },
  },
  {
    slug: "rosso-lounge",
    title: "Rosso Lounge",
    year: "2025",
    category: "Hospitality · Web Platform",
    description:
      "A web platform for Rosso Lounge Bistro with a custom management panel — the business runs its own menu and content without touching code. Designed and shipped with AI-assisted development workflows.",
    tags: ["Web Platform", "Admin Panel", "SQL", "AI-assisted"],
    href: "#", // EDIT: live site URL
    image: "/projects/rosso-lounge.png",
    aiPrompt: "How does the custom management panel and web platform architecture for Rosso Lounge Bistro work?",
    palette: { from: "#C1121F", via: "#6E0E14", to: "#170406" },
    caseStudy: {
      intro:
        "A restaurant's website dies the day the menu changes and nobody can update it. Rosso Lounge got a site the staff can run themselves.",
      facts: [
        { label: "Role", value: "Software Engineering Student" },
        { label: "How it was built", value: "AI-assisted development" },
        { label: "Client", value: "Rosso Lounge Bistro" },
        { label: "Highlight", value: "Custom admin panel" },
      ],
      challenge:
        "Most small-business sites are static brochures: they look right at launch and drift out of date within weeks. The bistro needed presence and practicality — a public site that carries the brand, and a private panel where non-technical staff manage what customers see.",
      approach:
        "I specified the platform end to end with a custom management panel at its core: menu, content, and business information all editable from one place, no developer required. The implementation was written alongside language models — I set the architecture, reviewed what came back, and kept the client's actual needs in front of the tooling. That is what took it from drafts to a working delivery on a student's schedule.",
      outcome:
        "The bistro operates its own web presence — updates that used to require a developer now take a minute in the panel. The project also became my template for how AI-assisted workflows fit into real client delivery.",
    },
  },
];

export const about = {
  manifesto:
    "I focus on building clean, high-performance software that solves real problems and works reliably in production.",
  paragraphs: [
    "I am a software engineering student who learns by building projects. I have developed a computer vision road safety system for autonomous driving, an ongoing 360° virtual tour platform with inventory tracking, and custom management panels for local businesses.",
    "My focus is on the intersection of AI and working systems — Python and YOLO on one side, and building web platforms alongside language models on the other. Currently, I am completing my 20-day mandatory software engineering internship at İSKİ Software Branch Directorate.",
  ],
};

export type ExperienceEntry = {
  period: string;
  title: string;
  place: string;
  summary: string;
  detail: string;
  logo?: string;
};

export const experience: ExperienceEntry[] = [
  {
    period: "Jun 2026 — Now",
    title: "Software Engineering Intern",
    place: "İSKİ (Software Branch Directorate)",
    summary: "20-day mandatory software engineering internship.",
    detail:
      "Completing a 20-day mandatory engineering internship within the Software Branch Directorate under İSKİ IT Department.",
    logo: "/logos/iski.png",
  },
  {
    period: "Dec 2025 — Jun 2026",
    title: "IT Student Assistant",
    place: "Bandırma Onyedi Eylül University (Part-time)",
    summary: "Technical support, inventory tracking, and hardware setup.",
    detail:
      "Supported the university's IT Department through an İŞKUR-backed student program, handling user queries, computer/printer installation, and IT inventory tracking.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "Nov 2024 — Mar 2025",
    title: "Campus Representative",
    place: "Etkin Kampüs (Part-time)",
    summary: "The bridge between a platform and its campus.",
    detail:
      "Represented Etkin Kampüs at BANÜ — community building, outreach, and being the local face of a national student platform.",
    logo: "/logos/etkin-kampus.png",
  },
  {
    period: "2024 — 2028",
    title: "B.Sc. Software Engineering",
    place: "Bandırma Onyedi Eylül University",
    summary: "Where the fundamentals click.",
    detail:
      "Algorithms, software architecture, systems, and engineering fundamentals. Putting theoretical knowledge into practice through real projects.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "2024 — Now",
    title: "Class Representative",
    place: "BANÜ Software Engineering",
    summary: "Communication bridge between faculty and students.",
    detail:
      "Facilitating communication, information flow, and coordination between faculty members and fellow student classmates.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "2023 — 2024",
    title: "Optional English Preparatory Program",
    place: "Bandırma Onyedi Eylül University",
    summary: "Voluntary 1-year English language training.",
    detail:
      "Completed a 1-year optional English prep program prior to starting the B.Sc. program in Software Engineering.",
    logo: "/logos/banu.jpg",
  },
  {
    period: "Sep 2018 — Jun 2022",
    title: "High School Diploma",
    place: "Eyüpsultan Anatolian High School",
    summary: "Science and mathematics track.",
    detail: "Completed secondary education focusing on mathematics and natural sciences.",
    logo: "/logos/eyupsultan.png",
  },
];

/**
 * Disciplines double as the filter chips above the grid, so the set is
 * deliberately small. It changed on 2026-08-13 when the skills below were
 * rewritten to match the owner's actual CV: "Backend" went away because
 * nothing here is backend work, and "Professional" arrived to carry the
 * non-technical row the CV lists.
 */
export type Skill = {
  name: string;
  discipline: "AI / ML" | "Languages" | "Frontend" | "Tooling" | "Professional";
  note: string;
};

export type SkillTier = {
  tier: string;
  blurb: string;
  skills: Skill[];
};

// Rewritten 2026-08-13 to match the owner's CV exactly, plus Git & GitHub.
// The previous list claimed .NET Core, React/Next.js, PostgreSQL, Express,
// Prisma, SignalR, Docker, Linux and 5G edge computing — a stack he had not
// worked in, drafted before the real content landed. A skills grid he could
// not be questioned on is worth more than a longer one he could.
export const skillTiers: SkillTier[] = [
  {
    tier: "Software & Languages",
    blurb: "The languages I write in and the tooling I version my work with.",
    skills: [
      { name: "C#", discipline: "Languages", note: "Object-oriented programming" },
      { name: "Python", discipline: "Languages", note: "Computer vision & automation" },
      { name: "HTML & CSS", discipline: "Frontend", note: "Modern interface development" },
      { name: "Git & GitHub", discipline: "Tooling", note: "Version control & repositories" },
    ],
  },
  {
    tier: "AI & Computer Vision",
    blurb: "Where most of my project work sits — detection models and AI-assisted development.",
    skills: [
      // Both versions, deliberately: the models were trained on v8 first and
      // the TEKNOFEST system runs v11. The CV says only v8 and is the one
      // that needs correcting, not this.
      { name: "YOLOv8 / v11", discipline: "AI / ML", note: "Object detection applications" },
      { name: "Computer Vision", discipline: "AI / ML", note: "Recognising objects in a video feed" },
      { name: "Prompt Engineering", discipline: "AI / ML", note: "Gemini, Claude" },
      { name: "AI-Assisted Development", discipline: "Tooling", note: "Building software alongside LLMs" },
    ],
  },
  {
    tier: "Office & Professional",
    blurb: "How I work with other people and the documents the work produces.",
    skills: [
      { name: "Microsoft Office", discipline: "Tooling", note: "Word, Excel, PowerPoint" },
      { name: "Analytical Thinking", discipline: "Professional", note: "Problem solving" },
      { name: "Teamwork", discipline: "Professional", note: "Project management" },
      { name: "Event Coordination", discipline: "Professional", note: "Organising and planning" },
    ],
  },
];

export const techMarquee = [
  "Python",
  "C#",
  "YOLOv11",
  "Computer Vision",
  "Object Detection",
  "HTML",
  "CSS",
  "Git",
  "GitHub",
  "Prompt Engineering",
  "Gemini",
  "Claude",
  "AI-Assisted Development",
];

export type Award = {
  year: string;
  title: string;
  issuer: string;
  project: string;
};

export const awards: Award[] = [
  {
    year: "2026",
    title: "TEKNOFEST 2026 Finalist",
    issuer: "T3 Foundation & Ministry of Industry and Technology",
    project: "5G & AI Smart Road Safety",
  },
];

/**
 * Photo strip shown inside the Awards section (language-independent,
 * so it lives only here — not mirrored in data.tr.ts). Drop new images
 * in /public/gallery and list them to extend the strip.
 *
 * The strip renders at a fixed height with `w-auto`, so each entry carries
 * its intrinsic size: that is what lets the browser reserve the right width
 * before the file arrives, and what next/image needs to pick a source width.
 * Read them off a new file with `sharp(path).metadata()`.
 */
export const awardsGallery: Array<{
  src: string;
  width: number;
  height: number;
}> = [
  { src: "/gallery/awards-01.webp", width: 853, height: 640 },
  { src: "/gallery/awards-02.webp", width: 853, height: 640 },
  { src: "/gallery/awards-03.webp", width: 853, height: 640 },
  { src: "/gallery/awards-04.webp", width: 853, height: 640 },
  { src: "/gallery/awards-05.webp", width: 853, height: 640 },
  { src: "/gallery/awards-06.webp", width: 960, height: 640 },
  { src: "/gallery/awards-07.webp", width: 960, height: 640 },
];

/**
 * The three repositories the GitHub section puts on the front page, in
 * order. Hand-picked on purpose: sorting by last push surfaces scratch
 * repos, and none of these carry a description on GitHub, so the sentence
 * under each is written in components/sections/github.tsx and keyed by the
 * names below. Rename a repository on GitHub and its card quietly keeps the
 * written-in stack until the name here is updated to match.
 *
 * Lives here, not in lib/github.ts, because the section is a Client
 * Component and importing it from there would pull the API code into the
 * browser bundle.
 */
export const featuredRepos = [
  "bwai-IK-Karar-Motoru",
  "RossoLoungeWeb",
  "yeniportfo",
] as const;

export type Certificate = {
  title: string;
  issuer: string;
  /** Issue date exactly as the credential states it, e.g. "Mar 2025". */
  issued: string;
  /** Issuer logo under /public/logos. */
  logo?: string;
  /**
   * Credential link — omit (or "#") to hide it. Either a verification URL
   * or a file you dropped in /public/certificates.
   */
  href?: string;
  /** High-resolution image of the certificate in /public/certificates/ */
  image?: string;
};

// Mirrors the LinkedIn "Licenses & certifications" list, newest first.
// Titles are translated for this locale; issuer names stay as issued.
export const certificates: Certificate[] = [
  {
    title: "Version Control: Git and GitHub",
    issuer: "BTK Akademi",
    issued: "Aug 2026",
    image: "/certificates/btk-versiyon-kontrolleri-git-github.jpg",
  },
  {
    title: "Generative AI for Games Development",
    issuer: "HP & edX",
    issued: "Jul 2026",
    href: "https://courses.edx.org/certificates/9716406a25684da384f57cea96bdfeee",
    image: "/certificates/edx-hp-hpgg04-en-sertifikasi.jpg",
  },
  {
    title: "Generative AI in Research",
    issuer: "BTK Akademi",
    issued: "Jun 2026",
    image: "/certificates/arastirmada-uretken-yapay-zek-kullanimi-sertifika.jpg",
  },
  {
    title: "Anthropic Claude",
    issuer: "BTK Akademi",
    issued: "Jun 2026",
    image: "/certificates/anthropic-claude-sertifika-1.jpg",
  },
  {
    title: "AI-Driven Digital Marketing on Social Media",
    issuer: "BTK Akademi & ASBÜ",
    issued: "Jun 2026",
    image: "/certificates/sosyal-medyada-yapay-zeka-ile-dijital-pazarlama-sertifika.jpg",
  },
  {
    title: "ChatGPT 2026: Prompt Engineering, Content & Image Generation",
    issuer: "Academy Club",
    issued: "Jan 2026",
    image: "/certificates/chatgpt-2026-prompt-muhendisligi-icerik-ve-gorsel-uretme.jpg",
  },
  {
    title: "C# Programming",
    issuer: "BTK Akademi",
    issued: "Sep 2025",
    image: "/certificates/c-programlama-sertifika.jpg",
  },
  {
    title: "Introduction to Artificial Intelligence and Its Algorithms",
    issuer: "BTK Akademi",
    issued: "Oct 2024",
    image: "/certificates/yapay-zeka-ve-algoritmalarina-giris-sertifika.jpg",
  },
  {
    title: "In-Depth Coding 101 with C# and Software Career Training",
    issuer: "Bahçeşehir Wissen Akademie",
    issued: "Oct 2024",
    image: "/certificates/c-ile-derinlemesine-kodlama-101-ve-yazilimda-kariyer-egitimi.jpg",
  },
  {
    title: "PESNERGY Career Summit",
    issuer: "IEEE BANÜ Student Branch",
    issued: "Jun 2024",
    image: "/certificates/pesnergy-kariyer-zirvesi-1-haziran-2024.png",
  },
  {
    title: "MII (Management Informatics Innovation) Summit",
    issuer: "BANÜ MIS Society",
    issued: "May 2024",
    image: "/certificates/mii-management-informatics-innovation.jpg",
  },
  {
    title: "Career Horizons of a Successful Engineer",
    issuer: "BANÜ Technology Society",
    issued: "Apr 2024",
    image: "/certificates/basarili-bir-muhendisin-kariyer-ufuklari-1-nisan-2024.png",
  },
  {
    title: "React's Contributions to Web & Mobile App Development",
    issuer: "BANÜ Software Engineering Society",
    issued: "Mar 2024",
    image: "/certificates/web-ve-mobil-uygulama-gelistirmede-react-in-katkilari-30-mart-2024.jpg",
  },
  {
    title: "The Most-Used Excel Functions in Business Life",
    issuer: "BANÜ MIS Society",
    issued: "Mar 2024",
    image: "/certificates/is-hayatinda-en-cok-kullanilan-excel-fonksiyonlari-25-mart-2024.jpg",
  },
  {
    title: "School's Over — What Now?",
    issuer: "BANÜ Software Engineering Society",
    issued: "Mar 2024",
    image: "/certificates/okul-bitti-ya-sonra-7-mart-2024.jpg",
  },
  {
    title: "Fundamentals of Networking",
    issuer: "BANÜ Cyber",
    issued: "Dec 2023",
    image: "/certificates/temel-network-egitimi.png",
  },
  {
    title: "Python Programming for Beginners",
    issuer: "BTK Akademi",
    issued: "Dec 2023",
    image: "/certificates/yeni-baslayanlar-icin-python-programlama-sertifika-1.png",
  },
  {
    title: "Healthy Living & the Importance of Supplements",
    issuer: "BANÜ Software Engineering Society",
    issued: "Dec 2023",
    image: "/certificates/saglikli-yasam-ve-ek-gidalarin-onemi.jpg",
  },
  {
    title: "Interview 101 (kariyer.net)",
    issuer: "BANÜ Software Engineering Society",
    issued: "Dec 2023",
    image: "/certificates/mulakat-101-kariyer-net-11-aralik-2023.png",
  },
  {
    title: "Software Summit",
    issuer: "BANÜ Technology Society",
    issued: "Dec 2023",
    image: "/certificates/yazilimzirvesi.png",
  },
  {
    title: "Kariyer.net: First Step into Working Life",
    issuer: "BANÜ Software Engineering Society",
    issued: "Dec 2023",
    image: "/certificates/kariyer-net-is-hayatina-ilk-adim-4-aralik-2023-1.png",
  },
  {
    title: "Career Path in Software 5",
    issuer: "BANÜ Software Engineering Society",
    issued: "Nov 2023",
    image: "/certificates/yazilimda-kariyer-yolu-5-6-kasim-2023.jpg",
  },
  {
    title: "Cybersecurity Fundamentals",
    issuer: "BANÜ Cyber / BTK Akademi",
    issued: "Nov 2023",
    image: "/certificates/siber-guvenlik-5-kasim-2023.png",
  },
  {
    title: "Udemy Software Engineering Credential",
    issuer: "Udemy",
    issued: "2024",
    image: "/certificates/uc-e1fa22eb-86d3-4ebc-94b6-1b3f6d638308.jpg",
  },
];

export const navItems = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "GitHub", href: "#github" },
  { label: "Certificates", href: "#certificates" },
  { label: "Awards", href: "#awards" },
  { label: "Contact", href: "#contact" },
] as const;

/** Every hardcoded interface string, so lib/data.tr.ts can mirror it. */
export const ui = {
  skipToContent: "Skip to content",
  backToTopAria: "back to top",
  menu: { open: "Open menu", close: "Close menu" },
  theme: {
    light: "Light",
    dark: "Dark",
    fallback: "Theme",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
    toggle: "Toggle theme",
  },
  // Always describes the *other* language — the one the button switches to.
  langToggle: { label: "TR", aria: "Türkçeye geç" },
  hero: { scroll: "Scroll", localSuffix: "local" },
  sections: {
    work: { label: "Selected Works", metaSuffix: "projects — 2025 / 2026" },
    about: {
      label: "About & Experience",
      timeline: "Timeline",
      portrait: "Portrait — est. 2003",
    },
    skills: { label: "Skills & Stack", meta: "Technologies, frameworks, and development tools I work with" },
    awards: {
      label: "Awards & Recognition",
      meta: "External validations",
    },
    certificates: {
      label: "Certificates",
      meta: "Courses & credentials",
      view: "View credential ↗",
      showMore: "Show more",
      showLess: "Show less",
    },
    github: {
      label: "GitHub & Code Activity",
      meta: "Live metrics from @mertcerendev",
      /** Shown instead of `meta` when the GitHub API could not be reached. */
      metaStale: "Curated snapshot — @mertcerendev",
      viewProfile: "View GitHub Profile ↗",
      viewRepo: "View on GitHub ↗",
      reposTitle: "Active Repositories",
      commitsNote: "Continuous commits & active development activity",
      stackTitle: "Code Distribution & Technologies",
      stackNote: "Language weights across actively developed repositories",
      lastPush: "Last push",
      publicRepos: "public repos",
    },
    contact: {
      label: "Contact",
      meta: "Replies within 24h",
      lines: ["Let's work", "together."],
      form: {
        /* Reads as the invitation the `mailto:` link used to be. No arrow:
           it names the form underneath rather than going anywhere. */
        title: "Or write directly",
        name: "Name",
        email: "Email",
        message: "Message",
        namePlaceholder: "Your name",
        emailPlaceholder: "you@company.com",
        messagePlaceholder: "What would you like to talk about?",
        send: "Send message",
        sending: "Sending…",
        sent: "Thanks — it's on its way. I'll reply to that address.",
        invalid: "Please check the marked fields.",
        rateLimited: "That's a few messages in a short while. Try again in ten minutes.",
        failed: "That didn't go through. You can email me directly:",
      },
    },
  },
  projectCard: {
    cta: "View case",
    ctaAria: "View case study:",
    askAi: "Ask AI",
    askAiAria: "Ask AI assistant about:",
  },
  workIndex: {
    /* The URL above a case study answered with a 404 when it was trimmed —
       a natural thing to try, and the one place a fourth project can go
       without crowding the sticky stack on the home page. */
    back: "← Home",
    meta: "All projects, newest first",
    view: "Open case",
    allProjects: "All projects",
  },
  caseStudy: {
    back: "← Selected Works",
    live: "Live",
    visit: "Visit site ↗",
    next: "Next project",
    askAiPrompt: "Ask AI about this project ✨",
    blocks: { challenge: "Challenge", approach: "Approach", outcome: "Outcome" },
  },
  copyEmail: {
    copy: "Copy",
    copied: "Copied ✓",
    srCopied: "Email copied to clipboard",
    srCopy: "Copy email",
  },
  footer: { built: "Built from scratch, no template", backToTop: "Back to top ↑" },
  preloader: "Portfolio",
  notFound: {
    kicker: "Lost reel",
    titleA: "This scene",
    titleB: "was cut",
    body: "The page you're looking for never made the final edit — or it moved somewhere quieter.",
    cta: "Back to the opening scene",
  },
};

export type Ui = typeof ui;

export const site = {
  url: "https://mertceren.com",
  title: "Mert Ceren — AI & Software Engineering Student",
  description:
    "Portfolio of Mert Ceren — software engineering student building AI-powered systems: real-time computer vision, 5G-connected road safety, and modern web platforms.",
};
