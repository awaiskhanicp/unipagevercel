// ✅ This exports an array directly

export const courses = [
  {
    id: 40518,
    title: "MBBS in Italy",
    slug: "mbbs-in-italy",
    description:
      "Pursue your dream of becoming a doctor at the University of Milan with top-notch English-taught programs.",
    university: "University of Milan",
    location: "Milan, Italy",
    type: "Bachelor",
    duration: "6 Years",
    discount: 20,
    image: "/assets/c1.png",
    highlights: [
      "Taught in English",
      "Globally recognized degree",
      "Affordable tuition fee",
      "No donation/capitation fee",
      "Modern campus facilities",
    ],
    requirements: [
      "High school diploma",
      "English proficiency",
      "Entrance exam",
    ],
    tuition: {
      international: "€3,000 - €5,000 per year",
      local: "€1,000 - €2,000 per year",
    },
    contact: {
      email: "admissions@unimi.it",
      phone: "+39 02 5031 1111",
    },
  },
  {
    id: 40519,
    title: "Engineering in Pisa",
    slug: "engineering-in-pisa",
    description:
      "Study Engineering at the historic University of Pisa with modern labs and practical experience.",
    university: "University of Pisa",
    location: "Pisa, Italy",
    type: "Bachelor",
    duration: "3 Years",
    discount: 15,
    image: "/assets/c2.png",
    highlights: [
      "Hands-on learning",
      "English-taught courses",
      "Career support services",
      "Affordable education",
      "Historic campus",
    ],
    requirements: [
      "High school diploma",
      "Basic mathematics proficiency",
      "English test score",
    ],
    tuition: {
      international: "€2,500 - €4,000 per year",
      local: "€1,200 - €2,500 per year",
    },
    contact: {
      email: "engineering@unipi.it",
      phone: "+39 050 221 2111",
    },
  },

  // Added extra courses for University of Pisa below:
  {
    id: 40526,
    title: "Computer Science in Pisa",
    slug: "computer-science-in-pisa",
    description:
      "Learn cutting-edge computer science topics and software engineering at the University of Pisa.",
    university: "University of Pisa",
    location: "Pisa, Italy",
    type: "Bachelor",
    duration: "3 Years",
    discount: 18,
    image: "/assets/c1.png",
    highlights: [
      "Modern CS labs",
      "Industry collaboration",
      "Research opportunities",
      "International faculty",
    ],
    requirements: [
      "High school diploma",
      "Mathematics proficiency",
      "English test score",
    ],
    tuition: {
      international: "€2,700 - €4,200 per year",
      local: "€1,300 - €2,600 per year",
    },
    contact: {
      email: "cs@unipi.it",
      phone: "+39 050 221 2222",
    },
  },
  {
    id: 40527,
    title: "Architecture in Pisa",
    slug: "architecture-in-pisa",
    description:
      "Explore creative architectural design and urban planning with experienced faculty at the University of Pisa.",
    university: "University of Pisa",
    location: "Pisa, Italy",
    type: "Bachelor",
    duration: "4 Years",
    discount: 14,
    image: "/assets/c2.png",
    highlights: [
      "Creative design studio",
      "Historic and modern architecture",
      "Hands-on projects",
      "International exposure",
    ],
    requirements: [
      "High school diploma",
      "Portfolio submission",
      "English proficiency",
    ],
    tuition: {
      international: "€3,000 - €4,500 per year",
      local: "€1,400 - €3,000 per year",
    },
    contact: {
      email: "architecture@unipi.it",
      phone: "+39 050 221 2333",
    },
  },

  {
    id: 40520,
    title: "Law at Bologna",
    slug: "law-at-bologna",
    description:
      "Join the world’s oldest university to study Law with internationally respected faculty.",
    university: "University of Bologna",
    location: "Bologna, Italy",
    type: "Bachelor",
    duration: "5 Years",
    discount: 10,
    image: "/assets/c1.png",
    highlights: [
      "Oldest university",
      "UNESCO heritage city",
      "Strong legal curriculum",
      "Rich student culture",
      "Global alumni network",
    ],
    requirements: [
      "High school certificate",
      "Language proficiency",
      "Motivation letter",
    ],
    tuition: {
      international: "€3,000 - €4,800 per year",
      local: "€1,200 - €2,800 per year",
    },
    contact: {
      email: "law@unibo.it",
      phone: "+39 051 209 9111",
    },
  },
  {
    id: 40521,
    title: "Finance at Fudan",
    slug: "finance-at-fudan",
    description:
      "Build a global career in finance at one of Asia’s top-ranked universities in Shanghai.",
    university: "Fudan University",
    location: "Shanghai, China",
    type: "Bachelor",
    duration: "4 Years",
    discount: 25,
    image: "/assets/c2.png",
    highlights: [
      "Top finance programs",
      "Located in financial hub",
      "Diverse student body",
      "Modern classrooms",
      "Strong industry ties",
    ],
    requirements: [
      "High school marksheet",
      "IELTS/TOEFL",
      "Mathematics background",
    ],
    tuition: {
      international: "¥30,000 - ¥42,000 per year",
      local: "¥6,000 - ¥8,000 per year",
    },
    contact: {
      email: "finance@fudan.edu.cn",
      phone: "+86 21 6564 2222",
    },
  },
  {
    id: 40522,
    title: "Computer Science at Tsinghua",
    slug: "cs-at-tsinghua",
    description:
      "Learn cutting-edge computer science and AI from leading faculty at Tsinghua University, Beijing.",
    university: "Tsinghua University",
    location: "Beijing, China",
    type: "Bachelor",
    duration: "4 Years",
    discount: 30,
    image: "/assets/c1.png",
    highlights: [
      "Top CS faculty",
      "Advanced labs",
      "Strong global reputation",
      "Competitive environment",
      "Scholarship options",
    ],
    requirements: [
      "High school grades",
      "Math & Programming test",
      "Interview",
    ],
    tuition: {
      international: "¥35,000 - ¥50,000 per year",
      local: "¥7,000 - ¥10,000 per year",
    },
    contact: {
      email: "cs@tsinghua.edu.cn",
      phone: "+86 10 6278 3000",
    },
  },
  {
    id: 40523,
    title: "Architecture in Wuhan",
    slug: "architecture-in-wuhan",
    description:
      "Explore design and creativity in a beautiful campus setting with a focus on modern architecture.",
    university: "Wuhan University",
    location: "Wuhan, China",
    type: "Bachelor",
    duration: "5 Years",
    discount: 18,
    image: "/assets/c2.png",
    highlights: [
      "Creative curriculum",
      "English medium",
      "Renowned faculty",
      "Urban design labs",
      "International exposure",
    ],
    requirements: [
      "High school with arts background",
      "Portfolio",
      "Basic English",
    ],
    tuition: {
      international: "¥28,000 - ¥40,000 per year",
      local: "¥6,000 - ¥8,000 per year",
    },
    contact: {
      email: "architecture@whu.edu.cn",
      phone: "+86 27 6875 2222",
    },
  },
  {
    id: 40524,
    title: "PhD in History - Bologna",
    slug: "phd-history-bologna",
    description:
      "Deep dive into historical research with expert mentorship at the University of Bologna.",
    university: "University of Bologna",
    location: "Bologna, Italy",
    type: "PhD",
    duration: "3 Years",
    discount: 35,
    image: "/assets/c1.png",
    highlights: [
      "Historic archives access",
      "Top faculty",
      "Scholarship opportunities",
      "International research conferences",
      "Multilingual support",
    ],
    requirements: [
      "Master’s degree",
      "Research proposal",
      "Interview",
    ],
    tuition: {
      international: "€1,500 - €3,500 per year",
      local: "€500 - €1,000 per year",
    },
    contact: {
      email: "phd.history@unibo.it",
      phone: "+39 051 209 9111",
    },
  },
  {
    id: 40525,
    title: "MBA in Milan",
    slug: "mba-in-milan",
    description:
      "Advance your career with an international MBA at the University of Milan with real-world projects.",
    university: "University of Milan",
    location: "Milan, Italy",
    type: "Master",
    duration: "2 Years",
    discount: 12,
    image: "/assets/c2.png",
    highlights: [
      "Industry-led curriculum",
      "Global business exposure",
      "Networking events",
      "Modern classrooms",
      "Case study based teaching",
    ],
    requirements: [
      "Bachelor’s degree",
      "Work experience",
      "GMAT/GRE",
    ],
    tuition: {
      international: "€4,000 - €6,000 per year",
      local: "€2,000 - €3,000 per year",
    },
    contact: {
      email: "mba@unimi.it",
      phone: "+39 02 5031 1111",
    },
  },
  {
    id: 41125,
    title: "MBA in Milan",
    slug: "mba-in-milan",
    description:
      "Advance your career with an international MBA at the University of Milan with real-world projects.",
    university: "University of Milan",
    location: "Milan, Italy",
    type: "Master",
    duration: "2 Years",
    discount: 12,
    image: "/assets/c2.png",
    highlights: [
      "Industry-led curriculum",
      "Global business exposure",
      "Networking events",
      "Modern classrooms",
      "Case study based teaching",
    ],
    requirements: [
      "Bachelor’s degree",
      "Work experience",
      "GMAT/GRE",
    ],
    tuition: {
      international: "€4,000 - €6,000 per year",
      local: "€2,000 - €3,000 per year",
    },
    contact: {
      email: "mba@unimi.it",
      phone: "+39 02 5031 1111",
    },
  },
  
];

export default courses;
