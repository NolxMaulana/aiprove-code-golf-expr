# TRANSCRIPT — build entry AIProve code-golf-expr

Tanggal: 2026-11-13. Builder: subagent (koordinator: parent orchestrator).
Tidak ada session token, wallet, key, seed, atau password yang dipakai,
diminta, atau disimpan di sini. Tidak ada submit ke aiprove.fun.

## Langkah

1. Buka spec GitHub https://github.com/AIProveRH/aiprove/tree/main/challenges/code-golf-expr
   via browser.open dan curl api.github.com + raw.githubusercontent.com.
   Hasil: folder hanya berisi README.md dan cases.json.
2. Baca README.md spec: `evalExpr(s)`, satu file JS, `module.exports = { evalExpr }`,
   dukung `+ - * /`, integer/desimal, kurung, precedence normal, tanpa variabel/fungsi.
   Metrik: byte file, terpendek yang lolos semua case menang, satu gagal = skor 0.
3. Baca cases.json (9 public case): `1+2*3`=7, `(1+2)*3`=9, `10/4`=2.5,
   `2*2*2*2`=16, `7-3-2`=2, `(8-2)/(1+2)`=2, `3.5+1.5`=5, `100`=100,
   `2*(3+(4-1))`=12.
4. Cek repo grader (`grader/README.md`, `grader/src/`): hanya kategori FORECAST
   yang diimplementasikan; kategori code-execution dinyatakan "later", belum ada.
   Tidak ditemukan larangan eval/Function atau scan anti-cheat di spec/repo.
   Cek challenge lain (bug-hunt-utils, eth-backtest, fastest-primes): tidak ada
   pola larangan eval.
5. Prototipe parser v1 (recursive descent E/T/F, 443 byte): 9/9 publik, 47/47 extra.
6. Prototipe precedence-climbing (satu fungsi P + F, 433 byte): 9/9, 47/47.
7. Golf ke varian while + object-literal precedence/apply (370 byte): 9/9, 47/47.
8. Gabung primary ke dalam P, hilangkan F (316 byte) lalu perbaiki unary
   `i++` yang hilang dan unary `+`: varian D2 339 byte, 9/9, 47/47, fuzz 4276/4276.
9. Golf lanjutan: gabung cabang unary `-`/`+`, jadikan `n`/`q`/`w` variabel
   modul (aman karena hanya dibaca setelah assignment pasca-call rekursif):
   D3 328 byte (tanpa trailing newline), 9/9, 47/47, fuzz 4304/4304.
10. Hapus `|0` pada lookup precedence (`undefined >= m` sudah false): D4 326 byte,
    9/9, 47/47, fuzz 4304/4304. Ditemukan saat uji `node -e` dengan
    `const { evalExpr } = require(...)` di global scope: assignment implisit ke
    `evalExpr` menabrak binding const global dan throw. Itu artefak `node -e`,
    tapi menunjukkan risiko strict mode / global-scope harness.
11. Keputusan: amankan semua nama modul dengan satu deklarasi
    `let s,i,q,w,n,P,evalExpr` (biaya +25 byte): D5 351 byte. Verifikasi:
    9/9 publik, 47/47 extra, 14/14 stress (hanya `1e3` di luar spec yang
    mengembalikan 1, didokumentasikan), fuzz 4307/4307,
    `node --use-strict` lolos, `node -e` global-scope clash lolos, ESM import lolos,
    panggilan berulang tanpa sisa state lolos.
12. Bandingkan varian eval (`function evalExpr(s){return eval(s)}`, 63 byte):
    9/9 publik tapi gagal 1 extra (`--3` throw). Diputuskan BUKAN file utama;
    disimpan sebagai `solution-eval.js` hanya untuk pembanding, dengan alasan
    tertulis di README.md (risiko hidden case acak + risiko anti-cheat).
13. Tulis file final ke `~/workspace/aiprove/code-golf-expr/`:
    `solution.js` (salinan verbatim D5), `solution-eval.js`, `cases.json`,
    `test.js`, `README.md`, `TRANSCRIPT.md` (file ini).
14. Verifikasi akhir: `wc -c` solution.js = 351, solution-eval.js = 63;
    `node test.js` pada solution.js exit 0 (9/9 + 47/47 + 14/14 + fuzz 1739/1739
    pada run terakhir); `node test.js solution-eval.js` exit 1 (gagal `--3`,
    sesuai ekspektasi). Tidak ada secret di file mana pun (grep token/key/seed
    tidak relevan; tidak ada kredensial yang pernah disentuh).

## Keputusan yang dicatat

- Parser sebagai entry utama, bukan eval, walau eval 5,5x lebih pendek:
  parser lolos semua suite termasuk bentuk unary ganda, dan tidak mengandung
  `eval`/`Function` sehingga tahan terhadap kemungkinan review/anti-cheat.
- Notasi eksponen tidak didukung (di luar spec); tidak dikejar karena akan
  menambah byte dan risiko merusak parsing operator `-`/`+` setelah `e`.
- File tanpa trailing newline (1 byte) dipertahankan; `node --check` lolos.
