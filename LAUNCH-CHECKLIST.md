# SHH ME — MVP1 LAUNCH CHECKLIST
# 🟢 GO LAUNCH — Vérification Finale Passée

---

## ÉTAT DU CODE (vérifié 2026-03-26)

| Check | Résultat |
|---|---|
| Pint | ✅ pass |
| PHPStan L6 | ✅ 0 errors / 103 fichiers |
| Pest | ✅ 64 tests, 265 assertions, 0 failures |
| TypeScript | ✅ 0 errors |
| Git | ✅ clean, 16 commits sur main |
| Features | ✅ 24/24 |
| Sécurité | ✅ 21/21 |
| i18n EN+FR | ✅ 100% synchronisé |
| SEO + ASO | ✅ complet |

---

## J-42 — SOUMISSION APPLE

- [ ] Compte Apple Developer créé ($99/an)
- [ ] `eas build --platform ios --profile production`
- [ ] TestFlight upload via Transporter
- [ ] App Store Connect rempli :
  - [ ] Screenshots (5) en anglais
  - [ ] Vidéo preview (30s)
  - [ ] Description avec mots-clés ASO (voir `mobile/store/ios/en/metadata.json`)
  - [ ] Privacy Nutrition Label
  - [ ] Age rating 17+
  - [ ] Catégorie : Games / Entertainment
  - [ ] Sous-titre : "Secret Crush Game 🤫"
- [ ] Compte démo Apple Review :
  - Email : `demo@shh-me.com` / Pass : `ReviewPulse2026!`
  - 2 shh actifs pré-remplis
  - Notes reviewer dans "App Review Information"
- [ ] **Backend LIVE** pendant la review (VPS opérationnel)
- [ ] Submit for Review

## J-28 — TESTFLIGHT BETA

- [ ] 50 beta-testeurs invités
- [ ] Feedback collecté
- [ ] Bugs critiques corrigés
- [ ] Performance validée iPhone SE

## J-14 — PRÉ-LANCEMENT

- [ ] Son "shh…" déposé sur TikTok (@shhmeapp)
- [ ] 5 vidéos TikTok postées
- [ ] DNS Cloudflare configuré pour shh-me.com
- [ ] SSL actif
- [ ] Google Search Console : propriété vérifiée, sitemap soumis
- [ ] Pages légales publiées :
  - [ ] shh-me.com/privacy ✅ (code prêt)
  - [ ] shh-me.com/terms ✅ (code prêt)
  - [ ] shh-me.com/community ✅ (code prêt)
  - [ ] shh-me.com/contact ✅ (code prêt)
  - [ ] shh-me.com/delete-account ✅ (code prêt)

## J-7 — APPLE REVIEW

- [ ] App approuvée par Apple
- [ ] Si rejet → itérer et resoumettre
- [ ] Version Android prête (EAS Build Android)

## J-3 — SEED USERS

- [ ] 200 seed users par zone confirmés
- [ ] App installée via TestFlight
- [ ] Instructions : "Le J0 à 20h, envoie 3 shh"
- [ ] Groupe WhatsApp/Discord par zone

## J0 — LANCEMENT 🚀

### 20h00 — Shh Bomb
- [ ] App publiée sur l'App Store (release manuelle)
- [ ] 200 seed users × 3 shh = 600 shh en 30 min
- [ ] Ambassadeurs en position (tee-shirts fluo, QR codes)
- [ ] Admin connecté (Emergency Stop prêt)

### Vérifications J0
- [ ] Écran "En attente" narratif (pas de "0 shh")
- [ ] Invite post-shh fonctionne
- [ ] Devinette "C'est qui ?" → toujours "Pas cette fois 🤫"
- [ ] Page preview enrichie (audio teaser + timer)
- [ ] CTA post-reveal → SendShhScreen

### J+1 9h00
- [ ] Cron `clue:send-morning-questions` OK
- [ ] Push "🤫 Nouvelle question..." reçue

