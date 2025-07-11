//constantes para la configuracion
const config = {
  port: import.meta.env.VITE_PORT,
  connection: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT, //la conexión a localhost o a un servidor
  paths: {
    assetsFolder: import.meta.env.VITE_DIR_ASSETS,
    uploads: import.meta.env.VITE_DIR_ASSETS + import.meta.env.VITE_DIR_UPLOADS,
    defaults: import.meta.env.VITE_DIR_ASSETS + import.meta.env.VITE_DIR_DEFAULT,
    gameCover_default: import.meta.env.VITE_DIR_ASSETS + import.meta.env.VITE_DIR_DEFAULT + '/' + import.meta.env.VITE_ASSET_GAMECOVER,
    pfp_default: import.meta.env.VITE_DIR_ASSETS + import.meta.env.VITE_DIR_DEFAULT + '/' + import.meta.env.VITE_ASSET_PFP,
    banner_default: import.meta.env.VITE_DIR_ASSETS + import.meta.env.VITE_DIR_DEFAULT + '/' + import.meta.env.VITE_ASSET_BANNER
  },
  api: {
    api: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API,
    assets: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_ASSETS,
    games: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_GAMES,
    platforms: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_PLATFORMS,
    savedatas: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_SAVEDATAS,
    comments: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_COMMENTS,
    users: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_USERS,
    info: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_INFO,
    auth: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_AUTH,
    tags: import.meta.env.VITE_DIR_GSDB + import.meta.env.VITE_PORT + import.meta.env.VITE_API + import.meta.env.VITE_API_TAGS
  }
};


//interceptor de axios para los mensajes de error de no autorizado, para enviar a login


export default config;