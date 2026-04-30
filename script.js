"use strict";

const SPOTIFY_CLIENT_ID = "DEINE_SPOTIFY_CLIENT_ID_HIER_EINTRAGEN";
const REDIRECT_URI = "https://brqfwvb5sr-afk.github.io/jogging/";
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing"
];

const TOKEN_STORAGE_KEY = "jogging_queue_generator_spotify_token";
const CODE_VERIFIER_KEY = "jogging_queue_generator_code_verifier";
const AUTH_STATE_KEY = "jogging_queue_generator_auth_state";
const QUEUE_DELAY_MS = 320;
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
  { title: "Rather Be", artist: "Clean Bandit", phase: "warmup", genre: "edm", estimatedDurationSeconds: 227 },
  { title: "Wake Me Up", artist: "Avicii", phase: "warmup", genre: "edm", estimatedDurationSeconds: 247 },
  { title: "This Girl", artist: "Kungs", phase: "warmup", genre: "edm", estimatedDurationSeconds: 195 },
  { title: "Firestone", artist: "Kygo", phase: "warmup", genre: "edm", estimatedDurationSeconds: 273 },
  { title: "Good Life", artist: "Kanye West", phase: "warmup", genre: "rap", estimatedDurationSeconds: 207 },
  { title: "The Spins", artist: "Mac Miller", phase: "warmup", genre: "rap", estimatedDurationSeconds: 195 },
  { title: "Sunflower", artist: "Post Malone", phase: "warmup", genre: "rap", estimatedDurationSeconds: 158 },
  { title: "Can I Kick It?", artist: "A Tribe Called Quest", phase: "warmup", genre: "rap", estimatedDurationSeconds: 252 }
];

const flowSongs = [
  { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", phase: "flow", genre: "pop", estimatedDurationSeconds: 236 },
  { title: "Shut Up and Dance", artist: "WALK THE MOON", phase: "flow", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "Dynamite", artist: "BTS", phase: "flow", genre: "pop", estimatedDurationSeconds: 199 },
  { title: "As It Was", artist: "Harry Styles", phase: "flow", genre: "pop", estimatedDurationSeconds: 167 },
  { title: "Titanium", artist: "David Guetta", phase: "flow", genre: "edm", estimatedDurationSeconds: 245 },
  { title: "The Nights", artist: "Avicii", phase: "flow", genre: "edm", estimatedDurationSeconds: 176 },
  { title: "Lean On", artist: "Major Lazer", phase: "flow", genre: "edm", estimatedDurationSeconds: 176 },
  { title: "Where Are U Now", artist: "Skrillex", phase: "flow", genre: "edm", estimatedDurationSeconds: 250 },
  { title: "HUMBLE.", artist: "Kendrick Lamar", phase: "flow", genre: "rap", estimatedDurationSeconds: 177 },
  { title: "Power", artist: "Kanye West", phase: "flow", genre: "rap", estimatedDurationSeconds: 292 },
  { title: "Lose Yourself", artist: "Eminem", phase: "flow", genre: "rap", estimatedDurationSeconds: 326 },
  { title: "Alright", artist: "Kendrick Lamar", phase: "flow", genre: "rap", estimatedDurationSeconds: 219 }
];

const pushSongs = [
  { title: "Stronger", artist: "Kelly Clarkson", phase: "push", genre: "pop", estimatedDurationSeconds: 222 },
  { title: "Don't Start Now", artist: "Dua Lipa", phase: "push", genre: "pop", estimatedDurationSeconds: 183 },
  { title: "Uptown Funk", artist: "Mark Ronson", phase: "push", genre: "pop", estimatedDurationSeconds: 270 },
  { title: "Roar", artist: "Katy Perry", phase: "push", genre: "pop", estimatedDurationSeconds: 223 },
  { title: "Levels", artist: "Avicii", phase: "push", genre: "edm", estimatedDurationSeconds: 203 },
  { title: "Turn Down for What", artist: "DJ Snake", phase: "push", genre: "edm", estimatedDurationSeconds: 214 },
  { title: "Animals", artist: "Martin Garrix", phase: "push", genre: "edm", estimatedDurationSeconds: 304 },
  { title: "Greyhound", artist: "Swedish House Mafia", phase: "push", genre: "edm", estimatedDurationSeconds: 410 },
  { title: "Till I Collapse", artist: "Eminem", phase: "push", genre: "rap", estimatedDurationSeconds: 298 },
  { title: "DNA.", artist: "Kendrick Lamar", phase: "push", genre: "rap", estimatedDurationSeconds: 186 },
  { title: "SICKO MODE", artist: "Travis Scott", phase: "push", genre: "rap", estimatedDurationSeconds: 313 },
  { title: "X Gon' Give It To Ya", artist: "DMX", phase: "push", genre: "rap", estimatedDurationSeconds: 217 }
];

const cooldownSongs = [
  { title: "Golden", artist: "Harry Styles", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 209 },
  { title: "Adore You", artist: "Harry Styles", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 207 },
  { title: "Easy On Me", artist: "Adele", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 224 },
  { title: "Heat Waves", artist: "Glass Animals", phase: "cooldown", genre: "pop", estimatedDurationSeconds: 239 },
  { title: "Stole the Show", artist: "Kygo", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 223 },
  { title: "Stay", artist: "Zedd", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 210 },
  { title: "Ocean Drive", artist: "Duke Dumont", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 206 },
  { title: "Latch", artist: "Disclosure", phase: "cooldown", genre: "edm", estimatedDurationSeconds: 255 },
  { title: "Juice", artist: "Chance the Rapper", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 218 },
  { title: "Passin' Me By", artist: "The Pharcyde", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 303 },
  { title: "Crew", artist: "GoldLink", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 176 },
  { title: "Young, Wild & Free", artist: "Snoop Dogg", phase: "cooldown", genre: "rap", estimatedDurationSeconds: 207 }
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
  refreshDevicesButton: document.querySelector("#refreshDevicesButton"),
  deviceSelect: document.querySelector("#deviceSelect"),
  deviceMessage: document.querySelector("#deviceMessage"),
  phaseCards: document.querySelector("#phaseCards"),
  planSummary: document.querySelector("#planSummary"),
  queueButton: document.querySelector("#queueButton"),
  startButton: document.querySelector("#startButton"),
  progressTitle: document.querySelector("#progressTitle"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  toast: document.querySelector("#toast")
};

let currentDevices = [];
let currentPlan = [];
let isBusy = false;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  renderClientConfiguration();
  updatePlanPreview();

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
      await refreshDevices();
    });
    return;
  }

  if (hasStoredToken()) {
    await runSafely(async () => {
      await loadSpotifyProfile();
      await refreshDevices();
    });
  }
}

