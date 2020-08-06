
let mode = process.env.NODE_ENV;

export const environment = {
  isDevelopment: mode === "development",
  isProduction: mode === "production",
}
