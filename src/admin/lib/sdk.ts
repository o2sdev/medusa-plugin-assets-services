import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    //@ts-ignore
    type: import.meta.env.VITE_MEDUSA_AUTH_TYPE || __VITE_MEDUSA_AUTH_TYPE__,
  },
})
