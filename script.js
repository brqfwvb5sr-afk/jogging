"use strict";

const SPOTIFY_CLIENT_ID = "56c93ec577624c4d9f086f275bb0bf79";
const REDIRECT_URI = "https://brqfwvb5sr-afk.github.io/jogging/";
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-top-read",
  "user-library-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative"
];

const TOKEN_STORAGE_KEY = "jogging_queue_generator_spotify_token";
const CODE_VERIFIER_KEY = "jogging_queue_generator_code_verifier";
const AUTH_STATE_KEY = "jogging_queue_generator_auth_state";
const RECENT_SONG_STORAGE_KEY = "jogging_queue_generator_recent_songs";
const TASTE_PROFILE_STORAGE_KEY = "jogging_queue_generator_taste_profile";
const RECENT_SONG_LIMIT = 60;
const TASTE_PROFILE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_PLAYLISTS_TO_SCAN = 10;
const MAX_TRACKS_PER_PLAYLIST = 50;
const MIN_PERSONAL_SELECTION_SHARE = 0.6;
const QUEUE_DELAY_MS = 320;
const POSITIVE_RUNNING_TITLE_WORDS = [
  "run",
  "running",
  "power",
  "strong",
  "fire",
  "energy",
  "hype",
  "fast",
  "go",
  "move",
  "jump",
  "win",
  "alive",
  "unstoppable"
];
const NEGATIVE_RUNNING_TITLE_WORDS = [
  "sad",
  "cry",
  "crying",
  "tears",
  "lonely",
  "alone",
  "broken",
  "heartbreak",
  "blue",
  "slow",
  "sleep",
  "tired",
  "pain",
  "ghost",
  "empty",
  "baby doll"
];
const NEGATIVE_RUNNING_GENRE_WORDS = [
  "sad",
  "acoustic",
  "piano",
  "ballad",
  "ambient",
  "lo-fi",
  "lofi",
  "sleep",
  "chill",
  "sad rap",
  "bedroom pop",
  "indie sad",
  "slowcore"
];
const PERSONAL_FINAL_SCORE_MIN = {
  strict: { warmup: 80, flow: 105, push: 115, cooldown: 55 },
  relaxed: { warmup: 45, flow: 65, push: 70, cooldown: 30 }
};
const RUNNING_SCORE_MIN = {
  strict: { warmup: 35, flow: 50, push: 55, cooldown: 22 },
  relaxed: { warmup: 12, flow: 25, push: 28, cooldown: 8 }
};
const REQUIRED_TASTE_SCOPES = [
  "user-top-read",
  "user-library-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative"
];
const GERMAN_ARTISTS = new Set([
  "apache 207",
  "luciano",
  "raf camora",
  "bonez mc",
  "pashanim",
  "cro",
  "sido",
  "kontra k",
  "marteria",
  "peter fox",
  "ski aggu",
  "makko",
  "paula hartmann",
  "mark forster",
  "wincent weiss",
  "lea",
  "kraftklub",
  "sportfreunde stiller",
  "wir sind helden",
  "die arzte",
  "die aerzte",
  "die toten hosen",
  "annenmaykantereit",
  "seeed",
  "robin schulz",
  "felix jaehn",
  "alle farben",
  "topic",
  "glockenbach",
  "purple disco machine",
  "ufo361",
  "rin",
  "capital bra",
  "kc rebell",
  "nena",
  "clueso"
]);
const GERMAN_TITLE_WORDS = [
  "alles",
  "ander",
  "bilder",
  "chor",
  "dein",
  "deutsch",
  "ding",
  "erfolg",
  "friesenjung",
  "gluck",
  "junge",
  "kopf",
  "liebe",
  "mietfrei",
  "nachts",
  "neu",
  "sowieso",
  "tage",
  "traum",
  "tust",
  "ubermorgen",
  "warnung",
  "wieso",
  "zukunft"
];
const GERMAN_PLAYLIST_HINTS = [
  "deutsch",
  "german",
  "deutschrap",
  "rap deutsch",
  "schweiz",
  "swiss",
  "german rap"
];
const OPEN_SPOTIFY_MESSAGE =
  "Öffne Spotify auf deinem Handy oder PC und starte kurz einen Song. Danach klicke erneut auf Geräte aktualisieren.";

const phaseDefinitions = [
  { key: "warmup", label: "Warm-up", share: 0.15, description: "Locker starten" },
  { key: "flow", label: "Flow", share: 0.35, description: "Stabiler Rhythmus" },
  { key: "push", label: "Push", share: 0.35, description: "Mehr Energie" },
  { key: "cooldown", label: "Cooldown", share: 0.15, description: "Ruhig auslaufen" }
];

const warmupSongs = [
  { title: "Blinding Lights", artist: "The Weeknd", phase: "warmup", genre: "pop", estimatedDurationSeconds: 200 },
  { title: "Levitating", artist: "Dua Lipa", phase: "warmup", genre: "pop", estimatedDurationSeconds: 203 },
  { title: "Watermelon Sugar", artist: "Harry Styles", phase: "warmup", genre: "pop", estimatedDurationSeconds: 174 },
  { title: "Flowers", artist: "Miley Cyrus", phase: "warmup", genre: "pop", estimatedDurationSeconds: 200 },
  { title: "Good as Hell", artist: "Lizzo", phase: "warmup", genre: "pop", estimatedDurationSeconds: 159 },
  { title: "Treasure", artist: "Bruno Mars", phase: "warmup", genre: "pop", estimatedDurationSeconds: 178 },
  { title: "Cake By The Ocean", artist: "DNCE", phase: "warmup", genre: "pop", estimatedDurationSeconds: 218 },
  { title: "Walking On Sunshine", artist: "Katrina & The Waves", phase: "warmup", genre: "pop", estimatedDurationSeconds: 239 },
  { title: "Good Time", artist: "Owl City", phase: "warmup", genre: "pop", estimatedDurationSeconds: 205 },
  { title: "Shake It Off", artist: "Taylor Swift", phase: "warmup", genre: "pop", estimatedDurationSeconds: 219 },
  { title: "Rather Be", artist: "Clean Bandit", phase: "warmup", genre: "edm", estimatedDurationSeconds: 227 },
  { title: "Wake Me Up", artist: "Avicii", phase: "warmup", genre: "edm", estimatedDurationSeconds: 247 },
  { title: "This Girl", artist: "Kungs", phase: "warmup", genre: "edm", estimatedDurationSeconds: 195 },
  { title: "Firestone", artist: "Kygo", phase: "warmup", genre: "edm", estimatedDurationSeconds: 273 },
  { title: "Something Just Like This", artist: "The Chainsmokers", phase: "warmup", genre: "edm", estimatedDurationSeconds: 247 },
  { title: "Sun Is Shining", artist: "Axwell /\\ Ingrosso", phase: "warmup", genre: "edm", estimatedDurationSeconds: 254 },
  { title: "Summer", artist: "Calvin Harris", phase: "warmup", genre: "edm", estimatedDurationSeconds: 223 },
  { title: "I Took A Pill In Ibiza - Seeb Remix", artist: "Mike Posner", phase: "warmup", genre: "edm", estimatedDurationSeconds: 198 },
  { title: "Fast Car", artist: "Jonas Blue", phase: "warmup", genre: "edm", estimatedDurationSeconds: 212 },
  { title: "Prayer in C - Robin Schulz Radio Edit", artist: "Lilly Wood and The Prick", phase: "warmup", genre: "edm", estimatedDurationSeconds: 189 },
  { title: "Good Life", artist: "Kanye West", phase: "warmup", genre: "rap", estimatedDurationSeconds: 207 },
  { title: "The Spins", artist: "Mac Miller", phase: "warmup", genre: "rap", estimatedDurationSeconds: 195 },
  { title: "Sunflower", artist: "Post Malone", phase: "warmup", genre: "rap", estimatedDurationSeconds: 158 },
  { title: "Can I Kick It?", artist: "A Tribe Called Quest", phase: "warmup", genre: "rap", estimatedDurationSeconds: 252 },
  { title: "Rapper's Delight", artist: "The Sugarhill Gang", phase: "warmup", genre: "rap", estimatedDurationSeconds: 234 },
  { title: "The Choice Is Yours", artist: "Black Sheep", phase: "warmup", genre: "rap", estimatedDurationSeconds: 204 },
  { title: "Get By", artist: "Talib Kweli", phase: "warmup", genre: "rap", estimatedDurationSeconds: 227 },
  { title: "Feel So Good", artist: "Mase", phase: "warmup", genre: "rap", estimatedDurationSeconds: 204 },
  { title: "The Seed (2.0)", artist: "The Roots", phase: "warmup", genre: "rap", estimatedDurationSeconds: 267 },
  { title: "Day 'n' Nite", artist: "Kid Cudi", phase: "warmup", genre: "rap", estimatedDurationSeconds: 221 },
  { title: "Chöre", artist: "Mark Forster", phase: "warmup", genre: "pop", estimatedDurationSeconds: 208 },
  { title: "Sowieso", artist: "Mark Forster", phase: "warmup", genre: "pop", estimatedDurationSeconds: 202 },
  { title: "Musik sein", artist: "Wincent Weiss", phase: "warmup", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "Ein Kompliment", artist: "Sportfreunde Stiller", phase: "warmup", genre: "pop", estimatedDurationSeconds: 196 },
  { title: "Ding", artist: "Seeed", phase: "warmup", genre: "pop", estimatedDurationSeconds: 206 },
  { title: "Easy", artist: "Cro", phase: "warmup", genre: "rap", estimatedDurationSeconds: 173 },
  { title: "Traum", artist: "Cro", phase: "warmup", genre: "rap", estimatedDurationSeconds: 195 },
  { title: "Bilder im Kopf", artist: "Sido", phase: "warmup", genre: "rap", estimatedDurationSeconds: 237 },
  { title: "Airwaves", artist: "Pashanim", phase: "warmup", genre: "rap", estimatedDurationSeconds: 139 },
  { title: "Sun Goes Down", artist: "Robin Schulz", phase: "warmup", genre: "edm", estimatedDurationSeconds: 180 },
  { title: "Supergirl", artist: "Alle Farben", phase: "warmup", genre: "edm", estimatedDurationSeconds: 212 },
  { title: "Home", artist: "Topic", phase: "warmup", genre: "edm", estimatedDurationSeconds: 206 }
];

