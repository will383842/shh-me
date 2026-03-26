# Screenshot Specifications — Shh Me

## Required Screenshots (6 per locale, per device size)

| # | Screen | Caption EN | Caption FR | What to Show |
|---|---|---|---|---|
| 1 | Home J0 | "Someone is thinking about you" | "Quelqu'un pense a toi" | Community counter + narrative intro text + dark bg with lime accent |
| 2 | Shh Send | "Hold 3 seconds. Send your heartbeat." | "Maintiens 3 secondes. Envoie ton coeur." | Heart button pulsing + haptic ring animation + finger pressing |
| 3 | Photo Blur | "The photo unblurs day by day" | "La photo se defloute jour apres jour" | Side-by-side or stacked progression of 5 blur levels (J1 to J5) |
| 4 | Audio Message | "Hear their voice. Identity hidden." | "Entends sa voix. Identite cachee." | Audio waveform + "Le Souffle" filter chip + play button |
| 5 | Daily Clue | "Daily clues. Who is it?" | "Indices quotidiens. C'est qui ?" | Clue cards with morning question + afternoon hint |
| 6 | Reveal | "Connected" | "Connected" | Confetti animation + both profiles revealed + phone numbers exchanged |

## Device Sizes Required

### iOS (App Store Connect)

| Device | Resolution | Required |
|---|---|---|
| iPhone 15 Pro Max (6.7") | 1290 x 2796 px | Yes (mandatory) |
| iPhone 14 Pro Max (6.7") | 1284 x 2778 px | Yes (mandatory) |
| iPhone 8 Plus (5.5") | 1242 x 2208 px | Optional but recommended |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 px | Only if supporting iPad |

### Android (Google Play Console)

| Device | Resolution | Required |
|---|---|---|
| Phone (16:9) | 1080 x 1920 px | Yes (minimum) |
| Phone (19.5:9) | 1440 x 3120 px | Yes (recommended, Pixel 7 Pro) |
| Phone (20:9) | 1080 x 2400 px | Recommended |
| Tablet (7") | 1200 x 1920 px | Only if supporting tablet |
| Tablet (10") | 1600 x 2560 px | Only if supporting tablet |

## Design Guidelines

### Layout Template
```
+---------------------------+
|                           |
|   CAPTION TEXT (bold)     |  <- Top 20% of screenshot
|   Subtitle (light)       |
|                           |
+---------------------------+
|                           |
|                           |
|      APP SCREENSHOT       |  <- Center 70%, device frame optional
|      (actual screen)      |
|                           |
|                           |
+---------------------------+
|      Brand bar            |  <- Bottom 10%, Shh Me logo + tagline
+---------------------------+
```

### Color Palette
- Background: #1A1A1A (dark) or #DCFB4E (lime accent)
- Caption text: #FFFFFF (on dark) or #1A1A1A (on lime)
- Accent: #DCFB4E (lime green — brand primary)
- Secondary: #FF6B6B (heart/love red for screenshot 2)

### Typography
- Caption: Bold, 48-64px equivalent (readable at thumbnail size)
- Subtitle: Regular, 32-40px equivalent
- Font: Match app font (system or custom)

### Rules
- No text smaller than 32px equivalent (unreadable in search results)
- First screenshot is the most important — it appears in search results
- Show real app UI, not mockups (store policy)
- Device frames are optional but add professionalism
- Keep captions to 6 words max (scannable at thumbnail size)
- Use consistent visual style across all 6 screenshots
- Dark mode preferred (matches app default theme)

## Screenshot Production Workflow

1. **Capture**: Run app on simulator at target resolution, take screenshots
2. **Frame**: Add device frame using screenshots.pro or LaunchMatic
3. **Caption**: Add text overlay in Figma/Sketch template
4. **Localize**: Duplicate and swap text for FR versions
5. **Export**: PNG, sRGB color space, no transparency
6. **Validate**: Check readability at 230x498px (App Store thumbnail size)

## Feature Graphic (Android Only)

- Size: 1024 x 500 px
- Used at top of Google Play listing
- Should convey the app concept in one glance
- Suggested: Dark background, lime "Shh Me" logo, tagline "Someone has a secret about you", subtle heartbeat waveform

## App Icon Checklist

- iOS: 1024 x 1024 px, no transparency, no rounded corners (system adds them)
- Android: 512 x 512 px adaptive icon (foreground + background layers)
- Both: Recognizable at 29x29px (smallest iOS display size)
- Current: Using #DCFB4E (lime) background — strong contrast in store grids
