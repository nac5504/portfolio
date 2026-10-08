const getAssetPath = (path: string) => `/portfolio${path}`;

export interface App {
  name: string;
  slug: string;
  color: string;
  colorEnd: string;
  emoji: string;
  icon: string;
  description: string;
  dates: string;
  location: string;
  content: string[];
  links: { label: string; url: string; platform: string }[];
}

export const apps: App[] = [
  {
    name: "Cravr", slug: "cravr", color: "#FF6B6B", colorEnd: "#E84545", emoji: "\u{1F9E0}", icon: getAssetPath("/icons/cravr.png"),
    description: "AI-powered craving behavior companion — 80K+ downloads, $15K MRR, built and shipped solo.",
    dates: "Nov 2024 — Present", location: "Atlanta, GA",
    content: [
      "Sole iOS developer of a live App Store product with 80K+ downloads and $15K monthly recurring revenue. Architected the full client in SwiftUI using MVVM, with Firebase handling multi-provider auth (Sign in with Apple, Google, phone/SMS), Firestore as the primary data layer, and Cloud Functions for server-side logic.",
      "Shipped a production monetization stack: RevenueCat for subscription management and server-side receipt validation, Superwall for dynamic paywall A/B testing, and Stripe for web billing. Integrated Adjust with SKAdNetwork for privacy-compliant attribution, wired to Apple Search Ads for keyword-level install-to-subscriber tracking.",
      "Implemented Twilio SMS re-engagement and cart abandonment sequences with TCPA-compliant opt-in and toll-free number verification. Integrated OpenAI's API to power the craving analysis engine — mapping user inputs to nutritional context in real time. Owns the full product lifecycle: architecture, App Store distribution, and growth infrastructure.",
    ],
    links: [{ label: "App Store", url: "#", platform: "appstore" }, { label: "GitHub", url: "#", platform: "github" }],
  },
  {
    name: "Nomad", slug: "nomad", color: "#5CE0D5", colorEnd: "#36B5A0", emoji: "\u{1F5FA}\uFE0F", icon: getAssetPath("/icons/nomad.png"),
    description: "A travel companion app that curates personalized itineraries, discovers hidden local gems, and connects you with fellow travelers.",
    dates: "Aug 2024 — Dec 2024", location: "Remote",
    content: [
      "Architected a cross-platform mobile app with React Native featuring real-time itinerary collaboration, offline map caching, and push notifications for trip updates.",
      "Developed a location-aware recommendation system using PostGIS geospatial queries and collaborative filtering to surface hidden gems tailored to each traveler's interests.",
      "Implemented social features including trip sharing, traveler matching by destination, and a community-driven point-of-interest database with user reviews and photos.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Demo Video", url: "#", platform: "website" }],
  },
  {
    name: "FlavorFeed", slug: "flavorfeed", color: "#FFE066", colorEnd: "#FFBC42", emoji: "\u{1F355}", icon: getAssetPath("/icons/flavorfeed.png"),
    description: "A social food discovery platform where users share, rate, and find the best dishes near them through a swipeable feed.",
    dates: "Mar 2024 — Jul 2024", location: "San Francisco, CA",
    content: [
      "Built a social food discovery platform from the ground up using React Native with a Tinder-style swipeable feed for browsing dishes posted by nearby users and restaurants.",
      "Engineered a geolocation-based feed algorithm that ranks dishes by proximity, aggregate ratings, and learned taste preferences using a lightweight ML model trained on user interactions.",
      "Designed and implemented photo upload with automatic dish recognition, restaurant tagging via Google Places API, and real-time review updates powered by WebSockets.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "YouTube", url: "#", platform: "website" }],
  },
  {
    name: "Guess-E", slug: "guess-e", color: "#7EE8B4", colorEnd: "#4CC98A", emoji: "\u{1F3A8}", icon: getAssetPath("/icons/guesse.png"),
    description: "A creative guessing game powered by AI-generated art. Players sketch prompts and others guess what was drawn.",
    dates: "Nov 2023 — Feb 2024", location: "Hackathon Project",
    content: [
      "Created a multiplayer drawing and guessing game that leverages DALL-E to generate creative visual prompts and evaluates player sketches for similarity using CLIP embeddings.",
      "Implemented real-time game state synchronization using Socket.IO, supporting up to 8 concurrent players per room with sub-100ms latency on average.",
      "Won 2nd place at HackSF 2023. The project was built in 36 hours by a team of three, with my focus on the real-time backend and AI integration.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Devpost", url: "#", platform: "website" }],
  },
  {
    name: "mal", slug: "mal", color: "#D8A4E8", colorEnd: "#B57CC8", emoji: "\u{1F4DA}", icon: getAssetPath("/icons/mal.png"),
    description: "A media tracking app for anime, manga, books, and more. Log what you've watched, rate it, and get personalized recommendations.",
    dates: "Jun 2023 — Oct 2023", location: "Personal Project",
    content: [
      "Developed a comprehensive media tracking application supporting anime, manga, books, and podcasts with detailed logging, rating, and review features.",
      "Integrated with MyAnimeList, Open Library, and Spotify APIs to auto-populate metadata, cover art, and synopses — reducing manual entry for users by over 90%.",
      "Built a recommendation engine using collaborative filtering on aggregated user ratings, surfacing personalized suggestions with an explanation of why each item was recommended.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Live App", url: "#", platform: "website" }],
  },
  {
    name: "Letter Day", slug: "letterday", color: "#82D4F2", colorEnd: "#5BA8D4", emoji: "\u{1F4C5}", icon: getAssetPath("/icons/letterday.png"),
    description: "A mindful journaling app that delivers a daily letter prompt, encouraging reflection and building a habit of expressive writing.",
    dates: "Feb 2023 — May 2023", location: "Personal Project",
    content: [
      "Designed and built a journaling app focused on daily reflection through curated writing prompts, featuring a calming minimalist interface with smooth animations and haptic feedback.",
      "Implemented a streak and habit tracking system with local push notifications, achieving a 60% day-7 retention rate among beta testers.",
      "Created a private journal archive with full-text search, mood tagging, and a monthly reflection summary generated using GPT-4, helping users track personal growth over time.",
    ],
    links: [{ label: "App Store", url: "#", platform: "appstore" }, { label: "GitHub", url: "#", platform: "github" }],
  },
];

