import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: "https://fec27f2dfebdb1d7655fd3ba72084f47@o4508949788426240.ingest.us.sentry.io/4508949790195712",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
