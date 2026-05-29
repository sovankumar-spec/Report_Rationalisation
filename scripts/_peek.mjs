import { readFileSync } from 'fs';
import { read, utils } from 'xlsx';

const buf = readFileSync('C:/Users/sovan/Downloads/Rationalization Demo/Rationalization Demo/Report Modernization Strategy/Report Modernization Strategy.xlsx');
const wb  = read(buf, { type: 'buffer' });

// Full dump of all rows in all sheets
wb.SheetNames.forEach(name => {
  const rows = utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  console.log(`\n${'='.repeat(70)}`);
  console.log(`SHEET: ${name}  (${rows.length} rows)`);
  console.log('='.repeat(70));
  rows.forEach((r, i) => {
    if (r.every(c => c === '')) return; // skip blank rows
    console.log(`[${i}] ${JSON.stringify(r)}`);
  });
});
