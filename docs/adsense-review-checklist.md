# AdSense review checklist for 73-9.org

Updated: 2026-07-28

This checklist turns the July 28 AdSense preflight report into deploy and account-side checks. Keep evidence (screenshots or URLs) for each item before requesting another review.

## Code and content changes in this branch

- [ ] `google-adsense-account` metadata remains in the page head for ownership verification.
- [ ] `adsense_auto_ads_enabled` is absent or set to `false` during review, so the Google ad-serving loader is not requested.
- [ ] The home game publishes `73-9:game-ready` only after the loading screen has finished and the playable intro is visible.
- [ ] If ad loading is enabled later, the loader is limited to substantial English content routes and waits for the game-ready signal on `/`.
- [ ] No ads are enabled on sign-in, sign-up, account, history, leaderboard, error, contact, privacy, cookie, or terms screens.
- [ ] `/blog`, `/how-to-play`, `/how-it-works`, `/about`, `/cookies`, `/privacy-policy`, and `/blog/introducing-73-9` contain substantial original content.
- [ ] The blog includes complete strategy, result-reading, and historical benchmark articles.
- [ ] New blog slugs appear in `/sitemap.xml`.
- [ ] English content is original and not copied or lightly rewritten from another site.
- [ ] Historical claims in the Warriors article link to official NBA sources.

## Google AdSense account checks

### Eligibility and ownership

- [ ] The AdSense payee is at least 18 years old.
- [ ] The payee has only one AdSense account. Add 73-9.org to the existing account rather than opening another account.
- [ ] 73-9.org appears in **AdSense → Sites**.
- [ ] The domain is controlled by the same publisher and DNS can be edited.
- [ ] AdSense reports the site as connected through the meta tag, ads.txt, or the connection method selected in the account.
- [ ] `https://73-9.org/ads.txt` returns:
  `google.com, pub-8028656293202971, DIRECT, f08c47fec0942fa0`

### CMP and privacy messaging

- [ ] Open **AdSense → Privacy & messaging**.
- [ ] Create or select a GDPR message for the EEA, United Kingdom, and Switzerland.
- [ ] Use Google’s CMP or another Google-certified CMP integrated with the IAB TCF.
- [ ] Publish the message to 73-9.org.
- [ ] Test from an EEA/UK/Swiss location or with the provider’s preview/test mode.
- [ ] Confirm the message offers the choices required by the selected configuration.
- [ ] Confirm users can reopen privacy choices when the CMP configuration supports a revocation link.
- [ ] Keep `adsense_auto_ads_enabled=false` until the CMP is published and verified.
- [ ] When ads are enabled, configure AdSense page exclusions for auth, account, leaderboard, history, error, contact, and legal pages.

### Advertising behavior

- [ ] Do not click live ads on your own site.
- [ ] Do not ask friends, users, or contractors to click ads.
- [ ] Do not buy PTC, traffic-exchange, bot, pop-under, or incentivized traffic.
- [ ] Do not use spam email, automated comments, or misleading redirects to generate ad impressions.
- [ ] Use Google’s unmodified loader and official ad-unit code.
- [ ] Do not place ads inside buttons, game controls, dialogs, or areas likely to cause accidental clicks.
- [ ] Keep adequate space between ads and game controls.
- [ ] Do not show ads while the game displays only a loading state.
- [ ] Do not show ads on 404, error, thank-you, sign-in, or otherwise empty screens.
- [ ] Do not allow ads to cover content or navigation at desktop or mobile widths.
- [ ] Do not render off-screen, background, hidden, or out-of-context ads.

### Data and PII

- [ ] Page URLs do not contain email addresses, phone numbers, full names, or other PII.
- [ ] Analytics event names and parameters do not include PII.
- [ ] Ad requests and custom targeting values do not include PII.
- [ ] The site does not request precise device location. If that changes, add a clear disclosure and consent flow first.
- [ ] No custom code sets or modifies cookies on Google-owned domains.
- [ ] Sensitive categories (health, religion, sexual orientation, etc.) are not used to build ad audiences.
- [ ] Housing, employment, and credit advertising is not targeted by protected personal attributes.
- [ ] The privacy and cookie policies match the providers actually enabled in production.

## Deployment verification

- [ ] Run `pnpm format:check`.
- [ ] Run `pnpm build`.
- [ ] Open the production home page in a private window.
- [ ] Confirm the page source contains `google-adsense-account`.
- [ ] Confirm the Network panel does **not** request `adsbygoogle.js` while `adsense_auto_ads_enabled` is false.
- [ ] Confirm the loading screen transitions to the playable intro.
- [ ] Confirm the `<html>` element receives `data-game-ready="true"` after the intro appears.
- [ ] Check `/blog`, every local blog post, `/how-to-play`, `/how-it-works`, `/about`, `/cookies`, and `/privacy-policy`.
- [ ] Check mobile widths for overflow, overlapping content, and tap-target spacing.
- [ ] Validate `/sitemap.xml`, `/robots.txt`, and `/ads.txt`.
- [ ] Crawl the site and confirm no broken internal links or unexpected 404s.
- [ ] Re-run the AdSense preflight tool.
- [ ] Request review only after the production deployment and account-side CMP checks are complete.

## Re-enabling monetization after approval

Do not simply turn on sitewide Auto ads.

1. Publish and test the certified CMP.
2. Add manual ad placements only to substantial content routes or after the game-ready event.
3. Keep auth, account, leaderboard, history, error, contact, and legal routes excluded.
4. Start with one or two placements and verify content remains the focal point.
5. Set `adsense_auto_ads_enabled=true` only if the AdSense loader behavior and page exclusions have been tested for SPA navigation.
