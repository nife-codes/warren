export type CaseType = "true-crime" | "lore" | "conspiracy";

export interface CaseAuthor {
  id: string;
  username: string;
  avatar: string;
}

export interface CaseItem {
  id: string;
  type: CaseType;
  title: string;
  summary: string;
  tags: string[];
  author: CaseAuthor;
  likes: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  content: Record<string, string>;
}

const authors: CaseAuthor[] = [
  { id: "1", username: "nightowl", avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=nightowl&backgroundColor=c0aede" },
  { id: "2", username: "redstring", avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=redstring&backgroundColor=d1a7a0" },
  { id: "3", username: "deepdive", avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=deepdive&backgroundColor=b6c4d4" },
  { id: "4", username: "lorekeeper", avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=lorekeeper&backgroundColor=c9b8d9" },
];

export const currentUser: CaseAuthor = {
  id: "0",
  username: "warren_rabbit",
  avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=warren&backgroundColor=d4a0b9",
};

export const mockCases: CaseItem[] = [
  {
    id: "1",
    type: "true-crime",
    title: "The Disappearance of Maura Murray",
    summary: "A 21-year-old nursing student vanished after a car crash on a rural New Hampshire road in 2004. No body, no clear motive, no answers.",
    tags: ["missing person", "cold case", "new hampshire"],
    author: authors[0],
    likes: 234,
    saves: 89,
    liked: false,
    saved: false,
    createdAt: "2026-02-15",
    content: {
      "Case Name": "The Disappearance of Maura Murray",
      "Victim(s)": "Maura Murray, 21, nursing student at UMass Amherst",
      "Suspect(s)": "No confirmed suspects. Persons of interest include a local man seen near the crash site.",
      "What Happened": "On February 9, 2004, Maura packed her belongings, emailed professors about a family emergency (none occurred), and drove north on Route 112 in Haverhill, NH. Her car was found crashed into a snowbank. A bus driver offered help; she refused. When police arrived 7 minutes later, she was gone.",
      "Evidence": "Alcohol found in the car. Search dogs lost her scent 100 yards from the vehicle. No footprints in the snow leading into the woods.",
      "Current Status": "Cold case. Still actively investigated by NH Cold Case Unit.",
      "Source": "Multiple — FBI files, NH State Police, Oxygen documentary series",
    },
  },
  {
    id: "2",
    type: "lore",
    title: "The Mothman of Point Pleasant",
    summary: "A winged creature with glowing red eyes terrorized a small West Virginia town for 13 months before the Silver Bridge collapsed.",
    tags: ["cryptid", "west virginia", "prophecy"],
    author: authors[3],
    likes: 412,
    saves: 156,
    liked: true,
    saved: false,
    createdAt: "2026-02-10",
    content: {
      "Title": "The Mothman of Point Pleasant",
      "Origin": "Point Pleasant, West Virginia, 1966-1967",
      "The Claim": "Dozens of residents reported seeing a large, humanoid creature with massive wings and glowing red eyes. Sightings began in November 1966 and continued until the Silver Bridge collapsed on December 15, 1967, killing 46 people.",
      "Why People Believe It": "Over 100 witnesses reported sightings. The timing with the bridge collapse suggests prophetic warning. Similar creatures reported globally before disasters.",
      "Debunked or Not": "Skeptics suggest a large sandhill crane or barn owl. No definitive explanation.",
      "Creep Factor": "4",
      "Source": "John Keel, 'The Mothman Prophecies' (1975), local newspaper archives",
    },
  },
  {
    id: "3",
    type: "conspiracy",
    title: "The Denver Airport Murals",
    summary: "Underground tunnels, apocalyptic artwork, and a demonic horse statue. What's really going on beneath DIA?",
    tags: ["government", "symbolism", "underground"],
    author: authors[1],
    likes: 567,
    saves: 201,
    liked: false,
    saved: true,
    createdAt: "2026-02-08",
    content: {
      "Title": "The Denver Airport Murals",
      "The Theory": "Denver International Airport was built as a secret underground bunker for the elite, with murals depicting a New World Order takeover, biological warfare, and mass death.",
      "Who's Behind It": "Alleged ties to the New World Order, Freemasons (a Masonic capstone exists in the terminal), and unnamed government agencies.",
      "The Evidence For It": "Murals by Leo Tanguma depict soldiers in gas masks, dead children, and burning cities. The airport was $2 billion over budget. A vast tunnel system exists beneath it. The Blue Mustang sculpture killed its creator.",
      "The Holes In It": "The murals are meant to depict the triumph of peace over war. The tunnels house a baggage system. Budget overruns are common in large projects.",
      "Status": "Mainstream — DIA itself leans into the conspiracy for marketing",
      "Source": "DIA public records, Leo Tanguma interviews, multiple documentaries",
    },
  },
  {
    id: "4",
    type: "true-crime",
    title: "The Zodiac Killer Ciphers",
    summary: "A serial killer taunted police with cryptographic puzzles. One was solved 51 years later. Others remain unbroken.",
    tags: ["serial killer", "cipher", "san francisco", "unsolved"],
    author: authors[2],
    likes: 891,
    saves: 334,
    liked: false,
    saved: false,
    createdAt: "2026-01-28",
    content: {
      "Case Name": "The Zodiac Killer",
      "Victim(s)": "At least 5 confirmed, claimed 37",
      "Suspect(s)": "Arthur Leigh Allen (primary), multiple others investigated. Never conclusively identified.",
      "What Happened": "Between 1968-1969, a killer attacked couples in Northern California. He sent taunting letters and cryptograms to newspapers, demanding they be published or he would kill again.",
      "Evidence": "Four ciphers sent. Z408 solved in 1969. Z340 solved in 2020 by amateur codebreakers. Z13 and Z32 remain unsolved. DNA evidence collected but inconclusive.",
      "Current Status": "Open — FBI and local agencies still investigating",
      "Source": "FBI Vault, San Francisco Chronicle archives, Zodiac Killer documentary (2007)",
    },
  },
  {
    id: "5",
    type: "lore",
    title: "The Backrooms",
    summary: "If you're not careful and noclip out of reality, you'll end up in the Backrooms. Miles of mono-yellow rooms, damp carpet, fluorescent buzz.",
    tags: ["liminal space", "internet lore", "creepypasta"],
    author: authors[0],
    likes: 723,
    saves: 289,
    liked: false,
    saved: false,
    createdAt: "2026-02-01",
    content: {
      "Title": "The Backrooms",
      "Origin": "4chan /x/ board, May 2019. A single image of a yellow room sparked collaborative worldbuilding.",
      "The Claim": "There exists a pocket dimension of infinite yellow rooms that you can accidentally 'clip' into. Different levels contain different entities and hazards.",
      "Why People Believe It": "The original image is unsettlingly familiar — it triggers recognition of spaces everyone has seen but can't place. Liminal space photography taps into deep unease.",
      "Debunked or Not": "Fictional, but the original image's source has never been identified",
      "Creep Factor": "5",
      "Source": "4chan archives, Backrooms Wiki, Kane Pixels YouTube series",
    },
  },
  {
    id: "6",
    type: "conspiracy",
    title: "Numbers Stations",
    summary: "Shortwave radio broadcasts of robotic voices reading number sequences. They've been running for decades. Nobody officially claims them.",
    tags: ["espionage", "cold war", "radio", "signals"],
    author: authors[2],
    likes: 345,
    saves: 128,
    liked: true,
    saved: true,
    createdAt: "2026-02-12",
    content: {
      "Title": "Numbers Stations",
      "The Theory": "Government intelligence agencies use shortwave radio to broadcast encrypted messages to spies in the field using one-time pad encryption, making them theoretically unbreakable.",
      "Who's Behind It": "CIA, MI6, Mossad, FSB, Cuban intelligence (confirmed for some stations)",
      "The Evidence For It": "The Atención station was linked to Cuban spies in the US (Wasp Network trial, 2001). Stations correlate with known intelligence operations. Some operate on military frequencies.",
      "The Holes In It": "In the digital age, these seem obsolete. Some may be automated relics. No government has fully acknowledged their use.",
      "Status": "Partially confirmed — some stations linked to real espionage operations",
      "Source": "Conet Project recordings, Priyom.org, declassified court documents",
    },
  },
];

export const myCases = mockCases.filter((_, i) => i % 2 === 0);