const flowSongs = [
  { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", phase: "flow", genre: "pop", estimatedDurationSeconds: 236 },
  { title: "Shut Up and Dance", artist: "WALK THE MOON", phase: "flow", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "Dynamite", artist: "BTS", phase: "flow", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "As It Was", artist: "Harry Styles", phase: "flow", genre: "pop", estimatedDurationSeconds: 167 },
  { title: "Locked Out of Heaven", artist: "Bruno Mars", phase: "flow", genre: "pop", estimatedDurationSeconds: 233 },
  { title: "Raise Your Glass", artist: "P!nk", phase: "flow", genre: "pop", estimatedDurationSeconds: 203 },
  { title: "Since U Been Gone", artist: "Kelly Clarkson", phase: "flow", genre: "pop", estimatedDurationSeconds: 188 },
  { title: "Runaway Baby", artist: "Bruno Mars", phase: "flow", genre: "pop", estimatedDurationSeconds: 148 },
  { title: "Moves Like Jagger", artist: "Maroon 5", phase: "flow", genre: "pop", estimatedDurationSeconds: 201 },
  { title: "Teenage Dream", artist: "Katy Perry", phase: "flow", genre: "pop", estimatedDurationSeconds: 228 },
  { title: "Titanium", artist: "David Guetta", phase: "flow", genre: "edm", estimatedDurationSeconds: 245 },
  { title: "The Nights", artist: "Avicii", phase: "flow", genre: "edm", estimatedDurationSeconds: 176 },
  { title: "Lean On", artist: "Major Lazer", phase: "flow", genre: "edm", estimatedDurationSeconds: 176 },
  { title: "Where Are U Now", artist: "Skrillex", phase: "flow", genre: "edm", estimatedDurationSeconds: 250 },
  { title: "Don't You Worry Child", artist: "Swedish House Mafia", phase: "flow", genre: "edm", estimatedDurationSeconds: 212 },
  { title: "Clarity", artist: "Zedd", phase: "flow", genre: "edm", estimatedDurationSeconds: 271 },
  { title: "Sweet Nothing", artist: "Calvin Harris", phase: "flow", genre: "edm", estimatedDurationSeconds: 213 },
  { title: "I Could Be The One", artist: "Avicii", phase: "flow", genre: "edm", estimatedDurationSeconds: 208 },
  { title: "On My Way", artist: "Alan Walker", phase: "flow", genre: "edm", estimatedDurationSeconds: 193 },
  { title: "Heroes (we could be)", artist: "Alesso", phase: "flow", genre: "edm", estimatedDurationSeconds: 210 },
  { title: "HUMBLE.", artist: "Kendrick Lamar", phase: "flow", genre: "rap", estimatedDurationSeconds: 177 },
  { title: "Power", artist: "Kanye West", phase: "flow", genre: "rap", estimatedDurationSeconds: 292 },
  { title: "Lose Yourself", artist: "Eminem", phase: "flow", genre: "rap", estimatedDurationSeconds: 326 },
  { title: "Alright", artist: "Kendrick Lamar", phase: "flow", genre: "rap", estimatedDurationSeconds: 219 },
  { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", phase: "flow", genre: "rap", estimatedDurationSeconds: 258 },
  { title: "Remember The Name", artist: "Fort Minor", phase: "flow", genre: "rap", estimatedDurationSeconds: 230 },
  { title: "Black and Yellow", artist: "Wiz Khalifa", phase: "flow", genre: "rap", estimatedDurationSeconds: 218 },
  { title: "Work Out", artist: "J. Cole", phase: "flow", genre: "rap", estimatedDurationSeconds: 234 },
  { title: "Jump Around", artist: "House Of Pain", phase: "flow", genre: "rap", estimatedDurationSeconds: 217 },
  { title: "Hypnotize", artist: "The Notorious B.I.G.", phase: "flow", genre: "rap", estimatedDurationSeconds: 230 },
  { title: "Übermorgen", artist: "Mark Forster", phase: "flow", genre: "pop", estimatedDurationSeconds: 163 },
  { title: "Songs für Liam", artist: "Kraftklub", phase: "flow", genre: "pop", estimatedDurationSeconds: 183 },
  { title: "Denkmal", artist: "Wir sind Helden", phase: "flow", genre: "pop", estimatedDurationSeconds: 197 },
  { title: "Tage wie diese", artist: "Die Toten Hosen", phase: "flow", genre: "pop", estimatedDurationSeconds: 268 },
  { title: "Zukunft Pink", artist: "Peter Fox", phase: "flow", genre: "pop", estimatedDurationSeconds: 230 },
  { title: "Roller", artist: "Apache 207", phase: "flow", genre: "rap", estimatedDurationSeconds: 158 },
  { title: "Wieso tust Du dir das an?", artist: "Apache 207", phase: "flow", genre: "rap", estimatedDurationSeconds: 195 },
  { title: "Primo", artist: "RAF Camora", phase: "flow", genre: "rap", estimatedDurationSeconds: 193 },
  { title: "Astronaut", artist: "Sido", phase: "flow", genre: "rap", estimatedDurationSeconds: 238 },
  { title: "Kids (2 Finger an den Kopf)", artist: "Marteria", phase: "flow", genre: "rap", estimatedDurationSeconds: 232 },
  { title: "Sugar", artist: "Robin Schulz", phase: "flow", genre: "edm", estimatedDurationSeconds: 219 },
  { title: "Ain't Nobody", artist: "Felix Jaehn", phase: "flow", genre: "edm", estimatedDurationSeconds: 186 },
  { title: "Bad Ideas", artist: "Alle Farben", phase: "flow", genre: "edm", estimatedDurationSeconds: 174 },
  { title: "Breaking Me", artist: "Topic", phase: "flow", genre: "edm", estimatedDurationSeconds: 166 },
  { title: "Hypnotized", artist: "Purple Disco Machine", phase: "flow", genre: "edm", estimatedDurationSeconds: 196 }
];

const pushSongs = [
  { title: "Stronger", artist: "Kelly Clarkson", phase: "push", genre: "pop", estimatedDurationSeconds: 222 },
  { title: "Don't Start Now", artist: "Dua Lipa", phase: "push", genre: "pop", estimatedDurationSeconds: 183 },
  { title: "Uptown Funk", artist: "Mark Ronson", phase: "push", genre: "pop", estimatedDurationSeconds: 270 },
  { title: "Roar", artist: "Katy Perry", phase: "push", genre: "pop", estimatedDurationSeconds: 223 },
  { title: "Eye of the Tiger", artist: "Survivor", phase: "push", genre: "pop", estimatedDurationSeconds: 245 },
  { title: "Born This Way", artist: "Lady Gaga", phase: "push", genre: "pop", estimatedDurationSeconds: 260 },
  { title: "Physical", artist: "Dua Lipa", phase: "push", genre: "pop", estimatedDurationSeconds: 193 },
  { title: "Holding Out for a Hero", artist: "Bonnie Tyler", phase: "push", genre: "pop", estimatedDurationSeconds: 341 },
  { title: "Mr. Brightside", artist: "The Killers", phase: "push", genre: "pop", estimatedDurationSeconds: 223 },
  { title: "I Love It", artist: "Icona Pop", phase: "push", genre: "pop", estimatedDurationSeconds: 157 },
  { title: "Levels", artist: "Avicii", phase: "push", genre: "edm", estimatedDurationSeconds: 203 },
  { title: "Turn Down for What", artist: "DJ Snake", phase: "push", genre: "edm", estimatedDurationSeconds: 214 },
  { title: "Animals", artist: "Martin Garrix", phase: "push", genre: "edm", estimatedDurationSeconds: 304 },
  { title: "Greyhound", artist: "Swedish House Mafia", phase: "push", genre: "edm", estimatedDurationSeconds: 410 },
  { title: "Bangarang", artist: "Skrillex", phase: "push", genre: "edm", estimatedDurationSeconds: 215 },
  { title: "Tremor", artist: "Dimitri Vegas & Like Mike", phase: "push", genre: "edm", estimatedDurationSeconds: 294 },
  { title: "Bad", artist: "David Guetta", phase: "push", genre: "edm", estimatedDurationSeconds: 170 },
  { title: "Satisfaction", artist: "Benny Benassi", phase: "push", genre: "edm", estimatedDurationSeconds: 254 },
  { title: "Scary Monsters and Nice Sprites", artist: "Skrillex", phase: "push", genre: "edm", estimatedDurationSeconds: 244 },
  { title: "Sandstorm", artist: "Darude", phase: "push", genre: "edm", estimatedDurationSeconds: 225 },
  { title: "Till I Collapse", artist: "Eminem", phase: "push", genre: "rap", estimatedDurationSeconds: 298 },
  { title: "DNA.", artist: "Kendrick Lamar", phase: "push", genre: "rap", estimatedDurationSeconds: 186 },
  { title: "SICKO MODE", artist: "Travis Scott", phase: "push", genre: "rap", estimatedDurationSeconds: 313 },
  { title: "X Gon' Give It To Ya", artist: "DMX", phase: "push", genre: "rap", estimatedDurationSeconds: 217 },
  { title: "Jumpman", artist: "Drake", phase: "push", genre: "rap", estimatedDurationSeconds: 205 },
  { title: "All I Do Is Win", artist: "DJ Khaled", phase: "push", genre: "rap", estimatedDurationSeconds: 232 },
  { title: "m.A.A.d city", artist: "Kendrick Lamar", phase: "push", genre: "rap", estimatedDurationSeconds: 350 },
  { title: "Ante Up", artist: "M.O.P.", phase: "push", genre: "rap", estimatedDurationSeconds: 236 },
  { title: "No Problem", artist: "Chance the Rapper", phase: "push", genre: "rap", estimatedDurationSeconds: 304 },
  { title: "Started From the Bottom", artist: "Drake", phase: "push", genre: "rap", estimatedDurationSeconds: 173 },
  { title: "Junge", artist: "Die Ärzte", phase: "push", genre: "pop", estimatedDurationSeconds: 187 },
  { title: "Westerland", artist: "Die Ärzte", phase: "push", genre: "pop", estimatedDurationSeconds: 220 },
  { title: "Ein Song reicht", artist: "Kraftklub", phase: "push", genre: "pop", estimatedDurationSeconds: 197 },
  { title: "Augenbling", artist: "Seeed", phase: "push", genre: "pop", estimatedDurationSeconds: 214 },
  { title: "200 km/h", artist: "Apache 207", phase: "push", genre: "rap", estimatedDurationSeconds: 164 },
  { title: "500 PS", artist: "Bonez MC & RAF Camora", phase: "push", genre: "rap", estimatedDurationSeconds: 178 },
  { title: "Andere Liga", artist: "RAF Camora", phase: "push", genre: "rap", estimatedDurationSeconds: 183 },
  { title: "Erfolg ist kein Glück", artist: "Kontra K", phase: "push", genre: "rap", estimatedDurationSeconds: 237 },
  { title: "Warnung", artist: "Kontra K", phase: "push", genre: "rap", estimatedDurationSeconds: 187 },
  { title: "Party Sahne", artist: "Ski Aggu", phase: "push", genre: "rap", estimatedDurationSeconds: 143 },
  { title: "Friesenjung", artist: "Ski Aggu", phase: "push", genre: "rap", estimatedDurationSeconds: 146 },
  { title: "Mietfrei", artist: "Ski Aggu", phase: "push", genre: "rap", estimatedDurationSeconds: 147 },
  { title: "Schüttel deinen Speck", artist: "Peter Fox", phase: "push", genre: "rap", estimatedDurationSeconds: 242 },
  { title: "OK", artist: "Robin Schulz", phase: "push", genre: "edm", estimatedDurationSeconds: 190 },
  { title: "Dirty Dancing", artist: "Glockenbach", phase: "push", genre: "edm", estimatedDurationSeconds: 165 },
  { title: "Fireworks", artist: "Purple Disco Machine", phase: "push", genre: "edm", estimatedDurationSeconds: 200 },
  { title: "Dopamine", artist: "Purple Disco Machine", phase: "push", genre: "edm", estimatedDurationSeconds: 217 }
];

const cooldownSongs = [
  { title: "Golden", artist: "Harry Styles", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 209 },
  { title: "Adore You", artist: "Harry Styles", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 207 },
  { title: "Easy On Me", artist: "Adele", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 224 },
  { title: "Heat Waves", artist: "Glass Animals", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 239 },
  { title: "Sunday Best", artist: "Surfaces", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 159 },
  { title: "Put Your Records On", artist: "Corinne Bailey Rae", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 215 },
  { title: "Riptide", artist: "Vance Joy", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 204 },
  { title: "Better Together", artist: "Jack Johnson", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 207 },
  { title: "Budapest", artist: "George Ezra", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 200 },
  { title: "I'm Yours", artist: "Jason Mraz", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 242 },
  { title: "Stole the Show", artist: "Kygo", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 223 },
  { title: "Stay", artist: "Zedd", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 210 },
  { title: "Ocean Drive", artist: "Duke Dumont", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 206 },
  { title: "Latch", artist: "Disclosure", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 255 },
  { title: "Midnight City", artist: "M83", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 244 },
  { title: "Sunset Lover", artist: "Petit Biscuit", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 238 },
  { title: "Faded", artist: "Alan Walker", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 212 },
  { title: "Are You With Me", artist: "Lost Frequencies", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 138 },
  { title: "Waves - Robin Schulz Radio Edit", artist: "Mr. Probz", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 208 },
  { title: "The Ocean", artist: "Mike Perry", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 183 },
  { title: "Juice", artist: "Chance the Rapper", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 218 },
  { title: "Passin' Me By", artist: "The Pharcyde", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 303 },
  { title: "Crew", artist: "GoldLink", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 176 },
  { title: "Young, Wild & Free", artist: "Snoop Dogg", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 207 },
  { title: "One Love", artist: "Nas", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 325 },
  { title: "The Light", artist: "Common", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 244 },
  { title: "Electric Relaxation", artist: "A Tribe Called Quest", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 245 },
  { title: "Ms. Jackson", artist: "OutKast", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 270 },
  { title: "LOVE.", artist: "Kendrick Lamar", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 213 },
  { title: "Best Day Ever", artist: "Mac Miller", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 167 },
  { title: "110", artist: "LEA", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "Oft gefragt", artist: "AnnenMayKantereit", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 200 },
  { title: "Leiser", artist: "LEA", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 206 },
  { title: "Meer", artist: "Luciano", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 177 },
  { title: "Nachts wach", artist: "Makko", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 169 },
  { title: "DLIT", artist: "Paula Hartmann", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 178 },
  { title: "Book of Love", artist: "Felix Jaehn", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 198 },
  { title: "Brooklyn", artist: "Glockenbach", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 182 }
];

const songsByPhase = {
  warmup: warmupSongs,
  flow: flowSongs,
  push: pushSongs,
  cooldown: cooldownSongs
};

const elements = {
  authPanel: document.querySelector("#authPanel"),
  appPanel: document.querySelector("#appPanel"),
  loginButton: document.querySelector("#loginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  clientIdHint: document.querySelector("#clientIdHint"),
  profileLine: document.querySelector("#profileLine"),
  durationInput: document.querySelector("#durationInput"),
  genreSelect: document.querySelector("#genreSelect"),
  languagePreferenceSelect: document.querySelector("#languagePreferenceSelect"),
  useSpotifyTasteCheckbox: document.querySelector("#useSpotifyTasteCheckbox"),
  avoidSlowSongsCheckbox: document.querySelector("#avoidSlowSongsCheckbox"),
  tasteMessage: document.querySelector("#tasteMessage"),
  loadTasteButton: document.querySelector("#loadTasteButton"),
  refreshTasteButton: document.querySelector("#refreshTasteButton"),
  tasteStats: document.querySelector("#tasteStats"),
  personalizationDebug: document.querySelector("#personalizationDebug"),
  refreshDevicesButton: document.querySelector("#refreshDevicesButton"),
  regenerateButton: document.querySelector("#regenerateButton"),
  deviceSelect: document.querySelector("#deviceSelect"),
  deviceMessage: document.querySelector("#deviceMessage"),
  phaseCards: document.querySelector("#phaseCards"),
  planSummary: document.querySelector("#planSummary"),
  queueButton: document.querySelector("#queueButton"),
  startButton: document.querySelector("#startButton"),
  progressTitle: document.querySelector("#progressTitle"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  toast: document.querySelector("#toast"),
  spotifyOnly: document.querySelectorAll(".spotify-only")
};

let currentDevices = [];
let currentPlan = [];
let isBusy = false;
let personalTasteProfile = createEmptyTasteProfile();
let skippedPersonalRunningSongKeys = new Set();
let lastPlanStats = createEmptyPlanStats();

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  renderClientConfiguration();
  updatePlanPreview();
  renderLoggedOut();

  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const code = params.get("code");
  const state = params.get("state");

  if (error) {
    cleanCallbackUrl();
    showToast(`Spotify Login wurde abgebrochen oder ist fehlgeschlagen: ${error}`, "error");
  }

  if (code) {
    await runSafely(async () => {
      await handleAuthCallback(code, state);
      cleanCallbackUrl();
      await loadSpotifyProfile();
      await refreshPersonalTasteProfile();
      await refreshDevices();
    });
    return;
  }

  if (hasStoredToken()) {
    await runSafely(async () => {
      await loadSpotifyProfile();
      await refreshPersonalTasteProfile();
      await refreshDevices();
    });
  }
}

function bindEvents() {
  elements.loginButton.addEventListener("click", loginWithSpotify);
  elements.logoutButton.addEventListener("click", logout);
  elements.durationInput.addEventListener("input", updatePlanPreview);
  elements.genreSelect.addEventListener("change", updatePlanPreview);
  elements.languagePreferenceSelect.addEventListener("change", updatePlanPreview);
  elements.useSpotifyTasteCheckbox.addEventListener("change", handleTastePreferenceChange);
  elements.avoidSlowSongsCheckbox.addEventListener("change", updatePlanPreview);
  elements.loadTasteButton.addEventListener("click", () => runSafely(() => refreshPersonalTasteProfile({ forceRefresh: false })));
  elements.refreshTasteButton.addEventListener("click", () => runSafely(() => refreshPersonalTasteProfile({ forceRefresh: true })));
  elements.regenerateButton.addEventListener("click", regeneratePlan);
  elements.refreshDevicesButton.addEventListener("click", () => runSafely(refreshDevices));
  elements.queueButton.addEventListener("click", () => runSafely(() => loadQueue(false)));
  elements.startButton.addEventListener("click", () => runSafely(() => loadQueue(true)));
}

function renderClientConfiguration() {
  if (isClientConfigured()) {
    elements.clientIdHint.hidden = true;
    elements.loginButton.disabled = false;
    return;
  }

  elements.clientIdHint.hidden = false;
  elements.clientIdHint.textContent =
    "Trage zuerst deine Spotify Client ID in script.js bei SPOTIFY_CLIENT_ID ein.";
  elements.loginButton.disabled = true;
}

function isClientConfigured() {
  return (
    SPOTIFY_CLIENT_ID &&
    SPOTIFY_CLIENT_ID !== "DEINE_SPOTIFY_CLIENT_ID_HIER_EINTRAGEN" &&
    SPOTIFY_CLIENT_ID.length > 20
  );
}

async function loginWithSpotify() {
  if (!isClientConfigured()) {
    showToast("Spotify Client ID fehlt. Bitte script.js konfigurieren.", "error");
    return;
  }

  const codeVerifier = generateRandomString(96);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = generateRandomString(32);

  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(AUTH_STATE_KEY, state);

  const authParams = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${authParams.toString()}`);
}

async function handleAuthCallback(code, returnedState) {
  if (!isClientConfigured()) {
    throw new Error("Spotify Client ID fehlt. Bitte script.js konfigurieren.");
  }

  const expectedState = sessionStorage.getItem(AUTH_STATE_KEY);
  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(AUTH_STATE_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);

  if (!expectedState || returnedState !== expectedState) {
    throw new Error("Spotify Login konnte nicht verifiziert werden. Bitte erneut verbinden.");
  }

  if (!codeVerifier) {
    throw new Error("PKCE Code Verifier fehlt. Bitte erneut mit Spotify verbinden.");
  }

  setProgress(0, 1, "Spotify Token wird angefordert...");

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("Spotify Token konnte nicht angefordert werden. Prüfe Client ID und Redirect URI.");
  }

  saveToken(await response.json());
}

async function refreshSpotifyToken(storedToken) {
  if (!storedToken.refreshToken) {
    clearToken();
    throw new Error("Spotify Sitzung ist abgelaufen. Bitte erneut verbinden.");
  }

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: storedToken.refreshToken
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    clearToken();
    throw new Error("Spotify Sitzung konnte nicht erneuert werden. Bitte erneut verbinden.");
  }

  saveToken(await response.json());
  return getStoredToken();
}

function saveToken(tokenPayload) {
  const existing = getStoredToken();
  const token = {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token || existing?.refreshToken || null,
    expiresAt: Date.now() + Math.max(tokenPayload.expires_in - 60, 60) * 1000,
    tokenType: tokenPayload.token_type || "Bearer",
    scope: tokenPayload.scope || SPOTIFY_SCOPES.join(" ")
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

function getStoredToken() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY));
  } catch {
    clearToken();
    return null;
  }
}

function hasStoredToken() {
  return Boolean(getStoredToken()?.accessToken);
}

function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function getAccessToken() {
  const storedToken = getStoredToken();

  if (!storedToken?.accessToken) {
    throw new Error("Bitte zuerst mit Spotify verbinden.");
  }

  if (Date.now() >= storedToken.expiresAt) {
    const refreshed = await refreshSpotifyToken(storedToken);
    return refreshed.accessToken;
  }

  return storedToken.accessToken;
}

async function spotifyFetch(url, options = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      renderLoggedOut();
    }
    throw await createSpotifyError(response);
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}

async function createSpotifyError(response) {
  const retryAfter = response.headers.get("Retry-After");
  let apiMessage = "";

  try {
    const payload = await response.json();
    apiMessage = payload?.error?.message || payload?.error_description || "";
  } catch {
    apiMessage = "";
  }

  const messages = {
    401: "Deine Spotify-Sitzung ist abgelaufen. Bitte verbinde dich erneut.",
    403: "Spotify hat die Aktion abgelehnt. Queue und Starten benötigen Spotify Premium und die passenden Berechtigungen.",
    404: OPEN_SPOTIFY_MESSAGE,
    429: `Spotify limitiert gerade die Anfragen. Warte ${retryAfter ? `${retryAfter} Sekunden` : "kurz"} und versuche es erneut.`
  };

  return new Error(messages[response.status] || apiMessage || `Spotify API Fehler ${response.status}`);
}

async function loadSpotifyProfile() {
  const profile = await spotifyFetch("https://api.spotify.com/v1/me");
  renderLoggedIn();
  elements.profileLine.textContent = profile.display_name
    ? `${profile.display_name} (${profile.id})`
    : profile.id;
  setProgress(1, 1, "Spotify Profil erfolgreich geladen.");
}

async function refreshPersonalTasteProfile({ forceRefresh = false } = {}) {
  if (!elements.useSpotifyTasteCheckbox.checked || !hasStoredToken()) {
    personalTasteProfile = createEmptyTasteProfile();
    updatePlanPreview();
    return;
  }

  if (forceRefresh) {
    clearTasteProfileCache();
  }

  const cachedProfile = !forceRefresh ? loadCachedTasteProfile() : null;
  if (cachedProfile && !isTasteProfileCacheStale(cachedProfile)) {
    personalTasteProfile = cachedProfile;
    updatePlanPreview();
    return;
  }

  elements.tasteMessage.hidden = false;
  elements.tasteMessage.className = "message";
  elements.tasteMessage.textContent = "Spotify-Geschmack wird geladen...";

  const missingScopes = getMissingTasteScopes();
  const [topTracks, likedTracks, recentlyPlayed] = await Promise.all([
    spotifyFetchOptional("https://api.spotify.com/v1/me/top/tracks?limit=30&time_range=medium_term"),
    spotifyFetchOptional("https://api.spotify.com/v1/me/tracks?limit=30"),
    spotifyFetchOptional("https://api.spotify.com/v1/me/player/recently-played?limit=30")
  ]);
  const playlistResult = await loadPlaylistTasteTracks();
  const rawTracks = [
    ...extractTasteTracks(topTracks.data?.items || [], "top", 105),
    ...extractTasteTracks((likedTracks.data?.items || []).map((item) => item.track), "liked", 90),
    ...extractTasteTracks((recentlyPlayed.data?.items || []).map((item) => item.track), "recent", 62),
    ...playlistResult.rawTracks
  ];
  const stats = {
    topTracksLoaded: topTracks.data?.items?.length || 0,
    likedTracksLoaded: likedTracks.data?.items?.length || 0,
    recentlyPlayedLoaded: recentlyPlayed.data?.items?.length || 0,
    playlistTracksLoaded: playlistResult.trackCount,
    playlistsScanned: playlistResult.playlistsScanned,
    personalTracksAvailable: 0,
    sourceStatuses: {
      top: topTracks.status,
      liked: likedTracks.status,
      recent: recentlyPlayed.status,
      playlist: playlistResult.status
    },
    missingScopes
  };

  if (!rawTracks.length) {
    personalTasteProfile = createEmptyTasteProfile();
    personalTasteProfile.unavailableReason = [topTracks, likedTracks, recentlyPlayed].some((result) => result.status === 403)
      ? "Spotify-Geschmack ist noch nicht verfügbar. Verbinde dich ggf. neu, damit die zusätzlichen Berechtigungen aktiv werden."
      : "Spotify-Geschmack ist aktuell nicht verfügbar. Lokale Jogging-Songs bleiben aktiv.";
    personalTasteProfile.stats = stats;
    if (missingScopes.length || playlistResult.status === 403) {
      personalTasteProfile.unavailableReason = "Bitte einmal abmelden und neu mit Spotify verbinden, damit die neuen Spotify-Rechte aktiv werden.";
    }
    updatePlanPreview();
    return;
  }

  const artistGenresById = await loadArtistGenres(rawTracks);
  const tracks = buildPersonalTracks(rawTracks, artistGenresById);
  const { artistScores, genreScores } = buildTasteScoreMaps(tracks);

  personalTasteProfile = {
    loaded: tracks.length > 0,
    tracks,
    artistScores,
    genreScores,
    unavailableReason: "",
    loadedAt: Date.now(),
    loadedFromCache: false,
    rightsMessage: missingScopes.length
      ? "Bitte einmal abmelden und neu mit Spotify verbinden, damit die neuen Spotify-Rechte aktiv werden."
      : "",
    stats: {
      ...stats,
      personalTracksAvailable: tracks.length
    }
  };
  saveTasteProfileCache(personalTasteProfile);
  updatePlanPreview();
}

async function spotifyFetchOptional(url) {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (response.status === 401) {
      clearToken();
      renderLoggedOut();
      return { ok: false, status: 401, data: null };
    }

    if (!response.ok) {
      return { ok: false, status: response.status, data: null };
    }

    const contentType = response.headers.get("content-type") || "";
    return {
      ok: true,
      status: response.status,
      data: contentType.includes("application/json") ? await response.json() : null
    };
  } catch (error) {
    return { ok: false, status: 0, data: null, error };
  }
}

async function loadPlaylistTasteTracks() {
  const playlistsResult = await spotifyFetchOptional("https://api.spotify.com/v1/me/playlists?limit=20");

  if (!playlistsResult.ok) {
    return {
      rawTracks: [],
      trackCount: 0,
      playlistsScanned: 0,
      status: playlistsResult.status
    };
  }

  const playlists = (playlistsResult.data?.items || []).slice(0, MAX_PLAYLISTS_TO_SCAN);
  const rawTracks = [];
  let playlistsScanned = 0;

  for (let index = 0; index < playlists.length; index += 1) {
    const playlist = playlists[index];
    if (!playlist?.id) {
      continue;
    }

    const tracksResult = await spotifyFetchOptional(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=${MAX_TRACKS_PER_PLAYLIST}`
    );

    if (!tracksResult.ok) {
      continue;
    }

    playlistsScanned += 1;
    rawTracks.push(
      ...extractTasteTracks(
        (tracksResult.data?.items || []).map((item) => item.track),
        "playlist",
        Math.max(50, 78 - index * 2),
        playlist.name
      )
    );
  }

  return {
    rawTracks,
    trackCount: rawTracks.length,
    playlistsScanned,
    status: playlistsResult.status
  };
}

function extractTasteTracks(tracks, sourceType, baseTasteScore, playlistName = "") {
  return tracks
    .filter((track) => track?.name && track?.artists?.length)
    .map((track, index) => ({
      track,
      sourceType,
      playlistName,
      tasteScore: Math.max(15, Math.round(baseTasteScore - index * 0.6))
    }));
}

async function loadArtistGenres(rawTracks) {
  const artistIds = [
    ...new Set(
      rawTracks
        .flatMap((item) => item.track.artists || [])
        .map((artist) => artist.id)
        .filter(Boolean)
    )
  ];
  const genresById = new Map();

  for (let index = 0; index < artistIds.length; index += 50) {
    const ids = artistIds.slice(index, index + 50);
    const result = await spotifyFetchOptional(`https://api.spotify.com/v1/artists?ids=${ids.join(",")}`);
    for (const artist of result.data?.artists || []) {
      if (artist?.id) {
        genresById.set(artist.id, artist.genres || []);
      }
    }
  }

  return genresById;
}

function buildPersonalTracks(rawTracks, artistGenresById) {
  const tracksByKey = new Map();

  for (const item of rawTracks) {
    const track = item.track;
    const artist = track.artists[0];
    const artistGenres = [
      ...new Set((track.artists || []).flatMap((artistItem) => artistGenresById.get(artistItem.id) || []))
    ];
    const key = track.id || `${track.name}::${artist.name}`;
    const existing = tracksByKey.get(key);
    const mergedSourceTypes = new Set(existing?.sourceTypes || []);
    const mergedPlaylistNames = new Set(existing?.playlistNames || []);
    mergedSourceTypes.add(item.sourceType);
    if (item.playlistName) {
      mergedPlaylistNames.add(item.playlistName);
    }

    tracksByKey.set(key, {
      title: track.name,
      artist: artist.name,
      artistGenres,
      spotifyGenres: artistGenres,
      sourceTypes: [...mergedSourceTypes],
      playlistNames: [...mergedPlaylistNames],
      uri: track.uri,
      genre: inferAppGenre(artistGenres),
      estimatedDurationSeconds: Math.round((track.duration_ms || 210000) / 1000),
      tasteScore: Math.min(220, Math.max(existing?.tasteScore || 0, item.tasteScore) + (existing ? 28 : 0))
    });
  }

  return [...tracksByKey.values()];
}

function buildTasteScoreMaps(tracks) {
  const artistScores = new Map();
  const genreScores = new Map();

  for (const track of tracks) {
    addMapScore(artistScores, normalizeText(track.artist), track.tasteScore);
    addMapScore(genreScores, track.genre, track.tasteScore);
    for (const genre of track.artistGenres || []) {
      addMapScore(genreScores, normalizeText(genre), Math.round(track.tasteScore * 0.6));
    }
  }

  return { artistScores, genreScores };
}

function addMapScore(map, key, score) {
  if (!key) {
    return;
  }

  map.set(key, (map.get(key) || 0) + score);
}

function inferAppGenre(genres) {
  const genreText = genres.map(normalizeText).join(" ");

  if (containsAnyPhrase(genreText, ["edm", "dance", "house", "techno", "electronic"])) {
    return "edm";
  }

  if (containsAnyPhrase(genreText, ["hip hop", "rap", "trap", "drill"])) {
    return "rap";
  }

  if (containsAnyPhrase(genreText, ["pop", "synthpop", "dance pop"])) {
    return "pop";
  }

  return "mixed";
}

function isLikelyGermanTrack(track) {
  const titleText = normalizeText(track.title);
  const playlistText = (track.playlistNames || []).map(normalizeText).join(" ");
  const genreText = getGenreText(track);

  return (
    track.language === "de" ||
    isLikelyGermanArtist(track.artist) ||
    GERMAN_TITLE_WORDS.some((word) => containsWord(` ${titleText} `, word)) ||
    GERMAN_PLAYLIST_HINTS.some((hint) => playlistText.includes(normalizeText(hint))) ||
    containsAnyPhrase(genreText, ["german", "deutsch", "german hip hop", "german pop", "german rap"])
  );
}

function isLikelyGermanArtist(artistName) {
  const normalizedArtist = normalizeText(artistName);
  return [...GERMAN_ARTISTS].some(
    (artist) => normalizedArtist === artist || normalizedArtist.includes(artist) || artist.includes(normalizedArtist)
  );
}

function calculateLanguagePreferenceBonus(track, languagePreference) {
  if (languagePreference === "any") {
    return 0;
  }

  const isGermanTrack = isLikelyGermanTrack(track);

  if (languagePreference === "de") {
    if (isGermanTrack && (track.source === "personal" || track.sourceTypes?.length)) {
      return 80;
    }
    if (isGermanTrack) {
      return 60;
    }
    return -12;
  }

  if (languagePreference === "en") {
    return isGermanTrack ? -18 : 25;
  }

  return 0;
}

function createEmptyTasteProfile() {
  return {
    loaded: false,
    tracks: [],
    artistScores: new Map(),
    genreScores: new Map(),
    unavailableReason: "",
    rightsMessage: "",
    loadedAt: 0,
    loadedFromCache: false,
    stats: createEmptyTasteStats()
  };
}

function createEmptyTasteStats() {
  return {
    topTracksLoaded: 0,
    likedTracksLoaded: 0,
    recentlyPlayedLoaded: 0,
    playlistTracksLoaded: 0,
    playlistsScanned: 0,
    personalTracksAvailable: 0,
    sourceStatuses: {},
    missingScopes: []
  };
}

function saveTasteProfileCache(profile) {
  try {
    localStorage.setItem(
      TASTE_PROFILE_STORAGE_KEY,
      JSON.stringify({
        loaded: profile.loaded,
        tracks: profile.tracks,
        unavailableReason: profile.unavailableReason,
        rightsMessage: profile.rightsMessage,
        loadedAt: profile.loadedAt,
        stats: profile.stats
      })
    );
  } catch {
    // The app still works without a taste cache.
  }
}

function loadCachedTasteProfile() {
  try {
    const cached = JSON.parse(localStorage.getItem(TASTE_PROFILE_STORAGE_KEY));
    if (!cached?.tracks?.length || !cached.loadedAt) {
      return null;
    }

    const { artistScores, genreScores } = buildTasteScoreMaps(cached.tracks);
    return {
      loaded: true,
      tracks: cached.tracks,
      artistScores,
      genreScores,
      unavailableReason: cached.unavailableReason || "",
      rightsMessage: cached.rightsMessage || "",
      loadedAt: cached.loadedAt,
      loadedFromCache: true,
      stats: cached.stats || createEmptyTasteStats()
    };
  } catch {
    clearTasteProfileCache();
    return null;
  }
}

function clearTasteProfileCache() {
  localStorage.removeItem(TASTE_PROFILE_STORAGE_KEY);
}

function isTasteProfileCacheStale(profile) {
  return !profile.loadedAt || Date.now() - profile.loadedAt > TASTE_PROFILE_MAX_AGE_MS;
}

function getTasteProfileAgeText(profile = personalTasteProfile) {
  if (!profile.loadedAt) {
    return "noch nicht geladen";
  }

  const ageMinutes = Math.max(0, Math.round((Date.now() - profile.loadedAt) / 60000));
  if (ageMinutes < 2) {
    return "gerade eben";
  }
  if (ageMinutes < 60) {
    return `vor ${ageMinutes} Minuten`;
  }

  return `vor ${Math.round(ageMinutes / 60)} Stunden`;
}

function getMissingTasteScopes() {
  const grantedScopes = new Set((getStoredToken()?.scope || "").split(/\s+/).filter(Boolean));
  return REQUIRED_TASTE_SCOPES.filter((scope) => !grantedScopes.has(scope));
}

async function refreshDevices() {
  setBusy(true);
  setProgress(0, 1, "Spotify-Geräte werden geladen...");
  const data = await spotifyFetch("https://api.spotify.com/v1/me/player/devices");
  currentDevices = data.devices || [];
  renderDevices();
  setProgress(1, 1, `${currentDevices.length} Spotify-Gerät(e) gefunden.`);
  setBusy(false);
}

function renderDevices() {
  elements.deviceSelect.innerHTML = "";

  if (!currentDevices.length) {
    const option = document.createElement("option");
    option.textContent = "Kein Spotify-Gerät gefunden";
    option.value = "";
    elements.deviceSelect.append(option);
    elements.deviceSelect.disabled = true;
    elements.deviceMessage.textContent = OPEN_SPOTIFY_MESSAGE;
    elements.deviceMessage.className = "message warning";
    return;
  }

  currentDevices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id || "";
    option.textContent = `${device.name} - ${device.type}${device.is_active ? " - aktiv" : ""}`;
    if (device.is_active) {
      option.selected = true;
    }
    elements.deviceSelect.append(option);
  });

  if (!currentDevices.some((device) => device.is_active)) {
    elements.deviceSelect.selectedIndex = 0;
  }

  elements.deviceSelect.disabled = false;
  elements.deviceMessage.textContent =
    "Gerät bereit. Hinweis: Bestehende Songs in deiner Queue können noch vorhanden sein.";
  elements.deviceMessage.className = "message success";
}

