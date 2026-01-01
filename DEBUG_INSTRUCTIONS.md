# 🐛 Debug Instructions - Problem sa Snimanjem

## Koraci za Debug:

### **1. Otvori Developer Console:**
- Pritisni **F12** (ili Ctrl+Shift+I na Windows)
- Idi na **Console** tab
- **OSTAVI KONZOLU OTVORENU** dok pokušavaš da snimiš

### **2. Pokušaj da dodaš lokaciju/opremu ponovo:**
- Klikni "Dodaj Lokaciju" ili "Dodaj Opremu"
- Popuni formu
- Klikni "Sačuvaj"

### **3. Proveri Console za greške:**
Tražiš crvene linije sa error porukama. Možda vidiš nešto kao:
- `ReferenceError: ... is not defined`
- `TypeError: Cannot read property...`
- `Supabase error: ...`
- `Permission denied`

### **4. Kopiraj SVE error poruke i pošalji mi ih**

---

## Brzi Check - Da li si ulogovan?

**VAŽNO**: Moraš biti **ulogovan sa Google nalogom** da bi mogao da dodaješ/menjаš podatke!

### Kako proveriti:
1. Pogledaj **header aplikacije** (gornji deo)
2. Da li vidiš:
   - ✅ **Tvoj email** i **Logout dugme** → Ulogovan si
   - ❌ **Google ikonu** (plava) → Nisi ulogovan - **KLIKNI NA NJU!**

### Ako vidiš Google ikonu:
1. Klikni na nju
2. Uloguj se sa svojim Google nalogom
3. Probaj ponovo da dodaš lokaciju/opremu

---

## Proveri Supabase Connection:

U **Console** tabu (F12), otkucaj:

```javascript
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Is authenticated:', await supabase.auth.getUser());
```

Kopiraj rezultat i pošalji mi.

---

## Screenshot:

Ako možeš, napravi screenshot:
1. **Forme** koju pokušavaš da submituješ (sa podacima koje pokušavaš da snimiš)
2. **Console** tab sa error porukama
3. **Header** aplikacije (da vidim da li si ulogovan)

---

## Česte Greške:

### 1. **Nisi ulogovan**
- **Simptom**: Forma se submitu, ali ništa se ne dešava
- **Rešenje**: Klikni Google ikonu u header-u i uloguj se

### 2. **Supabase RLS blokira**
- **Simptom**: Console error: "Row Level Security policy violation" ili "new row violates row-level security policy"
- **Rešenje**: Trebam da proverim RLS politike u Supabase

### 3. **JavaScript error**
- **Simptom**: Crvena poruka u Console-u
- **Rešenje**: Pošalji mi error poruku da vidim gde je problem

### 4. **Obavezna polja nisu popunjena**
- **Simptom**: Forma ne dozvoljava submit, markira crvena polja
- **Rešenje**: Popuni sva obavezna polja (označena sa *)

---

## Pošalji mi:

1. ✅ Da li si **ulogovan** (vidiš email u header-u)?
2. ✅ Šta pokušavaš da dodaš (**lokaciju** ili **opremu**)?
3. ✅ **Error poruke** iz Console-a (crvene linije)
4. ✅ (Opciono) **Screenshot** forme i console-a

Sa ovim informacijama mogu odmah da identifikujem problem! 🔧
