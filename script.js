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
  "user-read-recently-played"
];

const TOKEN_STORAGE_KEY = "jogging_queue_generator_spotify_token";
const CODE_VERIFIER_KEY = "jogging_queue_generator_code_verifier";
const AUTH_STATE_KEY = "jogging_queue_generator_auth_state";
const RECENT_SONG_STORAGE_KEY = "jogging_queue_generator_recent_songs";
const RECENT_SONG_LIMIT = 60;
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
  { title: "Day 'n' Nite", artist: "Kid Cudi", phase: "warmup", genre: "rap", estimatedDurationSeconds: 221 }
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
  { title: "Hypnotize", artist: "The Notorious B.I.G.", phase: "flow", genre: "rap", estimatedDurationSeconds: 230 }
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
  { title: "Started From the Bottom", artist: "Drake", phase: "push", genre: "rap", estimatedDurationSeconds: 173 }
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
  { title: "Best Day Ever", artist: "Mac Miller", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 167 }
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
  useSpotifyTasteCheckbox: document.querySelector("#useSpotifyTasteCheckbox"),
  avoidSlowSongsCheckbox: document.querySelector("#avoidSlowSongsCheckbox"),
  tasteMessage: document.querySelector("#tasteMessage"),
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
let skippedPersonalRunningSongs = 0;

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
  elements.useSpotifyTasteCheckbox.addEventListener("change", handleTastePreferenceChange);
  elements.avoidSlowSongsCheckbox.addEventListener("change", updatePlanPreview);
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

