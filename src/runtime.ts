
declare var GLOBAL_CONFIG: any;

declare var module;

export let config = {
  isDevelopment() {
    return GLOBAL_CONFIG.mode == "development";
  },

  isProduction() {
    return GLOBAL_CONFIG.mode == "production";
  },
}

let currentWindowError = null;

window.addEventListener('error', function(ev: ErrorEvent) {
  currentWindowError = ev;
})

export let development = {
  isReloadingDueToHmr() {
    return module.hot.status() == 'abort';
  },

  hasErrorOccurred() {
    return currentWindowError != null;
  }
}