function renderLoggedIn() {
  elements.authPanel.hidden = true;
  elements.appPanel.hidden = false;
  elements.spotifyOnly.forEach((element) => {
    element.hidden = false;
  });
}

function renderLoggedOut() {
  elements.authPanel.hidden = false;
  elements.appPanel.hidden = false;
  elements.spotifyOnly.forEach((element) => {
    element.hidden = true;
  });
}

function logout() {
  clearToken();
  clearTasteProfileCache();
  currentDevices = [];
  personalTasteProfile = createEmptyTasteProfile();
  elements.profileLine.textContent = "";
  renderLoggedOut();
  updatePlanPreview();
  setProgress(0, 1, "Von Spotify getrennt.");
  showToast("Spotify Verbindung wurde getrennt.", "success");
}

function updatePlanPreview() {
  currentPlan = buildPlan();
  renderPlan(currentPlan);
}

function regeneratePlan() {
  updatePlanPreview();
  showToast("Neue Song-Auswahl generiert.", "success");
}

async function handleTastePreferenceChange() {
  if (elements.useSpotifyTasteCheckbox.checked && hasStoredToken() && !personalTasteProfile.loaded) {
    await runSafely(refreshPersonalTasteProfile);
    return;
  }

  updatePlanPreview();
}

function createEmptyPlanStats() {
  return {
    totalSongs: 0,
    personalSongs: 0,
    fallbackSongs: 0,
    germanSongs: 0,
    personalCandidatesAfterFilter: 0,
    personalCandidatesTotal: 0,
    personalSongsUsed: 0,
    fallbackWasNeeded: false
  };
}

