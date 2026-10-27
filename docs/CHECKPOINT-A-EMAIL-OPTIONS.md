# Checkpoint A — FREE ONLY OTP delivery, updated 2026-10-27

Constraint: owner explicitly requires free paths only, no domain, purchases, subscriptions, upgrades or paid operations. Resend Free approved; owner completed login and SMTP credential entry/save. Fresh dashboard read confirmed SMTP enabled on 2026-10-27. Host smtp.resend.com, port 465, username resend; sender onboarding@resend.dev. No secret was read. Actual owner OTP email and verification succeeded locally. Self-only QA is documented; public delivery through resend.dev is unavailable. This is not a reason to buy anything or stop independent game work.

## Verified blocker

The default free email service locked template editing. Owner-configured custom SMTP unlocked it. Both sign-in and signup templates now contain Token plus ConfirmationURL for compatibility, verified after reload. Real OTP succeeded for the authorized existing owner mailbox. Signup with another mailbox and general-public delivery remain unverified/unavailable under this self-test sender. Supabase's June 2026 change documents the default-template restriction. The production game deployment remains unchanged; authentication email templates are shared backend settings and now use the branded template with link fallback.

## Free paths only

| Option | Monthly service cost | Included sends | Tradeoff |
| --- | --- | --- | --- |
| Resend Free — approved self-test | $0 | 3,000/month, maximum 100/day | Without a domain, onboarding@resend.dev can send only to the Resend account owner. Prove OTP for that address only; never claim general public delivery. |
| Brevo Free — researched fallback, not connected | $0 | 300/day | Official docs describe sender replacement for free email domains. Provider approval/deliverability must be tested before any public-delivery claim; no account creation or setup performed. |

No paid provider/database/domain option is part of the active plan. Previous price research did not authorize a purchase and is superseded by the owner's free-only constraint.

## Concrete recommended setup

1. Use approved Resend Free for self-only QA without a domain. Keep general email delivery explicitly unverified; continue improving the game within free limits.
2. Create/connect the owner's Resend account. Owner completes any binding terms, login and credential-entry steps required. Never place a secret in chat, source, evidence or frontend environment variables.
3. Do not request or purchase a domain, add DNS records, or enable any paid option.
4. Set Supabase SMTP using provider credentials only in server-side dashboard configuration: smtp.resend.com, port 465, username resend; test From onboarding@resend.dev, name EMBERHOLD.
5. Update Magic Link/OTP AND new-user confirmation templates to include Token prominently; retain ConfirmationURL as a compatibility fallback for the previous candidate. Keep expiry/rate protection, disable provider link/open tracking for auth, retain the canonical Site URL and existing redirect allowlist.
6. Test actual owner OTP in an isolated candidate browser context, remembered/session-only storage, signout/relogin and automatic load/save without changing economy. New-user delivery/RLS requires an authorized second test address; no invented mailbox or unrelated player records.
7. Verify limits and delivery acknowledgement. Pause release if delivery fails; no automatic purchase, paid upgrade or overage enablement.

The game's canonical vercel.app URL stays unchanged. No domain purchase is planned or approved.

## Sources

- [Resend pricing](https://resend.com/pricing)
- [Resend SMTP with Supabase prerequisites and setup](https://resend.com/docs/send-with-supabase-smtp)
- [Brevo free/paid features](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans)
- [Brevo free-plan limits and branding](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [Supabase pricing](https://supabase.com/pricing)
- [Supabase free email-template change](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier)
- [Supabase SMTP testing restrictions](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase OTP configuration](https://supabase.com/docs/guides/auth/auth-email-passwordless)
