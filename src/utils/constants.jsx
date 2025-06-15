export const PLATFORMS = [
  { id: 0, name: "Windows PC" },
  { id: 1, name: "PlayStation 4" },
  { id: 2, name: "Xbox 360" },
  { id: 3, name: "Nintendo Switch" },
  { id: 4, name: "Mac" },

  { id: 5, name: "PlayStation 5" },
  { id: 6, name: "Xbox One" },
  { id: 7, name: "Xbox Series X|S" },
  { id: 8, name: "PlayStation 3" },
  { id: 9, name: "PlayStation Vita" },

  { id: 10, name: "Nintendo 3DS" },
  { id: 11, name: "Nintendo DS" },
  { id: 12, name: "Wii" },
  { id: 13, name: "Wii U" },
  { id: 14, name: "Android" },

  { id: 15, name: "iOS" },
  { id: 16, name: "Linux" },
  { id: 17, name: "Google Stadia" },
  { id: 18, name: "Steam Deck" },
  { id: 19, name: "Arcade" },

  { id: 20, name: "PlayStation Portable (PSP)" },
  { id: 21, name: "GameCube" },
  { id: 22, name: "Game Boy Advance" },
  { id: 23, name: "Game Boy Color" },
  { id: 24, name: "Game Boy" },

  { id: 25, name: "Sega Genesis / Mega Drive" },
  { id: 26, name: "Sega Saturn" },
  { id: 27, name: "Sega Dreamcast" },
  { id: 28, name: "Neo Geo" },
  { id: 29, name: "Atari 2600" },

  { id: 30, name: "Atari Jaguar" },
  { id: 31, name: "Commodore 64" },
  { id: 32, name: "ZX Spectrum" },
  { id: 33, name: "Amiga" },
  { id: 34, name: "Nintendo Entertainment System (NES)" },

  { id: 35, name: "Super Nintendo Entertainment System (SNES)" },
  { id: 36, name: "PlayStation" },
  { id: 37, name: "TurboGrafx-16 / PC Engine" },
  { id: 38, name: "Nintendo 64" },
  { id: 39, name: "Philips CD-i" },

  { id: 40, name: "Ouya" },
  { id: 41, name: "Google Nexus Player" },
  { id: 42, name: "Amazon Luna" },
  { id: 43, name: "Facebook Instant Games" },
  { id: 44, name: "Magic Leap" },

  { id: 45, name: "Oculus Quest" },
  { id: 46, name: "Valve Index" },
  { id: 47, name: "HTC Vive" },
  { id: 48, name: "PlayStation VR" },
  { id: 49, name: "Apple Arcade" }
];


export function getPlatformName(id) {
  const platform = PLATFORMS.find(p => p.id === id);
  return platform ? platform.name : "null";
}