function updatePlanStats(plan) {
  const songs = plan.flatMap((phase) => phase.songs);
  const personalSongs = songs.filter((song) => song.source === "personal").length;
  const germanSongs = songs.filter(isLikelyGermanTrack).length;
  const personalCandidatesAfterFilter = countJoggingSuitablePersonalCandidates();

  lastPlanStats = {
    totalSongs: songs.length,
    personalSongs,
    fallbackSongs: songs.length - personalSongs,
    germanSongs,
    personalCandidatesAfterFilter,
    personalCandidatesTotal: personalTasteProfile.tracks.length,
    personalSongsUsed: personalSongs,
    fallbackWasNeeded:
      elements.useSpotifyTasteCheckbox.checked &&
      personalTasteProfile.loaded &&
      personalCandidatesAfterFilter > 0 &&
      songs.length > 0 &&
      personalSongs / songs.length < MIN_PERSONAL_SELECTION_SHARE
  };
}

function countJoggingSuitablePersonalCandidates() {
  if (!personalTasteProfile.loaded) {
    return 0;
  }

  const avoidSlowSongs = elements.avoidSlowSongsCheckbox.checked;
  const languagePreference = elements.languagePreferenceSelect.value;
  const usableKeys = new Set();
  const previousSkippedKeys = skippedPersonalRunningSongKeys;
  skippedPersonalRunningSongKeys = new Set(previousSkippedKeys);

  for (const phase of phaseDefinitions) {
    for (const candidate of getPersonalSongCandidatesForPhase(phase.key, new Set(), avoidSlowSongs, languagePreference)) {
      usableKeys.add(getSongKey(candidate));
    }
  }

  skippedPersonalRunningSongKeys = previousSkippedKeys;
  return usableKeys.size;
}