### J+1 12h-15h
- [ ] Cron `clue:send-afternoon-clues` OK
- [ ] Push "🤫 Ton indice..." reçue (heure aléatoire)
- [ ] 3 couches vérifiées (IA, DB, auto)

### J+1 22h00
- [ ] Échanges texte fonctionnent
- [ ] Photos se défloutent
- [ ] Push avec son "shh…"
- [ ] Sentry : 0 erreurs critiques

## J+1 à J+7 — MESURE KPIs

| KPI | Cible | J+1 | J+7 |
|---|---|---|---|
| Inscriptions | 200+ J0, 500+ J7 | ___ | ___ |
| K-factor | > 1.0 | ___ | ___ |
| D1 retention | > 40% | ___ | ___ |
| D7 retention | > 15% | ___ | ___ |
| Push open rate indices | > 30% | ___ | ___ |
| Question matin répondue | > 50% | ___ | ___ |
| Share rate reveal | > 10% | ___ | ___ |
| Audio envoi rate | > 30% | ___ | ___ |
| Puzzle completion | > 40% | ___ | ___ |
| Note App Store | ≥ 4.5 ★ | ___ | ___ |

## J+14 — SOUMISSION ANDROID

- [ ] Compte Google Play Developer ($25)
- [ ] `eas build --platform android --profile production` → AAB
- [ ] Google Play Console :
  - [ ] Data Safety rempli
  - [ ] Content Rating (IARC)
  - [ ] Store listing EN+FR (voir `mobile/store/android/`)
  - [ ] Feature graphic 1024×500px
- [ ] Internal Testing → 50 testeurs Android
- [ ] Bugs Android-specific corrigés

## J+28-42 — LANCEMENT ANDROID

- [ ] Open Testing → Production
- [ ] Google Play Review passé
- [ ] Deep links Android vérifiés (App Links)
- [ ] Push son personnalisé Android (notification channel)
- [ ] Shh Bomb Android (200 seed users × 3 shh)

## J+30 — BILAN MVP1 → GO/NO-GO MVP2

| KPI | Cible | Mesuré | GO ? |
|---|---|---|---|
| K-factor stable | > 1.0 | ___ | ☐ |
| D7 retention | > 15% | ___ | ☐ |
| D30 retention | > 10% | ___ | ☐ |
| Audio envoi rate | > 30% | ___ | ☐ |
| Puzzle completion | > 40% | ___ | ☐ |
| Reveals / semaine | > 50 | ___ | ☐ |
| Incidents sécurité | 0 | ___ | ☐ |

**Si tous les KPIs au minimum → 🟢 GO MVP2**
**Sinon → itérer MVP1 jusqu'à validation**

---

## CONTACTS URGENCE

| Contact | Usage |
|---|---|
| Apple Trust & Safety | Incident modération Apple |
| Google Play Policy | Incident modération Google |
| NCMEC CyberTipline | Signalement CSAM (obligatoire US) |
| CNIL | Incident données EU (notification 72h RGPD) |
| Admin on-call | Emergency Stop (admin.shh-me.com) |

---

## VPS PRODUCTION — SETUP

```
Vultr NYC — 4 vCPU, 8 GB RAM, 160 GB NVMe — ~$48/mois

Nginx + PHP-FPM 8.4 (JIT) + PostgreSQL 16 + PostGIS
Redis 7 × 2 (cache 6379 + persistent 6380)
FFmpeg + Laravel Horizon + Cron scheduler
SSL via Cloudflare + SSH key-only + UFW + Fail2ban
```

### Déploiement
```bash
./deploy.sh     # Zero-downtime deploy + smoke tests
./rollback.sh   # Rollback en < 2 min si problème
```

---

*Shh Me — Launch Checklist — MVP1 — 2026-03-26*
*Code: 16 commits, 64 tests, 103 PHP files, 50 TS files*
*Repo: https://github.com/will383842/shh-me*
