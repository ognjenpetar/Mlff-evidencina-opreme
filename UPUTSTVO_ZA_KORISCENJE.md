# Uputstvo za Korišćenje - MLFF Equipment Tracking

Kompletan vodič za korišćenje aplikacije (verzija 3.0 - Supabase Edition)

---

## 🚀 Početak Rada

### Prvi Put (Admin)
1. Otvori aplikaciju: https://ognjenpetar.github.io/mlff-equipment-tracking/
2. Klikni **"Login"** dugme (Google ikona)
3. Prijavi se sa Google account-om
4. Počni sa dodavanjem lokacija i opreme

### Pregled Opreme (Javnost)
1. Skeniraj QR kod na opremi
2. Automatski se otvara kompletan izveštaj
3. **Nije potrebna prijava!**

---

## 📍 Upravljanje Lokacijama

### Dodavanje Nove Lokacije
1. Klikni **"Dodaj lokaciju"** (+ ikona)
2. Popuni formu:
   - **Naziv:** Npr. "Portal Beograd-Niš KM 12"
   - **GPS koordinate:** Unesi latitude/longitude ili klikni na mapu
   - **Adresa:** Puna adresa lokacije
   - **Opis:** Dodatne informacije
   - **Fotografija:** Upload sliku lokacije (opciono)
3. Klikni **"Sačuvaj"**

### Izmena Lokacije
1. Klikni na lokaciju sa liste
2. Klikni **"Izmeni"** (pencil ikona)
3. Promeni podatke
4. Klikni **"Sačuvaj"**

### Brisanje Lokacije
1. Klikni na lokaciju
2. Klikni **"Obriši"** (trash ikona)
3. Potvrdi brisanje
4. **Napomena:** Briše se i sva oprema na toj lokaciji!

---

## 🔧 Upravljanje Opremom

### Dodavanje Nove Opreme
1. Klikni na lokaciju
2. Klikni **"Dodaj opremu"**
3. Popuni formu:
   - **Inventarski broj:** Unikatan broj (obavezan)
   - **Tip:** Izaberi iz liste ili dodaj novi
   - **Status:** Aktivna, Na servisu, Neispravna, Povučena
   - **Proizvođač:** Npr. "Siemens"
   - **Model:** Npr. "VDX-2000"
   - **Serijski broj:** Broj sa uređaja
   - **IP Adresa:** Za mrežne uređaje
   - **MAC Adresa:** Za mrežne uređaje
   - **Koordinate (X/Y/Z):** Pozicija u cm
   - **Datum instalacije:** Kada je instaliran
   - **Ime instalera:** Ko je instalirao
   - **Ime testera:** Ko je testirao
   - **Garancija ističe:** Datum isteka
   - **Fotografija:** Upload sliku uređaja
   - **Napomene:** Dodatne informacije
4. Klikni **"Sačuvaj"**

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

## 📄 Dokumentacija

### Upload Dokumenata
1. Otvori opremu
2. Scroll do sekcije **"Dokumentacija"**
3. Klikni **"Dodaj dokument"**
4. Izaberi PDF fajl (max 50MB)
5. Sačekaj upload (progress bar prikazuje napredak)

### Pregled Dokumenta
1. Klikni na dokument sa liste
2. Otvara se u novom tabu

### Brisanje Dokumenta
1. Klikni **"Obriši"** (trash ikona) pored dokumenta
2. Potvrdi brisanje

---

## 📋 Servisna Istorija

### Dodavanje Servisa
1. Otvori opremu
2. Scroll do sekcije **"Servisna istorija"**
3. Klikni **"Dodaj servis"**
4. Popuni formu:
   - **Tip servisa:** Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija
   - **Datum:** Kada je servis obavljen
   - **Opis:** Šta je urađeno
   - **Izvršilac:** Ko je radio servis
   - **Cena:** Koliko je koštalo (opciono)
   - **Sledeći servis:** Kada treba sledeći (opciono)
5. Klikni **"Sačuvaj"**

---

## 📱 QR Kodovi

### Generisanje QR Koda
1. Otvori opremu
2. Klikni **"QR Kod"** dugme
3. QR kod se prikazuje u modal-u
4. Opcije:
   - **Download:** Sačuvaj kao sliku
   - **Print:** Odštampaj
   - **Copy URL:** Kopiraj link

