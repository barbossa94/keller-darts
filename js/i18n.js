// German / English. English text is the key; German comes from the table below.
// t('Hello {name}', { name }) fills placeholders. Missing German entries fall back to English.
const DE = {
  // App + nav
  'Basement': 'Keller',
  'Basement Darts': 'Keller Darts',
  'Home': 'Start',
  'Leaderboard': 'Rangliste',
  'Players': 'Spieler',
  'Settings': 'Einstellungen',

  // Home
  '{n} games played down here': '{n} Spiele hier unten gespielt',
  'Step up<br>to the <span>oche</span>': 'Ran an<br>die <span>Linie</span>',
  'Resume game': 'Spiel fortsetzen',
  'New 301': 'Neues 301',
  'New 301 game': 'Neues 301-Spiel',
  '+ Player': '+ Spieler',
  'Top of the basement': 'Die Besten im Keller',
  'Full leaderboard': 'Ganze Rangliste',
  'Play a game and the rankings show up here.': 'Spielt eine Runde, dann erscheint hier die Rangliste.',
  'Hall of Fame': 'Ruhmeshalle',
  'Max 3-dart score': 'Max. 3-Dart-Score',
  'Highest checkout': 'Höchstes Finish',
  'Best game average': 'Bester Spielschnitt',
  'Most 180s': 'Meiste 180er',
  'Longest win streak': 'Längste Siegesserie',
  'Nobody yet. Be the first.': 'Noch niemand. Sei der Erste.',
  'Rookie': 'Neuling',

  // Players
  '+ New player': '+ Neuer Spieler',
  'Add player': 'Spieler hinzufügen',
  'New player': 'Neuer Spieler',
  'Edit player': 'Spieler bearbeiten',
  'No photo yet': 'Noch kein Foto',
  '📷 Take photo': '📷 Foto machen',
  '📷 Retake': '📷 Neues Foto',
  'Snap': 'Auslösen',
  'Flip camera': 'Kamera wechseln',
  'Choose image': 'Bild wählen',
  'Name': 'Name',
  'e.g. Martin': 'z. B. Martin',
  'Nickname (optional)': 'Spitzname (optional)',
  'e.g. The Bull': 'z. B. Der Bulle',
  'Colour': 'Farbe',
  'Archive': 'Archivieren',
  'Restore': 'Wiederherstellen',
  'Cancel': 'Abbrechen',
  'Save': 'Speichern',
  'Camera not available. Use "Choose image" instead.': 'Kamera nicht verfügbar. Nimm stattdessen "Bild wählen".',
  'Archived. Stats are kept.': 'Archiviert. Die Statistik bleibt.',
  'Restored': 'Wiederhergestellt',
  'Give the player a name': 'Gib dem Spieler einen Namen',

  // Profile
  'Player not found': 'Spieler nicht gefunden',
  'Back': 'Zurück',
  'Joined {date}': 'Dabei seit {date}',
  ' · archived': ' · archiviert',
  'Play 301': '301 spielen',
  'Rating': 'Wertung',
  '3-dart avg': '3-Dart-Schnitt',
  'Games': 'Spiele',
  'Wins': 'Siege',
  'Best checkout': 'Bestes Finish',
  'Best streak': 'Beste Serie',
  'Average per game': 'Schnitt pro Spiel',
  'House average: {avg}. Gold dots are wins.': 'Kellerschnitt: {avg}. Kupferne Punkte sind Siege.',
  'Head to head': 'Direkter Vergleich',
  'No opponents yet.': 'Noch keine Gegner.',
  'No games yet. Time to throw some darts.': 'Noch keine Spiele. Zeit für ein paar Pfeile.',
  'The chart appears after two games.': 'Das Diagramm erscheint nach zwei Spielen.',
  ' (won)': ' (gewonnen)',

  // Setup
  'Tap players in throwing order': 'Spieler in Wurfreihenfolge antippen',
  'Throwing order': 'Wurfreihenfolge',
  '🎲 Shuffle': '🎲 Mischen',
  'Nobody picked yet.': 'Noch niemand ausgewählt.',
  'Finish': 'Finish',
  'Straight out': 'Straight Out',
  'Double out': 'Double Out',
  'Legs to win': 'Legs zum Sieg',
  '1 leg': '1 Leg',
  '{n} legs': '{n} Legs',
  'Game on': 'Game on',
  'Game in progress': 'Spiel läuft noch',
  'There is an unfinished game. Starting a new one throws it away.': 'Es gibt ein unfertiges Spiel. Ein neues Spiel verwirft es.',
  'Start new': 'Neu starten',
  'Add your first player to get started': 'Leg zuerst einen Spieler an',

  // Play
  'No game running': 'Kein Spiel läuft',
  'Start a new 301 to get going.': 'Starte ein neues 301.',
  'New game': 'Neues Spiel',
  '☰ Menu': '☰ Menü',
  '↶ Undo': '↶ Zurück',
  'Leg {leg} · first to {n}': 'Leg {leg} · {n} zum Sieg',
  ' · double out': ' · Double Out',
  'Checkout': 'Finish',
  'Game avg': 'Spielschnitt',
  'Darts': 'Darts',
  'Legs': 'Legs',
  'Bust': 'Überworfen',
  '3-dart total': '3-Dart-Summe',
  'Dart by dart': 'Dart für Dart',
  'scored': 'geworfen',
  'Enter': 'OK',
  'No score': 'Null',
  'Checked out': 'Ausgecheckt',
  'Double': 'Double',
  'Triple': 'Triple',
  'Miss': 'Vorbei',
  'Bull': 'Bull',
  'Bust!': 'Überworfen!',
  'One hundred and eighty': 'Hundertachtzig',
  'Ton forty+': '140+',
  'Ton+': '100+',
  'Leg to {name}!': 'Leg an {name}!',
  '{score} is not possible with 3 darts': '{score} geht nicht mit 3 Darts',
  "{score} can't be finished on a double": '{score} lässt sich nicht mit einem Double beenden',
  'Checked out!': 'Ausgecheckt!',
  'How many darts did it take?': 'Mit wie vielen Darts?',
  'Last visit undone': 'Letzte Aufnahme zurückgenommen',
  'Winner': 'Sieger',
  'Max 3-dart': 'Max. 3 Darts',
  '🏆 New basement record': '🏆 Neuer Kellerrekord',
  '{label}: {value} by {name}': '{label}: {value} von {name}',
  '{n} darts': '{n} Darts',
  'avg': 'Schnitt',
  'Rematch': 'Revanche',
  'Game menu': 'Spielmenü',
  'Pause, back to home': 'Pause, zurück zum Start',
  'Abandon game': 'Spiel abbrechen',
  'Keep playing': 'Weiterspielen',
  'Abandon game?': 'Spiel abbrechen?',
  'This game will not count for the leaderboard.': 'Dieses Spiel zählt nicht für die Rangliste.',
  'Abandon': 'Abbrechen',

  // Leaderboard
  'All time': 'Gesamt',
  'Win %': 'Siege %',
  'Best out': 'Bestes Finish',
  '180s': '180er',
  'Player': 'Spieler',
  'How the rating works.': 'So funktioniert die Wertung.',
  'RATING_EXPLAIN': 'Die Wertung ist die faire Rangfolge. Jeder Spieler startet mit {k} "gedachten Legs" auf dem Kellerschnitt (gerade <b>{avg}</b>), die mit seinem echten 3-Dart-Schnitt gemischt werden. Ein einzelner Glücksabend bringt niemanden nach oben, und je mehr Legs du spielst, desto näher liegt deine Wertung an deinem echten Schnitt. Spieler mit weniger als {r} Legs sind Neulinge und stehen unter allen anderen, bis sie genug gespielt haben. {g} Spiele gezählt.',
  'No games yet': 'Noch keine Spiele',
  'Finish a game and the leaderboard fills up.': 'Spielt ein Spiel zu Ende, dann füllt sich die Rangliste.',

  // Settings
  'Sound': 'Ton',
  'On': 'An',
  'Off': 'Aus',
  'Language': 'Sprache',
  'Storage': 'Speicher',
  '{n} finished games are stored on this tablet.': '{n} fertige Spiele sind auf diesem Tablet gespeichert.',
  'Storage is marked as persistent.': 'Der Speicher ist als dauerhaft markiert.',
  'The browser has not marked storage as persistent, so make a backup now and then.': 'Der Browser hat den Speicher nicht als dauerhaft markiert. Mach ab und zu ein Backup.',
  'Backup': 'Backup',
  'Save everything (players, photos, games) to one file. Keep it somewhere safe, for example in cloud storage.': 'Speichert alles (Spieler, Fotos, Spiele) in einer Datei. Bewahre sie sicher auf, zum Beispiel in der Cloud.',
  'Download backup': 'Backup herunterladen',
  'Restore backup': 'Backup wiederherstellen',
  'Archived players': 'Archivierte Spieler',
  'None.': 'Keine.',
  'Open': 'Öffnen',
  'Recent games': 'Letzte Spiele',
  'None yet.': 'Noch keine.',
  '{date}: {n} players, {mode}': '{date}: {n} Spieler, {mode}',
  'first to {n}': '{n} Legs zum Sieg',
  'single leg': '1 Leg',
  ', double out': ', Double Out',
  'Delete all data': 'Alle Daten löschen',
  'Backup downloaded': 'Backup heruntergeladen',
  'Restore backup?': 'Backup wiederherstellen?',
  'This replaces all players and games on this tablet with the backup.': 'Das ersetzt alle Spieler und Spiele auf diesem Tablet durch das Backup.',
  'Restored {p} players and {g} games': '{p} Spieler und {g} Spiele wiederhergestellt',
  'Restore failed: {msg}': 'Wiederherstellen fehlgeschlagen: {msg}',
  'Not a Keller Darts backup': 'Das ist kein Keller-Darts-Backup',
  'Delete all data?': 'Alle Daten löschen?',
  'All players, photos and games are removed from this tablet. Download a backup first if you want to keep them.': 'Alle Spieler, Fotos und Spiele werden von diesem Tablet entfernt. Lade vorher ein Backup herunter, wenn du sie behalten willst.',
  'Delete everything': 'Alles löschen',
  'All data deleted': 'Alle Daten gelöscht',
  'OK': 'OK',
};

const KEY = 'kd-lang';
let lang = 'de';
try { lang = localStorage.getItem(KEY) || 'de'; } catch {}

export const getLang = () => lang;
export function setLang(l) {
  lang = l;
  try { localStorage.setItem(KEY, l); } catch {}
  document.documentElement.lang = l;
}
document.documentElement.lang = lang;

export function t(key, vars) {
  let s = lang === 'de' ? DE[key] ?? key : key;
  if (key === 'RATING_EXPLAIN' && lang !== 'de') s = EN_RATING;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

const EN_RATING = 'The rating is the fair ranking. Every player starts with {k} "virtual legs" at the house average (now <b>{avg}</b>), which get mixed with their real 3-dart average. One lucky night does not put a newcomer on top, and the more legs you play, the closer your rating gets to your real average. Players with fewer than {r} legs are Rookies and are ranked below everyone else until they have played enough. {g} games counted.';

export const locale = () => (lang === 'de' ? 'de-DE' : 'en-GB');
