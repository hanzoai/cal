// The native Hanzo Base booking API. Cal's atoms set axios.defaults.baseURL to this
// via <Provider apiUrl>; the confirmation view fetches it directly. Override for
// local development with VITE_CAL_API (e.g. http://localhost:8090/v1/calendar).
export const calendarApi =
  import.meta.env.VITE_CAL_API || "https://api.hanzo.ai/v1/calendar";
