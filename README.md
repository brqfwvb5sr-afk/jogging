# Jogging Queue Generator

Statische GitHub-Pages-Web-App, die mit Spotify verbunden wird und passende
Songs für eine Jogging-Session direkt in die Spotify-Warteschlange lädt.

URL nach Aktivierung von GitHub Pages:

```text
https://brqfwvb5sr-afk.github.io/jogging/
```

## Funktionen

- Spotify Login per Authorization Code with PKCE
- Kein Backend und kein Client Secret
- Spotify Profilabruf zur Login-Prüfung
- Abruf und Auswahl verfügbarer Spotify-Geräte
- Songauswahl nach Dauer, Phase und Genre
- Spotify Search API zum Auflösen der Track-URIs
- Queue-Modus: alle Tracks nacheinander in die Warteschlange laden
- Start-Modus: ersten Track starten, restliche Tracks nacheinander laden
- Verständliche Hinweise für 401, 403, 404 und 429

## 1. Spotify App erstellen

1. Öffne das Spotify Developer Dashboard:
   <https://developer.spotify.com/dashboard>
2. Melde dich mit deinem Spotify Account an.
3. Klicke auf **Create app**.
4. Trage einen Namen ein, z. B. `Jogging Queue Generator`.
5. Trage als Redirect URI exakt diese URL ein:

```text
https://brqfwvb5sr-afk.github.io/jogging/
```

6. Waehle bei den APIs die **Web API** aus.
7. Speichere die App.
8. Kopiere die **Client ID** aus den App-Einstellungen.

## 2. Spotify Client ID eintragen

Öffne `script.js` und ersetze diese Zeile:

```js
const SPOTIFY_CLIENT_ID = "DEINE_SPOTIFY_CLIENT_ID_HIER_EINTRAGEN";
```

durch deine echte Spotify Client ID:

```js
const SPOTIFY_CLIENT_ID = "deine-client-id";
```

Wichtig: Nur die Client ID gehört in den Frontend-Code. Ein Client Secret darf
niemals verwendet, in GitHub gespeichert oder in JavaScript ausgeliefert werden.

## 3. Benoetigte Spotify Scopes

Die App verwendet diese Scopes:

```text
user-read-private
user-read-playback-state
user-modify-playback-state
user-read-currently-playing
```

`user-read-currently-playing` ist optional, aber bereits eingetragen.

## 4. GitHub Pages aktivieren

1. Öffne das Repository `brqfwvb5sr-afk/jogging` auf GitHub.
2. Gehe zu **Settings** -> **Pages**.
3. Waehle bei **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/** root
4. Speichere die Einstellung.
5. Nach kurzer Zeit ist die App unter dieser URL erreichbar:

```text
https://brqfwvb5sr-afk.github.io/jogging/
```

## 5. App benutzen

1. Öffne die GitHub-Pages-URL.
2. Klicke auf **Mit Spotify verbinden**.
3. Erlaube die Spotify-Berechtigungen.
4. Öffne Spotify auf Handy, Desktop-App oder Webplayer.
5. Starte kurz einen Song, damit Spotify ein aktives Geraet meldet.
6. Klicke in der App auf **Geraete aktualisieren**.
7. Waehle Dauer und Musikstil.
8. Pruefe die Song-Vorschau.
9. Nutze **In Warteschlange laden** oder **Jetzt starten**.

Wenn kein Gerät gefunden wird, öffne Spotify auf deinem Handy oder PC und
starte kurz einen Song. Danach klicke erneut auf **Geräte aktualisieren**.

## 6. Wichtige Einschränkungen

- Spotify Queue und Playback-Steuerung funktionieren nur mit Spotify Premium.
- Es muss ein Spotify-Gerät verfügbar sein.
- Die bestehende Spotify-Warteschlange kann über die Web API nicht zuverlässig
  geleert werden. Vorhandene Songs können also noch in der Queue liegen.
- Die App lädt Queue-Requests absichtlich nacheinander mit einer kurzen Pause,
  damit Spotify nicht mit parallelen Requests belastet wird.

## 7. Technischer Aufbau

- `index.html` enthält die UI.
- `style.css` enthält das responsive Dark-Theme mit Spotify-grünen Akzenten.
- `script.js` enthält PKCE, Token-Verwaltung, Geräteabruf, Planung,
  Spotify-Suche, Start- und Queue-Logik.
- Es gibt kein Backend und keinen Node-Server im Betrieb.

## Sicherheit

Diese App nutzt Spotify Authorization Code with PKCE. Dadurch wird im Browser
kein Client Secret benötigt.

Nicht tun:

- Kein Client Secret in `script.js` eintragen
- Kein Client Secret in GitHub committen
- Kein Backend-Secret fuer GitHub Pages verwenden

Erlaubt:

- Die Spotify Client ID im Frontend verwenden
- Access Token im Browser speichern und bei Ablauf per Refresh Token erneuern
