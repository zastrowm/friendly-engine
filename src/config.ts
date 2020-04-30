
declare var GLOBAL_CONFIG: any;

export let config = {
  isDevelopment() {
    return GLOBAL_CONFIG.mode == "development";
  },

  isProduction() {
    return GLOBAL_CONFIG.mode == "production";
  }
}

