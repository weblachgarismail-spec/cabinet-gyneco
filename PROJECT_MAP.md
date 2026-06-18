# Cabinet Gynécologue - El Jadida

## [TECH_STACK] - INSTALLED ✅

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Framework | Next.js | 16.2.7 | ✓ Installed |
| Language | TypeScript | 5.8.3 | ✓ Installed |
| Styling | Tailwind CSS | 4.3.0 | ✓ Installed |
| ORM | Prisma | 6.19.3 | ✓ Installed |
| Database | SQLite | dev.db | ✓ Created |
| i18n + RTL | next-intl | 4.13.0 | ✓ Installed |
| Auth (admin) | NextAuth.js | 4.24.14 | ✓ Installed |
| Calendar | Custom component | — | ✓ Built |
| Maps | Google Maps embed (free) | — | ✓ Integrated |
| Deployment | Vercel (free tier) | — | Pending |

## [SYSTEM_FLOW]

```
Visitor → next-intl middleware detects browser language (FR/AR)
         → renders [locale]/page.tsx with RTL support
         
Booking Flow:
  GET  /api/slots?date=YYYY-MM-DD ← AJAX: returns available 30min slots (9-13, 15-19)
  POST /api/booking ← Form submission → Prisma create Appointment
         → 201: redirect to /booking/confirm?date=X&time=Y
         → 409: conflict error (double-booking prevention)

Admin Flow:
   /admin/login → NextAuth credentials → session (admin / admin123)
   /admin/appointments → fetch all Appointment → table with confirm/cancel/delete
   /admin/patients → list all PatientRecord → create from appointment or manual
   /admin/patients/[id] → patient detail: medical acts timeline, add act, update notes/next appointment

Admin API:
   GET/POST  /api/admin/patients            → list / create patient record
   GET/PATCH/DELETE /api/admin/patients/[id] → read / update / delete patient
   POST       /api/admin/patients/[id]/acts           → add medical act
   DELETE     /api/admin/patients/[id]/acts/[actId]   → delete medical act

Notifications:
  ما بعد الحجز → WhatsApp floating button (manual) + SMTP pending
```

## [ARCHITECTURE]

```
cabinet-gyneco/
├── src/
│   ├── app/
│   │   ├── [locale]/                    # i18n routes (fr, ar)
│   │   │   ├── page.tsx                 # Home: hero + features
│   │   │   ├── about/page.tsx           # About: diplomas, bio
│   │   │   ├── services/page.tsx        # Services: 6 cards grid
│   │   │   ├── booking/page.tsx         # Booking: 3-step wizard
│   │   │   ├── booking/confirm/page.tsx # Confirmation: static
│   │   │   ├── contact/page.tsx         # Contact: info + map
│   │   │   └── admin/
│   │   │       ├── login/page.tsx       # Login form
│   │   │       ├── appointments/        # Admin table + client actions
│   │   │       └── patients/            # Patient records + medical acts list/detail
│   │   ├── api/
│   │   │   ├── slots/route.ts           # GET available slots
│   │   │   ├── booking/route.ts         # POST create appointment
│   │   │   ├── admin/appointments/route.ts  # PATCH/DELETE
│   │   │   └── admin/patients/
│   │   │       ├── route.ts             # GET list / POST create
│   │   │       └── [id]/
│   │   │           ├── route.ts         # GET / PATCH / DELETE
│   │   │           └── acts/
│   │   │               ├── route.ts     # POST add act
│   │   │               └── [actId]/route.ts  # DELETE act
│   │   └── globals.css                  # Tailwind v4 + CSS vars
│   ├── components/
│   │   ├── booking/
│   │   │   ├── CalendarPicker.tsx       # Interactive month calendar
│   │   │   └── TimeSlotPicker.tsx       # 30min slot grid
│   │   └── layout/
│   │       ├── Header.tsx               # Nav + language switcher
│   │       ├── Footer.tsx               # Contact + emergency
│   │       └── WhatsAppButton.tsx       # Floating FAB
│   ├── i18n/
│   │   ├── routing.ts                   # Locale config
│   │   └── request.ts                   # next-intl request handler
│   ├── lib/
│   │   ├── prisma.ts                    # Singleton client
│   │   ├── booking.ts                   # Slot generation + conflict check
│   │   ├── auth.ts                      # NextAuth credentials config
│   │   └── logger.ts                    # Async fire-and-forget logger
│   └── middleware.ts                    # i18n routing proxy
├── messages/
│   ├── fr.json                          # French translations
│   └── ar.json                          # Arabic translations (RTL)
├── prisma/
│   ├── schema.prisma                    # Admin + Appointment + PatientRecord + MedicalAct
│   ├── seed.ts                          # Admin user seed
│   └── dev.db                           # SQLite database
└── .env                                 # DATABASE_URL + NEXTAUTH_SECRET
```

**Key design decisions:**
- Custom CalendarPicker (لا shadcn/ui - قللنا 70KB من الحجم)
- 4 models (Admin + Appointment + PatientRecord + MedicalAct) - بساطة مع إمكانية التوسع
- Async logger مع queueMicrotask - لا إعاقة
- SQLite للتطوير المحلي، جاهز للترقية لـ PostgreSQL

## [ORPHANS & PENDING]

- [x] **Node.js 24.16.0** مثبت
- [x] **Prisma DB + Seed** (admin / admin123)
- [ ] **Deploy to Vercel** - إنشاء حساب Vercel وربط المشروع
- [ ] **نصوص المحتوى الطبي** - استبدال [Nom] باسم الطبيبة الحقيقي
- [ ] **صور العيادة** - صور حقيقية (privacy first: no patient photos)
- [ ] **SMTP** - تكوين Resend أو SendGrid لإيميلات التأكيد
- [ ] **WhatsApp API** - تفعيل Business API للإشعارات التلقائية
- [ ] **اختبار RTL كامل** - التحقق من Arabic typography والأيقونات
- [ ] **Domain** - domaine.ma + hébergement local (اختياري)
- [ ] **SEO** - إضافة Google Search Console + analytics
