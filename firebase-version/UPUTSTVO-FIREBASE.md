# 📖 Uputstvo za Korišćenje - MLFF Evidencija Opreme

**Verzija 2.0** - Backend Architecture Edition

Detaljno uputstvo za korišćenje sistema evidencije opreme na MLFF naplatnim portalima.

---

## 📋 Sadržaj

1. [Uvod](#uvod)
2. [Prvi Put Pokretanje](#prvi-put-pokretanje)
3. [Upravljanje Lokacijama](#upravljanje-lokac ijama)
4. [Upravljanje Opremom](#upravljanje-opremom)
5. [QR Kodovi](#qr-kodovi)
6. [Dokument i Fotografije](#dokumenti-i-fotografije)
7. [Servisiranje i Održavanje](#servisiranje-i-održavanje)
8. [Pretraga i Filtriranje](#pretraga-i-filtriranje)
9. [Izveštaji](#izveštaji)
10. [Interaktivna Mapa](#interaktivna-mapa)
11. [Autentifikacija](#autentifikacija)
12. [Česta Pitanja (FAQ)](#česta-pitanja-faq)

---

## Uvod

MLFF Evidencija Opreme je web aplikacija koja omogućava kompletnomanagement opreme na naplatnim portalima. Aplikacija koristi Firebase cloud platformu što znači:

- ✅ **Neograničeni storage** - bez LocalStorage ograničenja
- ✅ **Automatski backup** - svi podaci bezbedno sačuvani u cloud-u
- ✅ **Pristup sa bilo kog uređaja** - desktop, tablet, mobilni telefon
- ✅ **QR kodovi** - brzi pristup informacijama o opremi

---

## Prvi Put Pokretanje

### Korak 1: Pristup Aplikaciji

**Lokalno pokretanje:**
1. Otvorite `index.html` fajl u web browser-u (Chrome, Firefox, Edge)
2. Aplikacija će se pokrenuti sa mock podacima

**Web verzija (Firebase Hosting):**
1. Otvorite URL aplikacije u browser-u (npr. `https://mlff-equipment-tracking.web.app`)
2. Aplikacija se automatski povezuje sa Firebase backend-om

### Korak 2: Početna Strana (Dashboard)

Kada otvorite aplikaciju, videćete:
- **Header** sa logom Orion E-mobility i nazivom aplikacije
- **Statistike** - broj lokacija, opreme, aktivne opreme, servisi
- **Pregled lokacija** - lista svih naplatnih portala
- **Dugmad** - "Prikaži Mapu" i "Dodaj Lokaciju"

---

## Upravljanje Lokacijama

Lokacija predstavlja jedan naplatni portal gde je instalirana oprema.

### Dodavanje Nove Lokacije

1. **Kliknite "Dodaj Lokaciju"** na dashboard-u
2. **Popunite formu:**
   - **Naziv** (obavezno) - npr. "Portal Beograd-Niš KM 12"
   - **GPS Latitude** (obavezno) - npr. 44.8125
   - **GPS Longitude** (obavezno) - npr. 20.4612
   - **Opis** (opciono) - kratak opis lokacije
   - **Fotografija** (opciono) - slika lokacije (JPG, PNG)

3. **Kliknite "Sačuvaj"**
4. **Podaci se čuvaju u Firebase Firestore**, fotografija u Firebase Storage

### Izmena Lokacije

1. **Kliknite na lokaciju** da je otvorite
2. **Kliknite "Izmeni Lokaciju"**
3. **Ažurirajte podatke** u formi
4. **Kliknite "Sačuvaj"**

### Brisanje Lokacije

⚠️ **UPOZORENJE:** Brisanjem lokacije brišete i svu opremu na njoj!

1. **Otvorite lokaciju**
2. **Kliknite "Obriši Lokaciju"**
3. **Potvrdite brisanje**

---

## Upravljanje Opremom

Oprema je tehnička oprema instalirana na naplatnim portalima (VDX, VRX, antene, switch-evi, etc.).

### Dodavanje Nove Opreme

1. **Otvorite lokaciju** gde želite da dodate opremu
2. **Kliknite "Dodaj Opremu"**
3. **Popunite formu:**

#### **Obavezna Polja:**
- **Tip Opreme** - Izaberite iz liste ili unesite custom tip:
  - VDX
  - VRX
  - Antena
  - Switch
  - TRC
  - TRM
  - intel
  - jetson
  - Wi-FI
  - Ili upišite novi tip (biće sačuvan za buduće korišćenje)

- **Inventarski Broj** - Jedinstvena oznaka opreme (npr. "VDX-001")

#### **Opciona Polja:**

**Osnovne Informacije:**
- **Status** - Aktivna / Na servisu / Neispravna / Povučena
- **IP Adresa** - npr. "192.168.1.10"
- **MAC Adresa** - npr. "00:1B:44:11:3A:B7"

**Pozicija:**
- **X Koordinata** - pozicija u cm
- **Y Koordinata** - pozicija u cm
- **Z Koordinata** - pozicija u cm

**Instalacija:**
- **Datum Postavljanja** - kada je oprema instalirana
- **Garancija Do** - do kada traje garancija
- **Ime Instalatera** - ko je instalirao
- **Ime Testera** - ko je testirao

**Dodatno:**
- **Fotografija** - slika opreme (JPG, PNG)
- **PDF Dokumentacija** - tehnička dokumentacija, uputstva (do 50MB po fajlu)
- **Napomene** - dodatne informacije

4. **Kliknite "Sačuvaj"**
5. **Metadata se čuva u Firestore**, fajlovi u Firebase Storage

### Izmena Opreme

1. **Otvorite detalje opreme**
2. **Kliknite "Izmeni Opremu"**
3. **Ažurirajte podatke**
4. **Postojeći dokumenti** se prikazuju u preview-u
5. **Možete ukloniti** postojeće dokumente klikom na X
6. **Možete dodati** nove dokumente
7. **Kliknite "Sačuvaj"**

### Promena Statusa Opreme

Status opreme može biti:
- **Aktivna** 🟢 - oprema radi normalno
- **Na servisu** 🟡 - oprema je na popravci
- **Neispravna** 🔴 - oprema ne funkcioniše
- **Povučena** ⚫ - oprema trajno uklonjena

**Kako promeniti status:**
1. **Otvorite opremu**
2. **Kliknite "Promeni Status"**
3. **Izaberite novi status**
4. **Unesite razlog promene**
5. **Kliknite "Potvrdi"**
6. **Promena se automatski beleži u audit log**

### Brisanje Opreme

1. **Otvorite opremu**
2. **Kliknite "Obriši Opremu"**
3. **Potvrdite brisanje**

---

## QR Kodovi

QR kodovi omogućavaju brzi pristup informacijama o opremi skeniranjem sa mobilnog telefona.

### Generisanje QR Koda

1. **Otvorite detalje opreme**
2. **QR kod se automatski generiše** i prikazuje u info kartici
3. **Kliknite "QR Kod"** dugme za detaljan prikaz

### Štampanje QR Nalepnice

1. **Kliknite "QR Kod"** na detaljima opreme
2. **Videćete pun ekran sa QR kodom i info**:
   - QR kod (veliki)
   - Inventarski broj
   - Tip opreme
   - Naziv lokacije
   - GPS koordinate
3. **Kliknite "Štampaj Nalepnicu"**
4. **Nalepite QR kod na opremu**

### Preuzimanje QR Koda

1. **Kliknite "QR Kod"**
2. **Kliknite "Preuzmi Sliku"**
3. **QR kod se preuzima kao PNG slika**
4. **Možete je koristiti u dokumentima, email-ovima, etc.**

### Skeniranje QR Koda

1. **Skenirajte QR kod** sa mobilnog telefona (camera app ili QR scanner)
2. **Automatski se otvara web stranica** sa kompletnim izveštajem opreme:
   - URL format: `https://your-app.web.app/#/report/equipment/{id}`
   - Prikazuje SVE informacije o opremi
   - Dostupno **bez login-a** (javno)

---

## Dokumenti i Fotografije

### Upload Dokumenata

**Tokom kreiranja/izmene opreme:**
1. U formi za opremu, kliknite "Dodaj PDF dokumente"
2. Izaberite jedan ili više PDF fajlova (do 50MB svaki)
3. Videćete preview dokumenata pre nego što sačuvate
4. Kliknite "Sačuvaj" - dokumenti se uploaduju na Firebase Storage

**Iz detalja opreme:**
1. Otvorite opremu
2. Scroll do sekcije "Dodatna Dokumentacija"
3. Kliknite "Dodaj Dokumentaciju (PDF)"
4. Izaberite fajlove
5. Upload se pokreće automatski

### Pregledanje Dokumenata

**Hover Preview:**
1. Pređite mišem preko dokumenta u listi
2. **Automatski se otvara veliki preview** sa PDF sadržajem
3. **Scroll kroz PDF** koristeći scroll bar ili scroll wheel
4. Maknite miš da zatvorite preview

**Preuzimanje:**
1. Kliknite ikonu "Download" pored dokumenta
2. Fajl se preuzima sa Firebase Storage

### Brisanje Dokumenata

1. Kliknite ikonu "Trash" pored dokumenta
2. Potvrdite brisanje
3. Dokument se briše sa Firebase Storage i iz Firestore

### Upload Fotografija

**Lokacija:**
1. U formi za lokaciju, kliknite "Dodaj Fotografiju"
2. Izaberite JPG ili PNG sliku
3. Videćete preview pre čuvanja
4. Kliknite "Sačuvaj"

**Oprema:**
1. U formi za opremu, kliknite "Dodaj Fotografiju"
2. Izaberite sliku
3. Preview se prikazuje
4. Kliknite "Sačuvaj"

---

## Servisiranje i Održavanje

### Dodavanje Servisnog Zapisa

1. **Otvorite opremu**
2. **Kliknite "Dodaj Servis"**
3. **Popunite formu:**
   - **Tip Servisa:**
     - Preventivni - redovno održavanje
     - Korektivni - popravka kvara
     - Inspekcija - tehnički pregled
     - Zamena Dela - zamena komponente
     - Kalibracija - podešavanje
   - **Datum Servisa** (obavezno)
   - **Ime Servisera** (obavezno)
   - **Opis Radova** - šta je urađeno
   - **Troškovi (RSD)** - cena servisa
   - **Sledeći Servis** - kada je planirano sledeće održavanje
4. **Kliknite "Sačuvaj"**

### Pregled Servisne Istorije

1. **Otvorite opremu**
2. **Scroll do sekcije "Istorija Servisa"**
3. **Vidite sve servisne zapise** sortir ane po datumu (najnoviji prvi)
4. **Svaki zapis prikazuje:**
   - Tip servisa
   - Datum
   - Serviser
   - Opis radova
   - Troškovi
   - Sledeći planirani servis

---

## Pretraga i Filtriranje

### Globalna Pretraga

1. **Kliknite na search bar** na vrhu dashboard-a
2. **Unesite tekst** za pretragu:
   - Inventarski broj
   - Tip opreme
   - Naziv lokacije
   - IP adresa
   - MAC adresa
   - Ime instalatera/testera
3. **Rezultati se prikazuju u realnom vremenu**
4. **Kliknite na rezultat** da otvorite tu opremu

### Filtriranje po Tipu

1. **Izaberite tip opreme** iz dropdown menija
2. **Prikazaće se samo oprema tog tipa**
3. **Izaberite "Svi tipovi"** da uklonite filter

### Filtriranje po Statusu

1. **Izaberite status** iz dropdown menija:
   - Aktivna
   - Na servisu
   - Neispravna
   - Povučena
2. **Prikazaće se samo oprema tog statusa**
3. **Izaberite "Svi statusi"** da uklonite filter

### Pretraga Unutar Lokacije

1. **Otvorite lokaciju**
2. **Koristite search bar** u okviru lokacije
3. **Pretražuje samo opremu na toj lokaciji**

---

## Izveštaji

### Izveštaj Lokacije

**Kreiranje:**
1. **Otvorite lokaciju**
2. **Kliknite "Prikaži Izveštaj"**
3. **Izveštaj se prikazuje u aplikaciji** (ne preuzima se odmah)

**Sadržaj izveštaja:**
- Logo Orion E-mobility
- Naziv lokacije i GPS koordinate
- Opis lokacije
- Fotografija lokacije
- **Lista sve opreme** na toj lokaciji:
  - Inventarski broj
  - Tip
  - Status
  - IP/MAC adresa
  - Pozicija (X, Y, Z)
  - Datum instalacije
  - Instalater i tester

**Štampanje:**
1. Kliknite "Štampaj" dugme
2. Birjte štampač i opcije
3. Odštampajte izveštaj

### Izveštaj Opreme

**Kreiranje:**
1. **Otvorite opremu**
2. **Kliknite "Prikaži Izveštaj"**
3. **Kompletan izveštaj se prikazuje**

**Sadržaj izveštaja:**
- QR kod opreme (za brzi pristup)
- Osnovne informacije
- Tehnički podaci (IP, MAC, pozicija)
- Datum instalacije i garancije
- Instalater i tester
- Status
- Napomene
- **Servisna istorija** - svi servisi
- **Audit log** - sve promene
- **Lista dokumenata**

**Pristup preko QR koda:**
- Skenirajte QR kod
- Izveštaj se automatski otvara
- **Javno dostupan** - ne zahteva login

---

## Interaktivna Mapa

### Prikazivanje Mape

1. **Na dashboard-u kliknite "Prikaži Mapu"**
2. **Mapa se otvara** sa OpenStreetMap podlogom
3. **Sve lokacije prikazane kao markeri**

### Korišćenje Mape

**Navigacija:**
- **Zoom in/out** - kotačić miša ili +/- dugmad
- **Pomeranje** - prevucite mišem
- **Auto-zoom** - mapa automatski prilagođava zoom da prikaže sve lokacije

**Markeri:**
- **Zeleni marker** - lokacija
- **Broj na markeru** - broj opreme na toj lokaciji
- **Klik na marker** - otvara popup

**Popup informacije:**
- Naziv lokacije
- GPS koordinate
- Opis lokacije
- Broj opreme
- **"Otvori Detalje"** dugme - vodi direktno na lokaciju

**Zatvaranje mape:**
- Kliknite "Sakrij Mapu" - vraća se na grid prikaz

---

## Autentifikacija

### Login (Firebase Auth)

Aplikacija koristi Firebase autentifikaciju za zaštitu admin operacija.

**Kada je potreban login:**
- Dodavanje lokacije
- Izmena lokacije
- Brisanje lokacije
- Dodavanje opreme
- Izmena opreme
- Brisanje opreme
- Upload dokumenata
- Dodavanje servisa

**Javno dostupno (bez login-a):**
- Pregledanje lokacija
- Pregledanje opreme
- QR kod izveštaji
- Pretraga
- Mapa

**Kako se ulogovati:**
1. **Kliknite "Login" dugme** u header-u (ako je vidljivo)
2. **Izaberite Google nalog**
3. **Odobritic pristup**
4. **Automatski ste ulogovani**
5. **Vaš email se prikazuje** u header-u

**Logout:**
1. **Kliknite "Logout" dugme** u header-u
2. **Automatski ste odlogovani**

---

## Česta Pitanja (FAQ)

### Pitanje 1: Gde se čuvaju podaci?

**Odgovor:** Svi podaci se čuvaju na Firebase cloud platformi:
- **Firestore** - metadata (nazivi, brojevi, datumi)
- **Firebase Storage** - fajlovi (slike, PDF-ovi)
- **Automatski backup** - podaci bezbedno sačuvani

### Pitanje 2: Koliko fajlova mogu da uploadujem?

**Odgovor:**
- **Neograničen broj fajlova**
- **Do 50MB po fajlu** (umesto prethodnih 10MB)
- **Besplatni tier** - 1GB ukupnog storage-a
- **Upgrade na Blaze plan** - pay-as-you-go cene

### Pitanje 3: Da li mogu pristupiti sa mobilnog telefona?

**Odgovor:** **DA!** Aplikacija je responsive i radi na:
- Desktop računarima
- Tablet uređajima
- Mobilnim telefonima
- Bilo kom uređaju sa web browser-om

### Pitanje 4: Da li QR kodovi rade offline?

**Odgovor:** **NE.** QR kodovi vode na web URL koji zahteva internet konekciju.
Međutim, nakon što se izveštaj učita, možete ga pregledati offline (dok je stranica otvorena).

### Pitanje 5: Šta ako slučajno obrišem podatke?

**Odgovor:**
- **Firebase čuva podatke trajno** - ne gube se nakon refresh-a browser-a
- **Nema "undo" funkcije** - pažljivo brišite!
- **Redovno pravite backup** koristeći "Export Data" funkciju

### Pitanje 6: Mogu li deliti izveštaje sa kolegama?

**Odgovor:** **DA!** Dva načina:
1. **QR kod** - kolegaite skenira i vidi izveštaj
2. **URL** - kopirajte URL iz browser-a i pošaljite (npr. `https://app.web.app/#/report/equipment/123`)

### Pitanje 7: Kako da dodam custom tip opreme?

**Odgovor:**
1. Prilikom dodavanja opreme, u polje "Tip Opreme"
2. **Upišite novi naziv** (npr. "Kamera HD")
3. **Sačuvajte** opremu
4. **Novi tip se automatski dodaje** u listu i biće dostupan za buduća dodavanja

### Pitanje 8: Mogu li export-ovati podatke?

**Odgovor:** **DA!**
1. Kliknite ikonu "Download" u header-u
2. Svi podaci se export-uju u JSON format
3. Čuvajte fajl kao backup

**Napomena:** Export ne uključuje slike i PDF-ove (samo metadata).

### Pitanje 9: Kako da importujem stare podatke iz LocalStorage verzije?

**Odgovor:** Koristite **migration.html** tool:
1. Otvorite `migration.html` u browser-u
2. **PRE MIGRACIJE** - obavezno napravite backup!
3. Kliknite "Pokreni Migraciju"
4. Sačekajte da se završi
5. Proverite podatke u Firebase Console
6. Obrišite LocalStorage (opciono)

### Pitanje 10: Koliko košta korišćenje aplikacije?

**Odgovor:**
- **Besplatno** za male i srednje projekte (Firebase Free Tier)
- **Free tier limit**: 1GB storage, 50K reads/day, 20K writes/day
- **Procenjena kapaciteta**: 100 lokacija, 1000 opreme, 5000 dokumenata
- **Ako prekoračite**: automatski prelazite na Blaze plan (pay-as-you-go)
- **Procena za prosečan projekat**: $0-10/mesec

---

## 🆘 Pomoć i Podrška

Za dodatna pitanja ili probleme:

1. **Dokumentacija:**
   - README.md - opšte informacije
   - DEPLOYMENT.md - deployment guide
   - BACKEND_GUIDE.md - tehnička dokumentacija

2. **Email podrška:** [your-email@example.com]

3. **GitHub Issues:** [link-to-repo]

---

**Verzija:** 2.0 - Backend Architecture Edition
**Datum:** Decembar 2025
**© 2025 Orion E-mobility**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
