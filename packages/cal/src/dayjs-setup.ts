// Cal's atoms declare `sideEffects: false`, so the bundler tree-shakes away their
// vendored `dayjs.extend(utc/timezone)` side-effects — leaving `dayjs.tz`
// undefined and the Booker crashing on `dayjs.tz.guess()`. Re-extend the shared
// dayjs singleton here (deduped to a single instance via vite `resolve.dedupe`),
// imported for its side effect before any Booker code runs.
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