function buildPlan() {
  const durationMinutes = getDurationMinutes();
  const genre = elements.genreSelect.value;
  const languagePreference = elements.languagePreferenceSelect.value;
  const useSpotifyTaste = elements.useSpotifyTasteCheckbox.checked && personalTasteProfile.loaded;
  const avoidSlowSongs = elements.avoidSlowSongsCheckbox.checked;
  const usedSongKeys = new Set();
  skippedPersonalRunningSongKeys = new Set();
  lastPlanStats = createEmptyPlanStats();

  const plan = phaseDefinitions.map((phase) => {
    const targetSeconds = Math.round(durationMinutes * 60 * phase.share);
    const songs = selectSongsForPhase(
      phase.key,
      targetSeconds,
      genre,
      languagePreference,
      usedSongKeys,
      useSpotifyTaste,
      avoidSlowSongs
    );
    const selectedSeconds = sumSeconds(songs);

    songs.forEach((song) => {
      usedSongKeys.add(getSongKey(song));
    });

    return {
      ...phase,
      targetSeconds,
      selectedSeconds,
      songs
    };
  });

  updatePlanStats(plan);
  return plan;
}

function getDurationMinutes() {
  const rawValue = Number(elements.durationInput.value);
  if (!Number.isFinite(rawValue)) {
    return 30;
  }
  return Math.min(Math.max(rawValue, 10), 120);
}

