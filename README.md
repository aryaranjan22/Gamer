# paperweight

A window-hopping canvas game with worldwide endless/chaos rankings and a support page.

The static site lives in `public/`. Netlify serves `/api/*` through `netlify/server/index.mjs`, and shared records use Netlify Database with Drizzle. Database migrations live in `netlify/database/migrations/` and are applied by the platform during deployment.

## Creator setup

1. Invite your owner email from the project's Netlify Identity dashboard. Accept the invitation and set a password. Add the `admin` role to that user from the Identity dashboard.
2. Sign in at `/leaderboard.html`, then open `/settings.html`.
3. Save your Buy Me a Coffee URL and Razorpay payment link, support message and optional INR goal. No payment API credentials are required because checkout happens on the provider's hosted page.
4. Enable eligible international payments in the payment provider dashboard. Provider availability, accepted currencies, fees and exchange rates depend on that account. The support page includes reference currency estimates; it does not set the checkout exchange rate.
5. After checking a completed payment, add the supporter and actual settled INR amount in Creator settings. Obtain consent for the public name. Payment references stay private, and duplicate references cannot add the same payment twice. Remove refunded or mistaken entries from the recent contributions list.

Supporter rankings combine confirmed amounts by public name and country. They are manually confirmed by the creator; there is no automatic payment webhook or automatic refund reconciliation.

## Player rankings

Players create an account, confirm their email and save a display name on `/leaderboard.html`. Their optional country and display name are public. A new endless or chaos run is registered on the server. Its distance is submitted on restart, switching to puzzle mode, or following the game's community links. Closing the browser or navigating away by another route may leave that run unsubmitted. Only the best distance per account and mode counts.

The server verifies account sessions, associates each run with its account, rejects reused runs and checks duration and plausible distance. The game remains client-executed, so these are community rankings with basic validation, not authoritative competition scoring.

## Checks

Run `npm test` for validation checks. Local preview uses `netlify dev --port 8889`. Shared database reads need a deployed branch with its migrations applied. Netlify Identity requires the deployed Identity service for full account testing.
