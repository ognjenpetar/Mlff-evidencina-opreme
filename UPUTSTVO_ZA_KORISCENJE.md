# Uputstvo za Korišćenje - MLFF Equipment Tracking

**Verzija 5.0 - Enhanced Analytics Edition** | Orion E-mobility

Kompletan vodič za korišćenje aplikacije za evidenciju MLFF opreme.

---

## Sadržaj

1. [Početak Rada](#početak-rada)
2. [Upravljanje Lokacijama](#upravljanje-lokacijama)
3. [Upravljanje Opremom](#upravljanje-opremom)
4. [Bulk Operacije](#bulk-operacije)
5. [Napredna Pretraga](#napredna-pretraga)
6. [Notifikacije](#notifikacije)
7. [Dokumentacija](#dokumentacija)
8. [Servisna Istorija](#servisna-istorija)
9. [QR Kodovi](#qr-kodovi)
10. [Analitika i Dashboard](#analitika-i-dashboard)
11. [Mapa Lokacija](#mapa-lokacija)
12. [Autentifikacija](#autentifikacija)
13. [FAQ](#faq)

---

## Početak Rada

### Prvo Pokretanje (Admin)

1. Otvori aplikaciju: `https://ognjenpetar.github.io/Mlff-evidencina-opreme/`
2. Klikni **"Login"** dugme (Google ikona u header-u)
3. Prijavi se sa Google nalogom
4. Počni sa dodavanjem lokacija i opreme

### Pregled Opreme (Javnost)

1. Skeniraj QR kod na opremi telefonom
2. Automatski se otvara kompletan izveštaj
3. **Nije potrebna prijava za pregled!**

---

## Upravljanje Lokacijama

### Dodavanje Nove Lokacije

1. Na Dashboard-u klikni **"Dodaj lokaciju"** (+ ikona)
2. Popuni formu:
   - **Naziv:** Npr. "Portal Beograd-Niš KM 12"
   - **GPS koordinate:** Unesi latitude/longitude ili klikni na mapu
   - **Adresa:** Puna adresa lokacije
   - **Opis:** Dodatne informacije
   - **Fotografija:** Upload sliku lokacije (opciono, max 50MB)
3. Klikni **"Sačuvaj"**

### Izmena Lokacije

1. Klikni na lokaciju sa liste
2. Klikni **"Izmeni"** (olovka ikona)
3. Promeni podatke
4. Klikni **"Sačuvaj"**

### Brisanje Lokacije

1. Klikni na lokaciju
2. Klikni **"Obriši"** (korpa ikona)
3. Potvrdi brisanje

> ⚠️ **Pažnja:** Brisanje lokacije automatski briše i svu opremu na njoj!

---

## Upravljanje Opremom

### Dodavanje Nove Opreme

1. Otvori lokaciju
2. Klikni **"Dodaj opremu"**
3. Popuni formu:

**Osnovni Podaci:**
| Polje | Opis | Obavezno |
|-------|------|----------|
| Inventarski broj | Unikatan broj opreme | ✅ Da |
| Tip | VDX, VRX, Antena, Switch, TRC, TRM, itd. | ✅ Da |
| Status | Aktivna, Na servisu, Neispravna, Neaktivna, Povučena | ✅ Da |
| Sub-lokacija | Gentri ili Ormar | Ne |

**Tehnički Podaci:**
| Polje | Opis |
|-------|------|
| Proizvođač | Npr. "Siemens" |
| Model | Npr. "VDX-2000" |
| Serijski broj | Broj sa uređaja |
| IP Adresa | Za mrežne uređaje |
| MAC Adresa | Za mrežne uređaje |
| Koordinate (X/Y/Z) | Pozicija u cm |

**Datumi i Osobe:**
| Polje | Opis |
|-------|------|
| Datum instalacije | Kada je instaliran |
| Garancija ističe | Datum isteka garancije |
| Ime instalatera | Ko je instalirao |
| Ime testera | Ko je testirao |

**Dodatno:**
- **Fotografija:** Upload sliku uređaja (max 50MB)
- **Napomene:** Slobodan tekst

4. Klikni **"Sačuvaj"**

### Statusi Opreme

| Status | Opis | Boja |
|--------|------|------|
| Aktivna | Oprema radi normalno | Zelena |
| Na servisu | Oprema je na popravci/održavanju | Žuta |
| Neispravna | Oprema ne funkcioniše | Crvena |
| Neaktivna | Privremeno van upotrebe | Siva |
| Povučena | Trajno uklonjena | Tamno siva |

### Izmena Opreme

1. Klikni na opremu
2. Klikni **"Izmeni"**
3. Promeni podatke
4. Klikni **"Sačuvaj"**

### Brisanje Opreme

1. Klikni na opremu
2. Klikni **"Obriši"**
3. Potvrdi brisanje

---

## Bulk Operacije

### Aktiviranje Bulk Mode-a

1. Na listi opreme klikni **"Bulk"** dugme
2. Pojavljuje se toolbar sa opcijama
3. Čekiraj opremu koju želiš da izabereš
4. Ili klikni **"Izaberi sve"**

### Masovna Promena Statusa

1. Aktiviraj bulk mode
2. Izaberi opremu (checkbox-ovi)
3. Klikni **"Promeni Status"**
4. Izaberi novi status iz dropdown-a
5. Potvrdi promenu

### Masovno Brisanje

1. Aktiviraj bulk mode
2. Izaberi opremu
3. Klikni **"Obriši"**
4. Potvrdi brisanje

### Izlaz iz Bulk Mode-a

Klikni **"Otkaži"** ili ponovo klikni **"Bulk"** dugme

---

## Napredna Pretraga

### Aktiviranje

Klikni **"Napredna pretraga"** dugme ispod search bar-a

### Dostupni Filteri

| Filter | Opis |
|--------|------|
| Lokacija | Filtriraj po lokaciji |
| Tip opreme | VDX, VRX, Antena, itd. |
| Status | Aktivna, Na servisu, itd. |
| Sub-lokacija | Gentri ili Ormar |
| Proizvođač | Filter po proizvođaču |
| Datum instalacije OD | Početni datum |
| Datum instalacije DO | Krajnji datum |
| Garancija ističe OD | Početni datum |
| Garancija ističe DO | Krajnji datum |

### Primena Filtera

1. Popuni željene filtere
2. Klikni **"Pretraži"**
3. Rezultati se prikazuju ispod

### Resetovanje Filtera

Klikni **"Resetuj"** da obrišeš sve filtere

---

## Notifikacije

### Pristup Notifikacijama

Klikni **zvono ikonu** u header-u (pored Login dugmeta)

### Tipovi Notifikacija

| Tip | Opis | Ikona |
|-----|------|-------|
| Garancija ističe | Oprema kojoj garancija ističe u narednih 30 dana | ⚠️ Žuta |
| Planirano održavanje | Oprema sa zakazanim servisom u narednih 7 dana | 🔧 Plava |
| Dugo na servisu | Oprema koja je na servisu duže od 14 dana | ⏰ Narandžasta |

### Badge Broj

Crveni badge na zvonu pokazuje ukupan broj aktivnih notifikacija

### Osvežavanje

Klikni **"Osveži"** unutar dropdown-a za ažuriranje liste

---

## Dokumentacija

### Upload Dokumenata

1. Otvori opremu
2. Scroll do sekcije **"Dokumentacija"**
3. Klikni **"Dodaj dokument"**
4. Izaberi PDF fajl (max 50MB)
5. Sačekaj upload (progress bar prikazuje napredak)

### Pregled Dokumenta

1. Hover nad dokumentom za preview
2. Klikni za otvaranje u novom tabu

### Brisanje Dokumenta

1. Klikni **"Obriši"** (korpa ikona) pored dokumenta
2. Potvrdi brisanje

---

## Servisna Istorija

### Dodavanje Servisa

1. Otvori opremu
2. Scroll do sekcije **"Servisna istorija"**
3. Klikni **"Dodaj servis"**
4. Popuni formu:

| Polje | Opis |
|-------|------|
| Tip servisa | Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija |
| Datum | Kada je servis obavljen |
| Opis | Šta je urađeno |
| Izvršilac | Ko je radio servis |
| Cena (€) | Koliko je koštalo |
| Sledeći servis | Datum sledećeg planiranog servisa |

5. Klikni **"Sačuvaj"**

---

## QR Kodovi

### Generisanje QR Koda

1. Otvori opremu
2. Klikni **"QR Kod"** dugme
3. QR kod se prikazuje u modal-u

### Opcije

- **Download:** Sačuvaj kao PNG sliku
- **Print:** Odštampaj QR kod
- **Copy URL:** Kopiraj link u clipboard

### Štampanje QR Kodova

1. Generiši QR kod
2. Klikni **"Print"**
3. Izaberi štampač
4. Zalepi QR kod na opremu (preporučene vodootporne nalepnice)

### Skeniranje QR Koda

1. Otvori telefon kameru ili QR scanner app
2. Skeniraj QR kod
3. Automatski se otvara kompletan izveštaj opreme
4. **Login nije potreban!**

---

## Analitika i Dashboard

### Pristup Analitici

Klikni **"Analitika"** tab u navigaciji

### Dashboard Filteri

| Filter | Opcije |
|--------|--------|
| Period | 7 dana, 30 dana, 90 dana, 365 dana |
| Lokacija | Sve lokacije ili specifična |
| Tip | Svi tipovi ili specifičan |
| Status | Svi statusi ili specifičan |

### Osnovni KPI-jevi

| KPI | Opis |
|-----|------|
| Ukupno Opreme | Broj svih komada opreme |
| Aktivna | Broj opreme sa statusom "Aktivna" |
| Na Servisu | Broj opreme trenutno na servisu |
| Troškovi Održavanja | Ukupni troškovi u izabranom periodu |

### Napredni KPI-jevi

| KPI | Opis |
|-----|------|
| Dostupnost | Procenat aktivne opreme |
| Garancijska Pokrivenost | Procenat opreme pod garancijom |
| Trošak po Opremi | Prosečan trošak održavanja |
| Prosečna Starost | Prosečna starost opreme u godinama |

### Grafikoni

- **Status Pie Chart** - Distribucija opreme po statusu (klikni za drill-down)
- **Type Bar Chart** - Broj opreme po tipu (klikni za drill-down)
- **Cost Trend** - Trend troškova održavanja po mesecima
- **Age Distribution** - Distribucija opreme po starosti
- **Location Bar Chart** - Top 10 lokacija po broju opreme

### Lokacijska Analitika

- **Stacked Bar Chart** - Prikazuje status opreme po lokaciji
- **Interaktivna Mapa** - Markeri za svaku lokaciju sa popup-om

### Mapa Markeri

| Boja | Značenje |
|------|----------|
| Zelena | Sva oprema je aktivna |
| Narandžasta | Ima opreme na servisu |
| Crvena | Ima neispravne opreme |

### Drill-Down

1. Klikni na bilo koji chart segment
2. Otvara se modal sa detaljnom listom opreme
3. Možeš videti sve podatke za taj segment

### Export

- **PDF:** Klikni "Export PDF" za generisanje izveštaja
- **Excel:** Klikni "Export Excel" za download tabele

---

## Mapa Lokacija

### Pregled Mape

1. Klikni **"Mapa"** tab
2. Vidi sve lokacije na OpenStreetMap mapi
3. Markeri pokazuju broj opreme na svakoj lokaciji

### Interakcija

- **Zoom:** Scroll ili +/- dugmad
- **Pan:** Klikni i prevuci
- **Popup:** Klikni marker za detalje

### Dodavanje Lokacije sa Mape

1. U formi za novu lokaciju, klikni na mapu
2. GPS koordinate se automatski popune
3. Nastavi sa unosom ostalih podataka

---

## Autentifikacija

### Prijava

1. Klikni **"Login"** dugme (Google ikona)
2. Izaberi Google nalog
3. Dozvoli pristup
4. Automatski redirect nazad na app

### Odjava

1. Klikni tvoj email (gore desno)
2. Klikni **"Logout"**

### Nivoi Pristupa

| Korisnik | Pregled | Dodavanje | Izmena | Brisanje |
|----------|---------|-----------|--------|----------|
| Javnost (QR) | ✅ | ❌ | ❌ | ❌ |
| Ulogovan Admin | ✅ | ✅ | ✅ | ✅ |

---

## FAQ

### Da li mogu koristiti app offline?

Ne, potreban je internet za pristup Supabase bazi podataka.

### Koliko opreme mogu dodati?

Praktično neograničeno. Besplatni tier: 500MB baze, 1GB storage.

### Koliko može biti veliki dokument?

Maksimalno 50MB po fajlu (PDF ili slika).

### Da li mogu dodati više fotografija po opremi?

Trenutno 1 fotografija po opremi, ali neograničeno PDF dokumenata.

### Šta se dešava kad obrišem lokaciju?

Automatski se briše i sva oprema na toj lokaciji (CASCADE DELETE).

### Ko vidi podatke?

- **Svi** mogu čitati podatke (preko QR kodova)
- **Samo admin** (ulogovan) može dodavati/menjati/brisati

### Kako dodati novog admin-a?

Svako ko se prijavi sa Google nalogom postaje admin. Možeš kontrolisati pristup u Supabase Dashboard → Authentication → Users.

### Šta znači "Neaktivna" status?

Novi status za opremu koja je privremeno van upotrebe, ali nije neispravna niti povučena.

### Kako radi napredna pretraga?

Kombinuj više filtera za precizne rezultate. Filteri se primenjuju zajedno (AND logika).

### Kako funkcionišu notifikacije?

Sistem automatski proverava:
- Garancije koje ističu u narednih 30 dana
- Zakazano održavanje u narednih 7 dana
- Opremu koja je na servisu duže od 14 dana

---

## Saveti za Efikasno Korišćenje

1. **Koristite smislene inventarske brojeve** (npr. VDX-001, VRX-002)
2. **Upload-ujte jasne fotografije** (dobro osvetljene, fokusirane)
3. **Dodajte detaljne napomene** (olakšava pronalaženje)
4. **Redovno ažurirajte servisnu istoriju**
5. **Štampajte QR kodove na vodootpornim nalepnicama**
6. **Proveravajte notifikacije redovno**
7. **Koristite bulk operacije za masovne promene**
8. **Koristite naprednu pretragu za specifične upite**

---

**Verzija:** 5.0 - Enhanced Analytics Edition
**Poslednje Ažuriranje:** Januar 2026

Za tehničku podršku vidi: [SUPABASE_SETUP.md](SUPABASE_SETUP.md) i [README.md](README.md)