function selectSongsForPhase(
  phaseKey,
  targetSeconds,
  selectedGenre,
  languagePreference,
  usedSongKeys,
  useSpotifyTaste,
  avoidSlowSongs
) {
  const localPool = songsByPhase[phaseKey]
    .filter((song) => !usedSongKeys.has(getSongKey(song)))
    .map((song) => scoreLocalSongCandidate(song, phaseKey, languagePreference));
  const personalPool = useSpotifyTaste
    ? getPersonalSongCandidatesForPhase(phaseKey, usedSongKeys, avoidSlowSongs, languagePreference)
    : [];
  const pool = [...personalPool, ...localPool];
  const preferred =
    selectedGenre === "mixed" ? pool : pool.filter((song) => matchesSelectedGenre(song, selectedGenre));
  const fallback =
    selectedGenre === "mixed" ? [] : pool.filter((song) => !matchesSelectedGenre(song, selectedGenre));
  return selectRandomSongsForTargetDuration(preferred, fallback, targetSeconds, useSpotifyTaste);
}

function selectRandomSongsForTargetDuration(preferredSongs, fallbackSongs, targetSeconds, preferPersonalSongs) {
  const recentSongKeys = getRecentSongKeys();
  const personalCandidates = [...preferredSongs, ...fallbackSongs].filter((song) => song.source === "personal");
  const availablePersonalSeconds = sumSeconds(personalCandidates);
  const personalTargetSeconds = preferPersonalSongs && personalCandidates.length
    ? Math.min(Math.round(targetSeconds * MIN_PERSONAL_SELECTION_SHARE), availablePersonalSeconds)
    : 0;
  // Shuffle each priority bucket: selected genre stays first, recent songs are only fallback within that bucket.
  const candidates = [
    ...weightedShuffleBySource(preferredSongs.filter((song) => !recentSongKeys.has(getSongKey(song))), preferPersonalSongs),
    ...weightedShuffleBySource(preferredSongs.filter((song) => recentSongKeys.has(getSongKey(song))), preferPersonalSongs),
    ...weightedShuffleBySource(fallbackSongs.filter((song) => !recentSongKeys.has(getSongKey(song))), preferPersonalSongs),
    ...weightedShuffleBySource(fallbackSongs.filter((song) => recentSongKeys.has(getSongKey(song))), preferPersonalSongs)
  ];
  const selected = [];
  const selectedSongKeys = new Set();
  let total = 0;
  let personalSeconds = 0;

  for (const song of candidates) {
    const songKey = getSongKey(song);
    if (selectedSongKeys.has(songKey)) {
      continue;
    }

    const currentDifference = Math.abs(targetSeconds - total);
    const nextDifference = Math.abs(targetSeconds - (total + song.estimatedDurationSeconds));

    if (
      selected.length > 0 &&
      total >= targetSeconds * 0.7 &&
      personalSeconds >= personalTargetSeconds &&
      nextDifference > currentDifference
    ) {
      break;
    }

    selected.push(song);
    selectedSongKeys.add(songKey);
    total += song.estimatedDurationSeconds;
    if (song.source === "personal") {
      personalSeconds += song.estimatedDurationSeconds;
    }

    if (total >= targetSeconds * 0.98 && personalSeconds >= personalTargetSeconds) {
      break;
    }
  }

  if (!selected.length && candidates.length) {
    selected.push(candidates[0]);
  }

  return selected;
}

function getPersonalSongCandidatesForPhase(phaseKey, usedSongKeys, avoidSlowSongs, languagePreference) {
  const strictness = avoidSlowSongs ? "strict" : "relaxed";

  return personalTasteProfile.tracks
    .filter((track) => !usedSongKeys.has(getSongKey(track)))
    .map((track) => scorePersonalSongCandidate(track, phaseKey, languagePreference))
    .filter((track) => {
      if (isClearlyBadRunningSong(track, phaseKey, avoidSlowSongs)) {
        skippedPersonalRunningSongKeys.add(getSongKey(track));
        return false;
      }

      const minimumFinalScore = PERSONAL_FINAL_SCORE_MIN[strictness][phaseKey];
      if (track.finalScore < minimumFinalScore) {
        skippedPersonalRunningSongKeys.add(getSongKey(track));
        return false;
      }

      return true;
    });
}

function scorePersonalSongCandidate(track, phaseKey, languagePreference) {
  const phasedTrack = { ...track, phase: phaseKey };
  const runningSuitabilityScore = calculateRunningSuitabilityScore(phasedTrack);
  const tasteScore = Math.min(260, (track.tasteScore || 0) + getArtistTasteBoost(track) + getGenreTasteBoost(track));
  const languageBonus = calculateLanguagePreferenceBonus(phasedTrack, languagePreference);

  return {
    ...phasedTrack,
    source: "personal",
    sourceLabel: "Spotify-Geschmack",
    runningSuitabilityScore,
    tasteScore,
    languageBonus,
    finalScore: tasteScore + runningSuitabilityScore + languageBonus
  };
}

function scoreLocalSongCandidate(song, phaseKey, languagePreference) {
  const phasedSong = { ...song, phase: phaseKey };
  const runningSuitabilityScore = calculateRunningSuitabilityScore(phasedSong);
  const tasteScore = getArtistTasteBoost(phasedSong) + getGenreTasteBoost(phasedSong);
  const languageBonus = calculateLanguagePreferenceBonus(phasedSong, languagePreference);

  return {
    ...phasedSong,
    source: "local",
    runningSuitabilityScore,
    tasteScore,
    languageBonus,
    finalScore: tasteScore + runningSuitabilityScore + languageBonus
  };
}

function matchesSelectedGenre(song, selectedGenre) {
  if (song.genre === selectedGenre) {
    return true;
  }

  return getGenreText(song).includes(selectedGenre);
}

function weightedShuffleSongs(songs) {
  return songs
    .map((song) => {
      const scoreWeight = Math.max(1, Math.min((song.finalScore || 0) / 35, 5));
      return {
        song,
        rank: Math.random() ** (1 / scoreWeight)
      };
    })
    .sort((left, right) => right.rank - left.rank)
    .map((entry) => entry.song);
}

