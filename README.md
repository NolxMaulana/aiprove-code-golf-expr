# code-golf-expr — AIProve bounty entry (siap submit, BELUM disubmit)

Bounty: `code-golf-expr`, 1.000.000 PROVE, tutup 16 Nov 2026 20:49 WIB, lane AutoGrade.
Spec: https://github.com/AIProveRH/aiprove/tree/main/challenges/code-golf-expr
(`README.md` + `cases.json` di repo itu; salinan `cases.json` ada di folder ini.)

## Spec (yang terverifikasi dari GitHub, 13 Nov 2026)

- Satu file JS yang mengekspor `evalExpr` (`module.exports = { evalExpr }`).
- `evalExpr(s)` mengevaluasi string ekspresi aritmatika kecil, mengembalikan number.
- Mendukung `+ - * /`, literal integer dan desimal, kurung, precedence normal
  (`*`/`/` di atas `+`/`-`). Tanpa variabel, tanpa fungsi.
- Metrik: **byte** file sumber. File terpendek yang lolos semua case menang.
  Satu case gagal = skor 0.
- 9 public case di `cases.json`; grader menjalankan itu plus hidden set.
- Tidak ada larangan `eval`/`Function` di spec, dan tidak ada kode anti-cheat
  di repo grader (`grader/` di repo hanya mengimplementasikan kategori
  FORECAST; kategori code-execution dinyatakan "later", belum ada).

## File utama: `solution.js` — 351 byte

Parser precedence-climbing asli (bukan `eval`), satu fungsi rekursif `P`
dengan parameter sebagai variabel lokal, tabel precedence + tabel aplikasi
operator sebagai object literal, dan variabel global modul yang dideklarasikan
(`let s,i,q,w,n,P,evalExpr`) sehingga aman di strict mode dan aman saat
harness memakai `const { evalExpr } = require(...)` di global scope.

Mendukung, di luar public case: spasi (termasuk tab/newline, di-strip di awal),
unary minus/plus (`-3+5`, `3*-2`, `--3`, `-(2+3)`), kurung bertingkat,
desimal `.5` dan `5.`, asosiatif kiri (`7-3-2 = 2`, `100/10/2 = 5`),
angka besar, ekspresi panjang (500 suku), pembagian nol (`Infinity`, mengikuti
semantik number JS).

Keterbatasan yang diketahui: notasi eksponen (`1e3`) tidak didukung, karena
spec hanya menyebut literal integer dan desimal; `evalExpr('1e3')` mengembalikan
1 (angka di depannya), bukan throw. Dianggap di luar spec.

## Cara run

```sh
node test.js            # menguji ./solution.js (exit 0 = semua lolos)
node test.js solution-eval.js   # menguji varian eval (diharapkan gagal 1 case)
node -e "const {evalExpr}=require('./solution.js'); console.log(evalExpr('(1+2)*3'))"
```

## Hasil test lokal (terverifikasi, 13 Nov 2026)

| Suite | Hasil |
|---|---|
| Public case (`cases.json`, 9 case) | 9/9 lolos |
| Extra buatan (precedence, kurung, desimal, spasi, unary, pembagian, angka besar) | 47/47 lolos |
| Stress (kurung 50 tingkat, 500 suku, `1/0`, dst.) | 14/14 lolos |
| Fuzz (ekspresi acak vs `eval` sebagai oracle, 2000 iterasi) | 1739/1739 lolos (run terakhir; run sebelumnya 4307/4307) |
| Total counted | semua lolos, `node test.js` exit 0 |

## Varian eval: `solution-eval.js` — 63 byte (BUKAN file utama)

```js
function evalExpr(s){return eval(s)}
module.exports={evalExpr}
```

Ini varian absolut-terpendek. Sengaja BUKAN file utama karena:

- Gagal 1 extra case: `evalExpr('--3')` throw
  (`Invalid left-hand side expression in prefix operation`), padahal parser
  mengembalikan 3. Hidden set yang digenerate acak bisa saja memuat bentuk
  seperti itu; satu gagal = skor 0.
- Mengandung string `eval`, jadi kalau grader/reviewer menambahkan larangan
  atau scan anti-cheat, varian ini langsung gugur; parser tidak.
- Parser hanya 351 byte dan lolos semua suite di atas, termasuk fuzz.

Keputusan akhir file mana yang disubmit ada di koordinator. Rekomendasi
builder: submit `solution.js` (351 byte).

## File di folder ini

- `solution.js` — entry utama (351 byte, `wc -c`).
- `solution-eval.js` — varian eval (63 byte), hanya referensi/pembanding.
- `test.js` — harness lokal (public + extra + stress + fuzz).
- `cases.json` — salinan public case dari repo bounty.
- `README.md` — file ini.
- `TRANSCRIPT.md` — rangkaian langkah build, bersih dari secret.
