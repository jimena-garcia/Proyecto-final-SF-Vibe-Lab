# Demo Video Script — Delivery 1

**Target duration:** 4:45 minutes maximum
**Date:** November 10, 2026
**Scope:** demonstrate the user stories marked as completed in the progress table in `README.md`. The demo uses only fictitious data and Stripe in test mode.

## Pre-recording setup

- Open an incognito window for the public site without signing in.
- Have the public Salesforce Site URL ready.
- Have internal panel access ready, without showing the username or password in the video.
- Use preloaded fictitious campaigns and donations.
- For the payment, use the test card `4242 4242 4242 4242`, a future expiration date, and a test CVC. Do not show Stripe keys, passwords, real email addresses, real RFCs, or sensitive identifiers.
- In the panel, have at least one donation requesting an invoice and one visible gateway notification.

## Script

| Time | Screen and action | What to say |
|---|---|---|
| 00:00–00:20 | **Introduction.** Show the public site home page in the incognito window. | “This is Delivery 1 of the SF Vibe Lab donation portal for Mexico Dreamin 2026. We begin as a visitor, without signing in. Everything shown uses fictitious data and Stripe test payments.” |
| 00:20–00:50 | **Public home page.** Scroll through the home page and show the featured campaign, recommended campaigns, and progress bars. | “The public site lets visitors discover several active campaigns, see their goals, and check their progress without creating an account. Visitors only see the public information needed to decide where to donate.” |
| 00:50–01:20 | **Campaign page.** Open a campaign, such as “Mexico Dreamin 2026”, and scroll to the goals section. Show the three cumulative goals, their amounts, and descriptions. | “When a campaign is selected, its project page opens. It shows the campaign’s progressive, cumulative goals, its progress, and the option to start a donation.” |
| 01:20–02:10 | **Donation form.** Click “Donar”, select the **Anónima** option, choose a suggested amount, and enter only the fictitious data requested by the form. Continue to Stripe Checkout. | “I will now register a donation before paying. I select the anonymous option so my name will not be published, and choose a suggested amount. When I continue, the donation is recorded as pending and Stripe receives a reference that links the payment to it.” |
| 02:10–02:45 | **Stripe Checkout.** Show that this is the test payment page. Enter `4242 4242 4242 4242`, a future expiration date, and a test CVC; then confirm the payment. | “This is Stripe Checkout in test mode. I am using the test card 4242 4242 4242 4242. Salesforce does not receive or store the card number, expiration date, or CVC.” |
| 02:45–03:15 | **Thank-you page.** Wait for the return to the site and show the appropriate thank-you state. Do not open email or show other donors’ data. | “After payment, Stripe returns me to the portal and the thank-you page appears. The site checks the session status and shows the appropriate message: the donation is not presented as confirmed until the payment gateway confirms it. This page does not expose other donors’ information.” |
| 03:15–03:35 | **Public recognition.** Return to the campaign page or reload it and open “Quiénes apoyan”. Show the entry as **“Donante anónimo”** with its amount, without a name, email, or RFC. | “In the public recognition list, an anonymous donation appears as ‘Donante anónimo’ with its amount. No personal data is published. This demonstrates the public visibility behavior; the receipt email remains pending, so HU-02 is not presented as fully completed.” |
| 03:35–04:00 | **Panel: Campaigns and goals.** Open the internal `/apex/PanelAdmin` link, sign in off-camera, and open **Campañas**. Open a campaign to show its goal and milestones. | “Next, we move to the internal panel, protected by Salesforce login. In Campaigns, coordination staff can view campaigns and manage their goal and milestones. These changes are reflected on the public site.” |
| 04:00–04:25 | **Panel: Donations.** Open **Donaciones** and show the status, amount, modality, and campaign. Activate the **Solicitan factura** filter. | “Treasury staff can view each donation’s status, amount, modality, and campaign. When ‘Solicitan factura’ is enabled, only invoice requests remain, with their tax details visible to authorized staff only. This recording uses fictitious records.” |
| 04:25–04:45 | **Panel: Gateway notifications.** Open **Avisos** or **Avisos de pasarela** and show a notification’s result, date, and reason. | “Finally, Gateway Notifications lets the team review received events and distinguish their result, date, and reason. This supports auditing confirmations and rejected notifications without manually changing the payment status.” |
| 04:45–05:00 | **Closing.** Return to a clean view of the panel or site without personal data. | “This demo used Stripe exclusively in test mode and fictitious data. One item remains open: R-01, because the receipt email does not reach the mailbox, although the system accepts receipt generation without a name. This issue will be documented and reviewed for the next delivery.” |

## Visible evidence checklist

- [x] Public site opened without login.
- [x] Campaign with progressive goals and progress.
- [x] Donation registered before opening the payment gateway.
- [x] Checkout with the test card `4242 4242 4242 4242`.
- [x] Return to the thank-you page.
- [x] Public recognition as “Donante anónimo”, showing only the amount.
- [x] Campaigns and goals panel.
- [x] Donations panel with the “Solicitan factura” filter.
- [x] Gateway Notifications panel.
- [x] Closing with test mode and R-01.

## Recording limits

Do not show passwords, Stripe keys, tokens, real email addresses, real RFCs, card numbers other than the test card, webhook payloads, or donors’ personal data. Do not present the receipt email as a verified feature: R-01 remains open.
