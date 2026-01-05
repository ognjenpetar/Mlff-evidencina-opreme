# 🔍 Data Recovery & Verification Instructions

## ⚠️ CRITICAL: Izgubljene Lokacije (Lost Locations)

Ako si primetio da su ti **nestale lokacije**, postoje 2 moguća razloga:

### 1. Podaci su u **Supabase** (bezbedni su!)
- Ako si ranije koristio v3.0+ aplikaciju i bio prijavljen, podaci su u Supabase
- Samo treba da se ponovo prijaviš da bi ih video

### 2. Podaci su bili samo u **LocalStorage** (možda izgubljeni)
- Ako nikada nisi bio prijavljen, podaci su bili samo lokalno
- Ako si obrisao LocalStorage, podaci su trajno izgubljeni

---

## ✅ KORAK 1: Proveri Deployment Status

**Otvori:** https://github.com/ognjenpetar/Mlff-evidencina-opreme/actions

**Proveri:**
- Poslednji workflow run treba da ima **zeleni checkmark** ✅
- Naziv: "Deploy to GitHub Pages"
- Status: "Success"
- Vreme: Treba da vidiš commit od pre nekoliko minuta

**Sačekaj 2-3 minuta** da se deployment završi pre nego što otvoriš aplikaciju.

---

## ✅ KORAK 2: Otvori App U NOVOM Incognito/Private Tab-u

**VAŽNO:** Moraš koristiti **potpuno novi private tab** da bi video nove izmene!

### Chrome/Edge:
- `Ctrl + Shift + N` → Novi Incognito prozor
- Otvori: https://ognjenpetar.github.io/Mlff-evidencina-opreme/

### Firefox:
- `Ctrl + Shift + P` → Novi Private prozor
- Otvori: https://ognjenpetar.github.io/Mlff-evidencina-opreme/

### Brave:
- `Ctrl + Shift + N` → Novi Private prozor
- Otvori: https://ognjenpetar.github.io/Mlff-evidencina-opreme/

---

## ✅ KORAK 3: Proveri da li su Greške Nestale

Otvori **Developer Console** (F12) i proveri:

### ❌ AKO VIDIŠ OVE GREŠKE → Keširanje problema, sačekaj još 5-10 min:
```
SyntaxError: Invalid or unexpected token - supabase-config.js:29
```

### ✅ AKO NE VIDIŠ GREŠKE → FIX JE USPEO!
Trebao bi da vidiš samo:
```
✅ Supabase client initialized successfully
🌐 Project URL: https://xmkkqawodbejrcjlnmqx.supabase.co
```

---

## ✅ KORAK 4: Prijavi Se sa Google Nalogom

**VEOMA VAŽNO**: Moraš biti **prijavljen** da bi video podatke iz Supabase!

1. Klikni na **Google ikonu** (plava) u header-u
2. Uloguj se sa istim Google nalogom koji si koristio ranije
3. Sačekaj da se pojavi tvoj email u header-u

---

## ✅ KORAK 5: Proveri Da Li Su Lokacije Vraćene

**Idi na stranicu "Lokacije"** i proveri:

### ✅ AKO VIDIŠ LOKACIJE → Podaci su bezbedni u Supabase!
Odlično! Sve lokacije su bile u Supabase bazi.

### ❌ AKO NE VIDIŠ LOKACIJE → Podaci nikada nisu bili u Supabase
To znači da:
- Nikada nisi bio prijavljen kada si dodavao lokacije
- Ili su bile samo u LocalStorage
- Ili je LocalStorage obrisan

---

## 🔍 KORAK 6: Dijagnostika - Proveri Gde Su Podaci

Kopiraj i otkucaj ovu komandu u **Console** (F12):

