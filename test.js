// Local test harness for code-golf-expr solution.js
// Usage: node test.js [solution-file]   (default: ./solution.js)
// Exit 0 only if every counted test passes. The "known limitations"
// section is reported separately and does not count as a failure.
const fs = require('fs');
const file = process.argv[2] || './solution.js';
const { evalExpr } = require(require('path').resolve(file));
const eq = (a, b) => a === b || Math.abs(a - b) < 1e-9;
let pass = 0, fail = 0;
function t(inp, want) {
  let r;
  try { r = evalExpr(inp); } catch (e) { r = 'THROW:' + e.message; }
  if (eq(r, want)) pass++;
  else { fail++; console.log('FAIL', JSON.stringify(inp), 'got', r, 'want', want); }
}
// 1) Public cases (identical to cases.json from the bounty repo)
const pub = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'cases.json'), 'utf8'));
for (const c of pub) t(c.in, c.out);
console.log(`public: ${pass}/${pub.length} passed`);
const p1 = pass; pass = 0; fail = 0;
// 2) Extra hand-written cases: precedence, parens, decimals, spaces,
//    unary minus/plus, division, left-associativity, big numbers
const extra = [
  ["2+3*4", 14], ["(2+3)*4", 20], ["10/4", 2.5], ["2.5*4", 10],
  ["((1))", 1], ["-3+5", 2], ["3*-2", -6], [" 1 + 2 * 3 ", 7],
  ["1 + 2", 3], [".5*2", 1], ["5.*2", 10], ["0.1+0.2", 0.30000000000000004],
  ["100/10/2", 5], ["2- -3", 5], ["--3", 3], ["-(2+3)", -5], ["+(2)", 2],
  ["1+2+3+4+5", 15], ["2*3/4", 1.5], ["10-2*3", 4], ["(10-2)*3", 24],
  ["123456*789", 97406784], ["1/3", 1 / 3], ["999999999+1", 1000000000],
  ["2*(3+(4-1))", 12], ["((2+3)*(4-1))/5", 3], ["0", 0], ["0.5+0.25", 0.75],
  ["7-3-2", 2], ["100/4/5", 5], ["3.14159*2", 6.28318], ["1-2-3", -4],
  ["8/2*(2+2)", 16], ["2+3*4-5/2", 11.5], ["(1)", 1], ["(((5)))", 5],
  ["-2*-3", 6], ["1+2*3*4+5", 30], ["0.1*0.1", 0.01],
  ["1000000*1000000", 1e12], ["5/2", 2.5], ["-0.5+1", 0.5],
  ["  (  2  +  3  )  *  4  ", 20], ["2+-3", -1], ["2-+3", -1],
  ["9/3/3", 1], ["2*2*2*2*2", 32],
];
for (const [inp, want] of extra) t(inp, want);
console.log(`extra: ${pass}/${extra.length} passed`);
// 3) Stress: deep nesting, long expression, division by zero, big values
const s0 = pass; pass = 0; fail = 0;
t('('.repeat(50) + '1' + ')'.repeat(50), 1);
t('1' + '+1'.repeat(500), 501);
t('2*3*4*5*6*7*8*9', 362880);
t('0.1+0.7', 0.7999999999999999);
t('1/0', Infinity);
t('-1/0', -Infinity);
t('5/2*2', 5);
t('100000000000000000000+1', 100000000000000000000);
t('3.5*2+1.5/0.5', 10);
t('((2+3)*((4-1)+2))/5', 5);
t('  12  /  3  ', 4);
t('007', 7);
t('0.5', 0.5);
t('.25*4', 1);
console.log(`stress: ${pass}/14 passed`);
// 4) Fuzz: 2000 random valid expressions vs JS eval as oracle
function rndExpr(d = 0) {
  const r = Math.random();
  if (d > 3 || r < 0.35) {
    let n = (Math.random() * 100).toFixed(Math.random() < 0.5 ? 0 : 2)
      .replace(/0+$/, '').replace(/\.$/, '');
    if (n === '' || n === '-') n = '7';
    return (Math.random() < 0.2 ? '-' : '') + n;
  }
  const op = '+-*/'[Math.floor(Math.random() * 4)];
  let e = rndExpr(d + 1) + op + rndExpr(d + 1);
  if (Math.random() < 0.3) e = '(' + e + ')';
  if (Math.random() < 0.2) e = ' ' + e + ' ';
  return e;
}
let fok = 0, ftot = 0;
for (let k = 0; k < 2000; k++) {
  const e = rndExpr(); let want, got;
  try { want = eval(e); } catch (_) { continue; }
  if (!isFinite(want)) continue;
  ftot++;
  try { got = evalExpr(e); } catch (_) { got = 'THROW'; }
  if (got === want || Math.abs(got - want) < 1e-9) fok++;
  else console.log('FUZZ FAIL', JSON.stringify(e), 'got', got, 'want', want);
}
console.log(`fuzz: ${fok}/${ftot} passed`);
// 5) Known limitation (not counted): scientific notation is outside the
//    spec ("integer and decimal literals" only), so "1e3" parses as 1.
let lim;
try { lim = evalExpr('1e3'); } catch (e) { lim = 'THROW'; }
console.log(`known limitation: evalExpr('1e3') = ${lim} (spec has no exponent notation)`);
const allOk = p1 === pub.length && s0 === extra.length && pass === 14 && fok === ftot;
console.log(allOk ? 'ALL COUNTED TESTS PASSED' : 'SOME COUNTED TESTS FAILED');
process.exit(allOk ? 0 : 1);
