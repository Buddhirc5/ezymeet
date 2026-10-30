# Pan Asia EZY Meet

**Your Branch. Your Time.** A clickable web prototype of the *EZY Meet* appointment-banking feature
for the Pan Asia EZY mobile app. It is built for the iPhone 15 Pro Max (430 × 932) and matches the existing
EZY app UI (see `design-reference/`).

## Customer journey (fastest path: 4 taps)

1. **Log in**, then tap the **EZY Meet** widget or the EZY Meet tile on the dashboard.
2. **What do you need?** Pick a service. Each one shows its estimated service time (TAT). Tapping it moves on straight away.
3. **Smart recommendation.** Using your location, EZY Meet suggests the branch with the best mix of
   earliest slot, shortest expected wait and distance. Tap **Book Today, 11:30 AM** to take it.
   *Or* pick another branch and choose a date and time. A "Faster at …" banner suggests a better nearby branch.
4. **Confirm** in the bottom sheet. You get a confirmation with a QR code and reference, Priority Service,
   Add to Calendar, Directions and Call Branch.

Also included:
- **My Appointments:** upcoming and history, show QR, reschedule, cancel, directions, add to calendar.
- **Virtual Advisory:**
  - *Talk to an advisor now* (instant video call)
  - Scheduled video calls for Video KYC (with NIC / selfie / proof-of-address upload), loan, FD and
    investment, business and trade, card help, and relationship manager
  - In-call screen with camera preview, mute, and end call

### Services and channels

Each service is offered on the channel that suits it:
- **Branch only:** anything that needs cash, original documents, a signature, or a card or locker in person.
  This covers cash and cheques, foreign currency, TT and drafts, RTGS, pay orders, gift vouchers, letters,
  current and minor accounts, signature change, nominations, freeze and lien, closures, the safe deposit
  locker, debit cards, pawning and credit facilities.
- **Branch or video:** foreign currency accounts (PFCA/IIA/NRRA), personal details, dormant release,
  credit cards, EZY activation, fund recall, loans and leasing, T-bills, bonds and REPO, trade and business,
  and the relationship manager.
- **Video only:** Video KYC.
- **Not offered:** services the EZY app already handles on its own (savings and FD opening, FD upliftment,
  investment planner, cashback loan, cheque book, stop cheque, LKR transfers, standing orders) are left out.

> Prototype only. Branch data, slots and waiting times are generated demo data. Bookings are saved in the
> browser's localStorage.

## Branch portal

Branch staff use **`/admin/`** (`https://buddhirc5.github.io/ezymeet/admin/`). The customer app has no link to it.
- **Today:** the day's appointments with one-click Check in → Start → Complete, no-show, and customer details.
- **Check-in:** scan the customer's QR code (camera) or type the reference; issues a priority token.
- **Schedule:** a 7-day × 30-minute heat map of bookings.
- **Video Desk:** scheduled video calls (Video KYC uploads shown) and the live "talk now" queue.
- **Slots & Capacity:** set EZY Meet counters and block slots. Blocked slots disappear from the customer app.

The portal reads bookings made in the customer app in the same browser, alongside generated demo bookings.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

Open the printed URL. On a desktop it shows inside an iPhone frame; on a phone it runs full screen.
In Safari on the iPhone, use **Share → Add to Home Screen** for an app-like, full-screen experience.

## Deploy (GitHub Pages)

On every push to `main` or `sandeepa/nice-brown-5ounrb`, `.github/workflows/deploy.yml` builds the app
and publishes `dist/` to the `gh-pages` branch. To switch it on once:
**Settings → Pages → Build and deployment → Source: Deploy from a branch → `gh-pages` / `(root)`**.
GitHub Pages on a private repository needs a paid GitHub plan; on a free plan, make the repository public.

The live URL is `https://buddhirc5.github.io/ezymeet/`.

## Tech

React 19 + TypeScript + Vite, `lucide-react` icons, `qrcode.react`. There is no backend.

```
src/
  data/        services, branches, slot generation & smart recommendation
  screens/     Login, Home, MeetHub, BranchSelect, SlotSelect, VirtualBook,
               Confirmation, Appointments, VideoCall
  components/  shared UI (header, stepper, bottom sheet, slot picker, review sheet)
  assets/      EZY logo, Pan Asia Bank wordmark, imagery from the EZY Meet deck
```