function weightedShuffleBySource(songs, preferPersonalSongs) {
  if (!preferPersonalSongs) {
    return weightedShuffleSongs(songs);
  }

  return [
    ...weightedShuffleSongs(songs.filter((song) => song.source === "personal")),
    ...weightedShuffleSongs(songs.filter((song) => song.source !== "personal"))
  ];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function getSongKey(song) {
  return `${song.title}::${song.artist}`.toLowerCase();
}

function calculateRunningSuitabilityScore(track) {
  return clamp(calculateRunningSuitabilityRawScore(track), 0, 100);
}

function calculateRunningSuitabilityRawScore(track) {
  const titleText = ` ${normalizeText(track.title)} `;
  const genreText = getGenreText(track);
  let score = 20;

  if (containsAnyPhrase(genreText, ["edm", "dance", "house", "techno", "electronic"])) {
    score += 80;
  }
  if (containsAnyPhrase(genreText, ["hip hop", "rap", "trap", "drill"])) {
    score += 50;
  }
  if (containsAnyPhrase(genreText, ["pop", "synthpop", "dance pop"])) {
    score += 40;
  }

  for (const word of POSITIVE_RUNNING_TITLE_WORDS) {
    if (containsWord(titleText, word)) {
      score += ["run", "running", "power", "energy", "hype", "unstoppable"].includes(word) ? 55 : 35;
    }
  }

  if (track.phase === "push" || track.phase === "flow") {
    score += 30;
  }

  if (!hasSlowOrSadSignal(track)) {
    if (track.sourceTypes?.includes("top")) {
      score += 40;
    }
    if (track.sourceTypes?.includes("liked")) {
      score += 30;
    }
    if (track.sourceTypes?.includes("recent")) {
      score += 20;
    }
    if (track.sourceTypes?.includes("playlist")) {
      score += 25;
    }
  }

  for (const word of NEGATIVE_RUNNING_TITLE_WORDS) {
    if (containsWord(titleText, word)) {
      score -= ["sad", "cry", "crying", "tears", "lonely", "heartbreak", "sleep"].includes(word) ? 130 : 85;
    }
  }

  if (containsAnyPhrase(genreText, NEGATIVE_RUNNING_GENRE_WORDS)) {
    score -= containsAnyPhrase(genreText, ["sad", "ballad", "ambient", "sleep", "slowcore"]) ? 130 : 90;
  }

  if (looksLikeCooldownTrack(track) && track.phase !== "cooldown") {
    score -= 40;
  }

  if ((track.estimatedDurationSeconds || 0) > 360) {
    score -= 30;
  }

  return score;
}

function isClearlyBadRunningSong(track, phase, avoidSlowSongs = true) {
  const strictness = avoidSlowSongs ? "strict" : "relaxed";
  const score = calculateRunningSuitabilityScore({ ...track, phase });
  const titleText = ` ${normalizeText(track.title)} `;
  const genreText = getGenreText(track);
  const hasHardBadTitle = ["sad", "cry", "crying", "tears", "lonely", "heartbreak", "slow", "sleep", "baby doll"].some(
    (word) => containsWord(titleText, word)
  );
  const hasHardBadGenre = containsAnyPhrase(genreText, [
    "sad",
    "acoustic",
    "piano",
    "ballad",
    "ambient",
    "lo-fi",
    "lofi",
    "slowcore"
  ]);

  if (hasHardBadTitle || hasHardBadGenre) {
    const severeSadSignal =
      containsAnyPhrase(titleText, ["sad", "cry", "tears", "lonely", "heartbreak", "sleep"]) ||
      containsAnyPhrase(genreText, ["sad", "ballad", "ambient", "sleep", "slowcore"]);

    if (severeSadSignal) {
      return true;
    }

    return phase !== "cooldown" && avoidSlowSongs;
  }

  return score < RUNNING_SCORE_MIN[strictness][phase];
}

function looksLikeCooldownTrack(track) {
  const text = `${normalizeText(track.title)} ${getGenreText(track)}`;
  return containsAnyPhrase(text, ["chill", "acoustic", "piano", "ballad", "ambient", "lo-fi", "lofi", "sleep"]);
}

function hasSlowOrSadSignal(track) {
  const text = `${normalizeText(track.title)} ${getGenreText(track)}`;
  return containsAnyPhrase(text, [...NEGATIVE_RUNNING_TITLE_WORDS, ...NEGATIVE_RUNNING_GENRE_WORDS]);
}

function getArtistTasteBoost(song) {
  const artistScore = personalTasteProfile.artistScores.get(normalizeText(song.artist)) || 0;
  return Math.min(30, Math.round(artistScore * 0.2));
}

function getGenreTasteBoost(song) {
  const appGenreScore = personalTasteProfile.genreScores.get(song.genre) || 0;
  const artistGenreScore = (song.artistGenres || []).reduce(
    (sum, genre) => sum + (personalTasteProfile.genreScores.get(normalizeText(genre)) || 0),
    0
  );
  return Math.min(25, Math.round(appGenreScore * 0.15 + artistGenreScore * 0.04));
}

function getGenreText(track) {
  return [
    track.genre,
    ...(track.artistGenres || []),
    ...(track.spotifyGenres || [])
  ]
    .filter(Boolean)
    .map(normalizeText)
    .join(" ");
}

function containsAnyPhrase(text, phrases) {
  return phrases.some((phrase) => text.includes(normalizeText(phrase)));
}

function containsWord(text, word) {
  return new RegExp(`\\b${escapeRegExp(normalizeText(word))}\\b`).test(text);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRecentSongKeyList() {
  try {
    const storedKeys = JSON.parse(localStorage.getItem(RECENT_SONG_STORAGE_KEY));
    return Array.isArray(storedKeys) ? storedKeys.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function getRecentSongKeys() {
  return new Set(getRecentSongKeyList());
}

function rememberRecentlyUsedSongs(songs) {
  try {
    const nextKeys = [...new Set(songs.map(getSongKey))];
    const previousKeys = getRecentSongKeyList().filter((key) => !nextKeys.includes(key));
    const storedKeys = [...nextKeys, ...previousKeys].slice(0, RECENT_SONG_LIMIT);
    localStorage.setItem(RECENT_SONG_STORAGE_KEY, JSON.stringify(storedKeys));
  } catch {
    // localStorage is optional for variety; queueing must still work without it.
  }
}

function renderPlan(plan) {
  elements.phaseCards.innerHTML = "";
  const totalSongs = plan.reduce((sum, phase) => sum + phase.songs.length, 0);
  const totalSeconds = plan.reduce((sum, phase) => sum + phase.selectedSeconds, 0);
  elements.planSummary.textContent = `${totalSongs} Songs - ca. ${formatMinutes(totalSeconds)}`;
  renderTasteMessage();

  plan.forEach((phase) => {
    const card = document.createElement("article");
    card.className = "phase-card";

    const title = document.createElement("h3");
    title.textContent = phase.label;

    const meta = document.createElement("p");
    meta.className = "phase-meta";
    meta.textContent = `${phase.description} - Ziel ${formatMinutes(phase.targetSeconds)}, Auswahl ${formatMinutes(phase.selectedSeconds)}`;

    const list = document.createElement("ul");
    list.className = "song-list";

    phase.songs.forEach((song) => {
      const item = document.createElement("li");
      const songTitle = document.createElement("span");
      songTitle.className = "song-title";
      songTitle.textContent = song.title;

      const details = document.createElement("span");
      details.className = "song-details";
      details.textContent =
        song.source === "personal"
          ? `${song.artist} - Spotify-Geschmack · Jogging-Score ${song.runningSuitabilityScore}/100`
          : `${song.artist} - ${song.genre.toUpperCase()} - ${formatMinutes(song.estimatedDurationSeconds)}`;

      details.textContent = formatSongDetails(song);
      item.append(songTitle, details);
      list.append(item);
    });

    card.append(title, meta, list);
    elements.phaseCards.append(card);
  });
}

function renderLegacyTasteMessage() {
  const useSpotifyTaste = elements.useSpotifyTasteCheckbox.checked;

  if (!useSpotifyTaste || !hasStoredToken()) {
    elements.tasteMessage.hidden = true;
    elements.tasteMessage.textContent = "";
    return;
  }

  elements.tasteMessage.hidden = false;
  elements.tasteMessage.className = "message";

  if (personalTasteProfile.unavailableReason) {
    elements.tasteMessage.textContent = personalTasteProfile.unavailableReason;
    return;
  }

  if (!personalTasteProfile.loaded) {
    elements.tasteMessage.textContent = "Lokale Jogging-Songs werden verwendet, bis dein Spotify-Geschmack geladen ist.";
    return;
  }

  const skippedText = skippedPersonalRunningSongKeys.size
    ? ` ${skippedPersonalRunningSongKeys.size} persönliche Songs wurden übersprungen, weil sie zu ruhig oder traurig fürs Joggen wirkten.`
    : "";
  elements.tasteMessage.textContent = `Spotify-Geschmack aktiv: ${personalTasteProfile.tracks.length} Songs dienen als Inspiration.${skippedText}`;
}

function renderTasteMessage() {
  renderTasteStats();
  renderPersonalizationDebug();

  const useSpotifyTaste = elements.useSpotifyTasteCheckbox.checked;

  elements.tasteMessage.hidden = false;
  elements.tasteMessage.className = "message";

  if (!hasStoredToken()) {
    elements.tasteMessage.textContent = "Verbinde Spotify, um dein Taste-Profil aus Top Tracks, gelikten Songs, zuletzt gehörten Songs und Playlists zu laden.";
    return;
  }

  if (!useSpotifyTaste) {
    elements.tasteMessage.textContent = "Spotify-Geschmack ist deaktiviert. Die Vorschau nutzt lokale Jogging-Songs.";
    return;
  }

  if (personalTasteProfile.unavailableReason) {
    elements.tasteMessage.textContent = personalTasteProfile.unavailableReason;
    return;
  }

  if (!personalTasteProfile.loaded) {
    elements.tasteMessage.textContent = "Lokale Jogging-Songs werden verwendet, bis dein Spotify-Geschmack geladen ist.";
    return;
  }

  const messages = [
    `Taste-Profil geladen ${getTasteProfileAgeText()}.`,
    `${personalTasteProfile.tracks.length} persönliche Songs verfügbar.`,
    `${lastPlanStats.personalSongsUsed} persönliche Songs in dieser Auswahl.`
  ];

  if (personalTasteProfile.rightsMessage || getMissingTasteScopes().length) {
    messages.push("Bitte einmal abmelden und neu mit Spotify verbinden, damit die neuen Spotify-Rechte aktiv werden.");
  }

  if (isTasteProfileCacheStale(personalTasteProfile)) {
    messages.push("Der Cache ist älter als 24 Stunden. Klicke auf Spotify-Geschmack aktualisieren.");
  }

  if (skippedPersonalRunningSongKeys.size) {
    messages.push(`${skippedPersonalRunningSongKeys.size} persönliche Songs wurden übersprungen, weil sie zu ruhig oder traurig fürs Joggen wirkten.`);
  }

  if (lastPlanStats.fallbackWasNeeded) {
    messages.push("Es wurden zu wenige joggentaugliche persönliche Songs gefunden, deshalb wurden Fallback-Songs ergänzt.");
  }

  elements.tasteMessage.textContent = messages.join(" ");
}

function renderTasteStats() {
  const stats = personalTasteProfile.stats || createEmptyTasteStats();
  renderStatPills(elements.tasteStats, [
    { label: "Top Tracks geladen", value: stats.topTracksLoaded || 0 },
    { label: "Gelikte Songs geladen", value: stats.likedTracksLoaded || 0 },
    { label: "Zuletzt gehört geladen", value: stats.recentlyPlayedLoaded || 0 },
    { label: "Playlist-Songs geladen", value: stats.playlistTracksLoaded || 0 },
    { label: "Persönliche Songs verfügbar", value: stats.personalTracksAvailable || personalTasteProfile.tracks.length || 0 },
    { label: "Davon joggentauglich", value: lastPlanStats.personalCandidatesAfterFilter || 0 },
    { label: "Für diese Auswahl verwendet", value: lastPlanStats.personalSongsUsed || 0 },
    { label: "Cache", value: getTasteProfileAgeText() }
  ]);
}

function renderPersonalizationDebug() {
  const total = lastPlanStats.totalSongs || 0;
  renderStatPills(elements.personalizationDebug, [
    { label: "Spotify-Geschmack", value: elements.useSpotifyTasteCheckbox.checked ? "aktiv" : "inaktiv" },
    { label: "Taste-Profil geladen", value: personalTasteProfile.loaded ? "ja" : "nein" },
    { label: "Persönliche Tracks geladen", value: personalTasteProfile.tracks.length },
    { label: "Nach Jogging-Filter übrig", value: lastPlanStats.personalCandidatesAfterFilter || 0 },
    { label: "Persönliche Songs", value: `${lastPlanStats.personalSongs}/${total}` },
    { label: "Deutsche Songs", value: `${lastPlanStats.germanSongs}/${total}` },
    { label: "Fallback-Songs", value: `${lastPlanStats.fallbackSongs}/${total}` },
    { label: "Playlists gescannt", value: personalTasteProfile.stats?.playlistsScanned || 0 }
  ]);
}

function renderStatPills(container, stats) {
  container.innerHTML = "";
  for (const stat of stats) {
    const item = document.createElement("div");
    item.className = "stat-pill";
    const value = document.createElement("strong");
    value.textContent = String(stat.value);
    const label = document.createElement("span");
    label.textContent = stat.label;
    item.append(value, label);
    container.append(item);
  }
}

function formatSongDetails(song) {
  const parts = [song.artist];

  if (song.source === "personal") {
    parts.push("Spotify-Geschmack");
    parts.push(formatSourceTypes(song.sourceTypes));
  } else {
    parts.push("Lokaler Fallback");
    parts.push(song.genre.toUpperCase());
  }

  parts.push(`Jogging ${song.runningSuitabilityScore ?? calculateRunningSuitabilityScore(song)}`);
  parts.push(`Taste ${Math.round(song.tasteScore || 0)}`);

  if (song.languageBonus) {
    parts.push(song.languageBonus > 0 ? `Deutsch +${song.languageBonus}` : `Sprache ${song.languageBonus}`);
  }

  return parts.filter(Boolean).join(" · ");
}

function formatSourceTypes(sourceTypes = []) {
  const labels = [];
  if (sourceTypes.includes("top")) {
    labels.push("Spotify Top Track");
  }
  if (sourceTypes.includes("liked")) {
    labels.push("Gelikt");
  }
  if (sourceTypes.includes("recent")) {
    labels.push("Zuletzt gehört");
  }
  if (sourceTypes.includes("playlist")) {
    labels.push("Playlist");
  }
  return labels.join(" · ");
}

async function loadQueue(startNow) {
  if (!currentDevices.length) {
    await refreshDevices();
  }

  if (!currentDevices.length) {
    throw new Error(OPEN_SPOTIFY_MESSAGE);
  }

  const deviceId = elements.deviceSelect.value;
  const songs = currentPlan.flatMap((phase) => phase.songs);

  if (!songs.length) {
    throw new Error("Es wurden keine Songs für diese Session ausgewählt.");
  }

  setBusy(true);
  const resolvedTracks = await resolveTrackUris(songs);

  if (!resolvedTracks.length) {
    throw new Error("Spotify konnte keine der ausgewählten Songs finden.");
  }

  if (startNow) {
    await startFirstTrack(deviceId, resolvedTracks[0]);
    await queueTracks(deviceId, resolvedTracks.slice(1));
    rememberRecentlyUsedSongs(resolvedTracks);
    setProgress(resolvedTracks.length, resolvedTracks.length, "Jogging-Musik wurde gestartet und die restlichen Songs wurden in die Warteschlange geladen.");
    showToast("Jogging-Musik wurde gestartet und die restlichen Songs wurden in die Warteschlange geladen.", "success");
  } else {
    await queueTracks(deviceId, resolvedTracks);
    rememberRecentlyUsedSongs(resolvedTracks);
    setProgress(resolvedTracks.length, resolvedTracks.length, "Songs wurden in deine Spotify-Warteschlange geladen.");
    showToast("Songs wurden in deine Spotify-Warteschlange geladen.", "success");
  }

  setBusy(false);
}

async function resolveTrackUris(songs) {
  const resolvedTracks = [];
  const missingSongs = [];

  for (let index = 0; index < songs.length; index += 1) {
    const song = songs[index];
    setProgress(index, songs.length, `Song ${index + 1} von ${songs.length} wird gesucht: ${song.title}`);
    const track = song.uri ? song : await searchTrack(song);

    if (track?.uri) {
      resolvedTracks.push({ ...song, uri: track.uri, spotifyUrl: track.external_urls?.spotify || "" });
    } else {
      missingSongs.push(song);
    }
  }

  if (missingSongs.length) {
    showToast(`${missingSongs.length} Song(s) wurden bei Spotify nicht gefunden und übersprungen.`, "warning");
  }

  return resolvedTracks;
}

async function searchTrack(song) {
  const strictQuery = `track:"${song.title}" artist:"${song.artist}"`;
  const strictResult = await searchSpotify(strictQuery);

  if (strictResult) {
    return strictResult;
  }

  return searchSpotify(`${song.title} ${song.artist}`);
}

async function searchSpotify(query) {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "1"
  });
  const data = await spotifyFetch(`https://api.spotify.com/v1/search?${params.toString()}`);
  return data?.tracks?.items?.[0] || null;
}

async function startFirstTrack(deviceId, firstTrack) {
  const url = new URL("https://api.spotify.com/v1/me/player/play");
  if (deviceId) {
    url.searchParams.set("device_id", deviceId);
  }

  setProgress(0, 1, `Starte ${firstTrack.title}...`);
  await spotifyFetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uris: [firstTrack.uri] })
  });
  await wait(QUEUE_DELAY_MS);
}