async function refreshPersonalTasteProfile() {
  if (!elements.useSpotifyTasteCheckbox.checked || !hasStoredToken()) {
    personalTasteProfile = createEmptyTasteProfile();
    updatePlanPreview();
    return;
  }

  elements.tasteMessage.hidden = false;
  elements.tasteMessage.className = "message";
  elements.tasteMessage.textContent = "Spotify-Geschmack wird geladen...";

  const [topTracks, likedTracks, recentlyPlayed] = await Promise.all([
    spotifyFetchOptional("https://api.spotify.com/v1/me/top/tracks?limit=30&time_range=medium_term"),
    spotifyFetchOptional("https://api.spotify.com/v1/me/tracks?limit=30"),
    spotifyFetchOptional("https://api.spotify.com/v1/me/player/recently-played?limit=30")
  ]);
  const rawTracks = [
    ...extractTasteTracks(topTracks.data?.items || [], "top", 55),
    ...extractTasteTracks((likedTracks.data?.items || []).map((item) => item.track), "liked", 42),
    ...extractTasteTracks((recentlyPlayed.data?.items || []).map((item) => item.track), "recent", 28)
  ];

  if (!rawTracks.length) {
    personalTasteProfile = createEmptyTasteProfile();
    personalTasteProfile.unavailableReason = [topTracks, likedTracks, recentlyPlayed].some((result) => result.status === 403)
      ? "Spotify-Geschmack ist noch nicht verfügbar. Verbinde dich ggf. neu, damit die zusätzlichen Berechtigungen aktiv werden."
      : "Spotify-Geschmack ist aktuell nicht verfügbar. Lokale Jogging-Songs bleiben aktiv.";
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
    unavailableReason: ""
  };
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

function extractTasteTracks(tracks, sourceType, baseTasteScore) {
  return tracks
    .filter((track) => track?.name && track?.artists?.length)
    .map((track, index) => ({
      track,
      sourceType,
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
    mergedSourceTypes.add(item.sourceType);

    tracksByKey.set(key, {
      title: track.name,
      artist: artist.name,
      artistGenres,
      spotifyGenres: artistGenres,
      sourceTypes: [...mergedSourceTypes],
      uri: track.uri,
      genre: inferAppGenre(artistGenres),
      estimatedDurationSeconds: Math.round((track.duration_ms || 210000) / 1000),
      tasteScore: Math.min(100, Math.max(existing?.tasteScore || 0, item.tasteScore) + (existing ? 12 : 0))
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

function createEmptyTasteProfile() {
  return {
    loaded: false,
    tracks: [],
    artistScores: new Map(),
    genreScores: new Map(),
    unavailableReason: ""
  };
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

function buildPlan() {
  const durationMinutes = getDurationMinutes();
  const genre = elements.genreSelect.value;
  const useSpotifyTaste = elements.useSpotifyTasteCheckbox.checked && personalTasteProfile.loaded;
  const avoidSlowSongs = elements.avoidSlowSongsCheckbox.checked;
  const usedSongKeys = new Set();
  skippedPersonalRunningSongs = 0;

  return phaseDefinitions.map((phase) => {
    const targetSeconds = Math.round(durationMinutes * 60 * phase.share);
    const songs = selectSongsForPhase(
      phase.key,
      targetSeconds,
      genre,
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
  usedSongKeys,
  useSpotifyTaste,
  avoidSlowSongs
) {
  const localPool = songsByPhase[phaseKey]
    .filter((song) => !usedSongKeys.has(getSongKey(song)))
    .map((song) => scoreLocalSongCandidate(song, phaseKey));
  const personalPool = useSpotifyTaste
    ? getPersonalSongCandidatesForPhase(phaseKey, usedSongKeys, avoidSlowSongs)
    : [];
  const pool = [...personalPool, ...localPool];
  const preferred =
    selectedGenre === "mixed" ? pool : pool.filter((song) => matchesSelectedGenre(song, selectedGenre));
  const fallback =
    selectedGenre === "mixed" ? [] : pool.filter((song) => !matchesSelectedGenre(song, selectedGenre));
  return selectRandomSongsForTargetDuration(preferred, fallback, targetSeconds);
}

function selectRandomSongsForTargetDuration(preferredSongs, fallbackSongs, targetSeconds) {
  const recentSongKeys = getRecentSongKeys();
  // Shuffle each priority bucket: selected genre stays first, recent songs are only fallback within that bucket.
  const candidates = [
    ...weightedShuffleSongs(preferredSongs.filter((song) => !recentSongKeys.has(getSongKey(song)))),
    ...weightedShuffleSongs(preferredSongs.filter((song) => recentSongKeys.has(getSongKey(song)))),
    ...weightedShuffleSongs(fallbackSongs.filter((song) => !recentSongKeys.has(getSongKey(song)))),
    ...weightedShuffleSongs(fallbackSongs.filter((song) => recentSongKeys.has(getSongKey(song))))
  ];
  const selected = [];
  const selectedSongKeys = new Set();
  let total = 0;

  for (const song of candidates) {
    const songKey = getSongKey(song);
    if (selectedSongKeys.has(songKey)) {
      continue;
    }

    const currentDifference = Math.abs(targetSeconds - total);
    const nextDifference = Math.abs(targetSeconds - (total + song.estimatedDurationSeconds));

    if (selected.length > 0 && total >= targetSeconds * 0.7 && nextDifference > currentDifference) {
      break;
    }

    selected.push(song);
    selectedSongKeys.add(songKey);
    total += song.estimatedDurationSeconds;

    if (total >= targetSeconds * 0.98) {
      break;
    }
  }

  if (!selected.length && candidates.length) {
    selected.push(candidates[0]);
  }

  return selected;
}

function getPersonalSongCandidatesForPhase(phaseKey, usedSongKeys, avoidSlowSongs) {
  const strictness = avoidSlowSongs ? "strict" : "relaxed";

  return personalTasteProfile.tracks
    .filter((track) => !usedSongKeys.has(getSongKey(track)))
    .map((track) => scorePersonalSongCandidate(track, phaseKey))
    .filter((track) => {
      if (isClearlyBadRunningSong(track, phaseKey, avoidSlowSongs)) {
        skippedPersonalRunningSongs += 1;
        return false;
      }

      const minimumFinalScore = PERSONAL_FINAL_SCORE_MIN[strictness][phaseKey];
      if (track.finalScore < minimumFinalScore) {
        skippedPersonalRunningSongs += 1;
        return false;
      }

      return true;
    });
}

function scorePersonalSongCandidate(track, phaseKey) {
  const phasedTrack = { ...track, phase: phaseKey };
  const runningSuitabilityScore = calculateRunningSuitabilityScore(phasedTrack);
  const tasteScore = Math.min(100, (track.tasteScore || 0) + getArtistTasteBoost(track) + getGenreTasteBoost(track));

  return {
    ...phasedTrack,
    source: "personal",
    sourceLabel: "Spotify-Geschmack",
    runningSuitabilityScore,
    tasteScore,
    finalScore: tasteScore + runningSuitabilityScore
  };
}

function scoreLocalSongCandidate(song, phaseKey) {
  const phasedSong = { ...song, phase: phaseKey };
  const runningSuitabilityScore = calculateRunningSuitabilityScore(phasedSong);
  const tasteScore = getArtistTasteBoost(phasedSong) + getGenreTasteBoost(phasedSong);

  return {
    ...phasedSong,
    source: "local",
    runningSuitabilityScore,
    tasteScore,
    finalScore: tasteScore + runningSuitabilityScore
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
    return avoidSlowSongs || phase !== "cooldown" || containsAnyPhrase(titleText, ["sad", "cry", "tears", "lonely", "heartbreak", "sleep"]);
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
  return String(value || "").toLowerCase();
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

      item.append(songTitle, details);
      list.append(item);
    });

    card.append(title, meta, list);
    elements.phaseCards.append(card);
  });
}

function renderTasteMessage() {
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

  const skippedText = skippedPersonalRunningSongs
    ? ` ${skippedPersonalRunningSongs} persönliche Songs wurden übersprungen, weil sie zu ruhig oder traurig fürs Joggen wirkten.`
    : "";
  elements.tasteMessage.textContent = `Spotify-Geschmack aktiv: ${personalTasteProfile.tracks.length} Songs dienen als Inspiration.${skippedText}`;
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
    elements.useSpotifyTasteCheckbox,
    elements.avoidSlowSongsCheckbox,
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