function bindEvents() {
  elements.loginButton.addEventListener("click", loginWithSpotify);
  elements.logoutButton.addEventListener("click", logout);
  elements.durationInput.addEventListener("input", updatePlanPreview);
  elements.genreSelect.addEventListener("change", updatePlanPreview);
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
}

function renderLoggedOut() {
  elements.authPanel.hidden = false;
  elements.appPanel.hidden = true;
}

function logout() {
  clearToken();
  currentDevices = [];
  elements.profileLine.textContent = "";
  renderLoggedOut();
  setProgress(0, 1, "Von Spotify getrennt.");
  showToast("Spotify Verbindung wurde getrennt.", "success");
}

function updatePlanPreview() {
  currentPlan = buildPlan();
  renderPlan(currentPlan);
}

function buildPlan() {
  const durationMinutes = getDurationMinutes();
  const genre = elements.genreSelect.value;

  return phaseDefinitions.map((phase) => {
    const targetSeconds = Math.round(durationMinutes * 60 * phase.share);
    const songs = selectSongsForPhase(phase.key, targetSeconds, genre);
    const selectedSeconds = sumSeconds(songs);

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

function selectSongsForPhase(phaseKey, targetSeconds, selectedGenre) {
  const pool = songsByPhase[phaseKey];
  const preferred =
    selectedGenre === "mixed" ? pool : pool.filter((song) => song.genre === selectedGenre);
  const fallback =
    selectedGenre === "mixed" ? [] : pool.filter((song) => song.genre !== selectedGenre);
  const candidates = [...preferred, ...fallback];
  const selected = [];
  let total = 0;

  for (const song of candidates) {
    const currentDifference = Math.abs(targetSeconds - total);
    const nextDifference = Math.abs(targetSeconds - (total + song.estimatedDurationSeconds));

    if (selected.length > 0 && total >= targetSeconds * 0.7 && nextDifference > currentDifference) {
      break;
    }

    selected.push(song);
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

function renderPlan(plan) {
  elements.phaseCards.innerHTML = "";
  const totalSongs = plan.reduce((sum, phase) => sum + phase.songs.length, 0);
  const totalSeconds = plan.reduce((sum, phase) => sum + phase.selectedSeconds, 0);
  elements.planSummary.textContent = `${totalSongs} Songs - ca. ${formatMinutes(totalSeconds)}`;

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
      details.textContent = `${song.artist} - ${song.genre.toUpperCase()} - ${formatMinutes(song.estimatedDurationSeconds)}`;

      item.append(songTitle, details);
      list.append(item);
    });

    card.append(title, meta, list);
    elements.phaseCards.append(card);
  });
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
    setProgress(resolvedTracks.length, resolvedTracks.length, "Jogging-Musik wurde gestartet und die restlichen Songs wurden in die Warteschlange geladen.");
    showToast("Jogging-Musik wurde gestartet und die restlichen Songs wurden in die Warteschlange geladen.", "success");
  } else {
    await queueTracks(deviceId, resolvedTracks);
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
    const track = await searchTrack(song);

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
    elements.queueButton,
    elements.startButton,
    elements.durationInput,
    elements.genreSelect,
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