async function queueTracks(deviceId, tracks) {
  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index];
    const url = new URL("https://api.spotify.com/v1/me/player/queue");
    url.searchParams.set("uri", track.uri);
    if (deviceId) {
      url.searchParams.set("device_id", deviceId);
    }

    setProgress(index, tracks.length, `Song ${index + 1} von ${tracks.length} wird geladen: ${track.title}`);
    await spotifyFetch(url.toString(), { method: "POST" });
    await wait(QUEUE_DELAY_MS);
  }
}

function setBusy(nextBusy) {
  isBusy = nextBusy;
  [
    elements.refreshDevicesButton,
    elements.regenerateButton,
    elements.queueButton,
    elements.startButton,
    elements.durationInput,
    elements.genreSelect,
    elements.languagePreferenceSelect,
    elements.useSpotifyTasteCheckbox,
    elements.avoidSlowSongsCheckbox,
    elements.loadTasteButton,
    elements.refreshTasteButton,
    elements.deviceSelect
  ].forEach((element) => {
    element.disabled = nextBusy || (element === elements.deviceSelect && !currentDevices.length);
  });
}

async function runSafely(task) {
  if (isBusy) {
    return;
  }

  try {
    await task();
  } catch (error) {
    setBusy(false);
    setProgress(0, 1, "Aktion fehlgeschlagen.");
    showToast(error.message || "Unbekannter Fehler", "error");
  }
}

function showToast(message, type = "success") {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 8000);
}

function setProgress(current, total, text) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(Math.max((current / safeTotal) * 100, 0), 100);
  elements.progressTitle.textContent = text.includes("fehlgeschlagen") ? "Fehler" : "Status";
  elements.progressText.textContent = text;
  elements.progressBar.style.width = `${percent}%`;
}

function cleanCallbackUrl() {
  const redirectPath = new URL(REDIRECT_URI).pathname;
  window.history.replaceState({}, document.title, redirectPath);
}

function formatMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")} min`;
}

function sumSeconds(songs) {
  return songs.reduce((sum, song) => sum + song.estimatedDurationSeconds, 0);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => possible[value % possible.length]).join("");
}

async function createCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