```javascript
// === DIAGNOSTIC SCRIPT - Provera podataka ===
(async function checkData() {
    console.log('\n=== 📊 DATA DIAGNOSTIC REPORT ===\n');

    // 1. Check LocalStorage
    console.log('1️⃣ LocalStorage Data:');
    const localData = localStorage.getItem('mlff_equipment_data');
    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            console.log('   ✅ LocalStorage has data');
            console.log('   📍 Locations:', parsed.locations?.length || 0);
            console.log('   🔧 Equipment:', parsed.equipment?.length || 0);
            if (parsed.locations?.length > 0) {
                console.log('   📋 Location names:', parsed.locations.map(l => l.name));
            }
        } catch (e) {
            console.error('   ❌ LocalStorage data corrupted:', e.message);
        }
    } else {
        console.log('   ⚠️  LocalStorage is EMPTY (no mlff_equipment_data)');
    }

    console.log('\n2️⃣ Authentication Status:');
    if (window.supabase) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
            console.log('   ✅ Logged in as:', user.email);
        } else {
            console.log('   ❌ NOT logged in! Login required to see Supabase data.');
            console.log('   👉 Click the Google icon to login');
        }
    } else {
        console.log('   ❌ Supabase not initialized');
    }

    console.log('\n3️⃣ Supabase Database Data:');
    if (window.supabase) {
        try {
            const { data: locations, error } = await supabase
                .from('locations')
                .select('*');

            if (error) {
                console.error('   ❌ Error fetching from Supabase:', error.message);
            } else {
                console.log('   ✅ Supabase has data');
                console.log('   📍 Locations in database:', locations?.length || 0);
                if (locations?.length > 0) {
                    console.log('   📋 Location names:', locations.map(l => l.name));
                } else {
                    console.log('   ⚠️  No locations found in Supabase database');
                }
            }
        } catch (e) {
            console.error('   ❌ Cannot query Supabase:', e.message);
        }
    }

    console.log('\n=== END REPORT ===\n');

    // Summary
    console.log('📝 SUMMARY:');
    console.log('- If LocalStorage has data but Supabase is empty → Data was never synced to cloud');
    console.log('- If Supabase has data → Data is safe! Just login to see it');
    console.log('- If both are empty → Data was likely cleared or never saved\n');
})();
```

**Kopiraj OUTPUT iz Console-a i pošalji mi!**

---

## 🛟 Data Recovery Options

### Scenario A: Supabase IMA podatke (best case)
**Rešenje**: Samo se prijavi sa Google nalogom i podaci će se učitati.

### Scenario B: LocalStorage IMA podatke, Supabase NEMA
**Rešenje**: Možeš PONOVO dodati lokacije (sada će se snimiti u Supabase).

### Scenario C: OBA su prazna
**Rešenje**: Podaci su izgubljeni. Moraš ponovo uneti lokacije.

**VAŽNO**: Sada kada je bug popravljen, SVE NOVO što dodaš biće **sigurno u Supabase** i neće se izgubiti!

---

## 🧪 KORAK 7: Testiraj Photo Upload (Nakon što se deployment završi)

Kada vidiš da greška nestala:

1. Klikni **"Dodaj Lokaciju"**
2. Popuni formu:
   - Naziv: "Test Lokacija"
   - Adresa: "Test"
   - Grad: "Beograd"
3. **Izaberi fotografiju** (JPG, PNG, max 5MB)
4. Klikni **"Sačuvaj"**

**Očekivano ponašanje**:
- ✅ Loading spinner: "Uploadujem fotografiju..." → "Snimam u bazu..."
- ✅ Success toast: "✅ Lokacija uspešno dodata!"
- ✅ Modal se zatvara
- ✅ Fotografija vidljiva u kartici lokacije

**Ako se desi greška**:
- ❌ Error toast sa jasnom porukom
- ❌ Console prikazuje tačan razlog greške
- Kopiraj error i pošalji mi

---

## 📤 Šta Treba Da Mi Pošalješ

1. ✅ Da li je deployment završen (GitHub Actions status)
2. ✅ Da li vidiš greške u Console-u nakon što otvoriš app u private mode
3. ✅ OUTPUT iz dijagnostičkog script-a (Korak 6)
4. ✅ Da li si prijavljen (vidiš svoj email u header-u)
5. ✅ Da li vidiš svoje stare lokacije
6. ✅ Da li photo upload sada radi (test iz Koraka 7)

Sa ovim informacijama ću odmah znati šta treba dalje da uradim!

---

## ⏰ Timeline

- **0-2 min**: GitHub Actions deployment započinje
- **2-5 min**: Deployment završen, ali CDN kešira stare fajlove
- **5-15 min**: CDN ažuriran, novi fajlovi dostupni
- **15+ min**: Ako i dalje vidiš greške, nešto drugo ne valja

**Private/Incognito mode eskivira browser keš, ali NE eskivira CDN keš!**

---

**TL;DR**:
1. Sačekaj 2-5 min za deployment
2. Otvori u NOVOM private tab-u
3. Prijavi se sa Google
4. Pokreni diagnostic script
5. Testiraj photo upload
6. Pošalji mi rezultate
