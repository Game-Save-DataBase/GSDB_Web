export const PLATFORMS = [
  { id: 0, name: "Windows PC" },
  { id: 1, name: "PlayStation 4" },
  { id: 2, name: "Xbox 360" },
  { id: 3, name: "Nintendo Switch" },
  { id: 4, name: "Mac" }
];

export function getPlatformName(id){
    if(id> PLATFORMS.length-1 || id< PLATFORMS.length-1){
        return "null"
    }
    return PLATFORMS[id].name
}