### Štampanje QR Kodova
1. Generiši QR kod
2. Klikni **"Print"**
3. Printer dialog → Štampaj
4. Zalepi QR kod na opremu

### Skeniranje QR Koda
1. Otvori telefon camera ili QR scanner app
2. Skeniraj QR kod
3. Automatski se otvara izveštaj opreme
4. **Ne treba prijava!**

---

## 🔍 Pretraga i Filtriranje

### Globalna Pretraga
1. Kucaj u search bar (vrh stranice)
2. Pretraga po:
   - Inventarskom broju
   - Nazivu opreme
   - Modelu
   - Serijskom broju
   - Napomenama

### Filteri
1. **Tip:** Filtriraj po tipu opreme
2. **Status:** Filtriraj po statusu (Aktivna, Na servisu, itd.)
3. **Lokacija:** Filtriraj po lokaciji

### Resetovanje Filtera
Klikni **"Clear"** (X ikona) pored search bar-a

---

## 📊 Izveštaji

### Izveštaj Lokacije
1. Klikni na lokaciju
2. Klikni **"Izveštaj"** (document ikona)
3. Prikazuje:
   - GPS koordinate + mapa
   - Sva oprema na lokaciji
   - Statistika (ukupan broj, status)

### Izveštaj Opreme
1. Klikni na opremu
2. Klikni **"Izveštaj"**
3. Prikazuje:
   - Sve tehničke specifikacije
   - Fotografije
   - Dokumentacija
   - Servisna istorija
   - Audit log (ko je menjao podatke)

---

## 🔐 Autentifikacija

### Prijava
1. Klikni **"Login"** (Google ikona)
2. Izaberi Google account
3. Dozvoli pristup
4. Automatski redirect nazad na app

### Odjava
1. Klikni tvoj email (gore desno)
2. Klikni **"Logout"**

### Ko Može Šta?

**Javnost (bez login-a):**
✅ Pregled opreme (preko QR kodova)
✅ Čitanje svih podataka
❌ Dodavanje/izmena/brisanje

**Admin (sa login-om):**
✅ Sve što javnost može
✅ Dodavanje lokacija i opreme
✅ Izmena podataka
✅ Brisanje podataka
✅ Upload dokumenata
✅ Dodavanje servisa

---

## 🗺️ Interaktivna Mapa

### Pregled Mape
1. Klikni **"Mapa"** tab
2. Vidi sve lokacije na mapi
3. Klikni na marker za detalje

### Dodavanje Lokacije sa Mape
1. Klikni **"Dodaj lokaciju"**
2. Klikni na mapu gde želiš lokaciju
3. GPS koordinate automatski popunjene
4. Dopuni ostale podatke

---

## ❓ Česta Pitanja (FAQ)

**Q: Da li mogu koristiti app offline?**
A: Ne, potreban je internet za pristup Supabase bazi.

**Q: Koliko opreme mogu dodati?**
A: Praktično neograničeno (besplatni tier: 500MB baze, 1GB storage)

**Q: Koliko može biti veliki PDF dokument?**
A: Maksimalno 50MB po fajlu.

**Q: Da li mogu dodati više fotografija po opremi?**
A: Trenutno 1 fotografija po opremi, ali neograničeno PDF dokumenata.

**Q: Šta se dešava kad obrišem lokaciju?**
A: Automatski se briše i sva oprema na toj lokaciji (CASCADE DELETE).

**Q: Ko vidi podatke?**
A: Svi mogu čitati (preko QR kodova), samo admin može menjati.

**Q: Kako dodati novog admin-a?**
A: Admin prijavi sa Google account-om. Možeš kontrolisati pristup u Supabase Dashboard → Authentication → Users.

---

## 💡 Saveti za Efikasno Korišćenje

1. **Koristite smislene inventarske brojeve** (npr. VDX-001, VRX-002)
2. **Upload-ujte jasne fotografije** (dobro osvetljene, fokusirane)
3. **Dodajte detaljne napomene** (olakšava pronalaženje)
4. **Redovno ažurirajte servisnu istoriju**
5. **Štampajte QR kodove na vodootpornim nalepnicama**
6. **Backup-ujte podatke** (Supabase export features)

---

**Za tehničku podršku, vidi README.md i DEPLOYMENT.md**

**Verzija:** 3.0 - Supabase Edition
