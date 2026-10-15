import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { applyWorkbookEdits, calculationCache } from '../src/components/hanssem/common/DataChatView/workbookEditing.js';

function sheet(name, rows, formulas, cell_types = {}) {
  return { name, rows, formulas, cell_types };
}

test('dependencies, ranges, absolute references and percent edits', () => {
  const original = { sheets: [sheet('예산', [['100', '0.1', '10'], ['0', '0', '100']], { C1: '=A1*B1', C2: '=SUM(A1:A2)' }, { A1: 'n', B1: 'n' })] };
  const result = applyWorkbookEdits(original, { edit: { sheet: '예산', address: 'B1', value: '20%' } });
  assert.equal(result.sheets[0].rows[0][2], '20');
  assert.equal(result.sheets[0].rows[1][2], '100');
  assert.equal(original.sheets[0].rows[0][1], '0.1');
});

test('cross sheet references and IFERROR', () => {
  const result = applyWorkbookEdits({ sheets: [
    sheet('원본', [['25']], {}, { A1: 'n' }),
    sheet('계산', [['', '']], { A1: "='원본'!$A$1*2", B1: '=IFERROR(1/0,9)' }),
  ] }, {});
  assert.deepEqual(result.sheets[1].rows[0], ['50', '9']);
});

test('circular, unsupported functions and invalid references are explicit errors', () => {
  const result = applyWorkbookEdits({ sheets: [sheet('S', [['', '', '', '']], {
    A1: '=B1', B1: '=A1', C1: '=NOT_A_FUNCTION(1)', D1: "='Missing'!A1",
  })] }, {});
  assert.equal(Object.keys(result.sheets[0].calculation_errors).length, 4);
});

test('cached results retain text and boolean types', () => {
  const result = applyWorkbookEdits({ sheets: [sheet('S', [['', '', '']], {
    A1: '="0012"', B1: '=EXACT("x","x")', C1: '=EXACT("A","a")',
  })] }, {});
  assert.deepEqual(calculationCache(result).S, { A1: '0012', B1: true, C1: false });
});

const fixturePath = new URL('../output/data-chat-test/calculation-fixture.json', import.meta.url);
test('supplied media mix: all cached formula values match and budget totals update', { skip: !existsSync(fixturePath) }, () => {
  const original = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const result = applyWorkbookEdits(original, {});
  for (let i = 0; i < original.sheets.length; i++) {
    for (const address of Object.keys(original.sheets[i].formulas)) {
      const [, column, row] = /^([A-Z]+)(\d+)$/.exec(address);
      const col = [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
      const before = original.sheets[i].rows[Number(row) - 1][col];
      const after = result.sheets[i].rows[Number(row) - 1][col];
      if (Number.isFinite(Number(before)) && Number.isFinite(Number(after))) {
        assert.ok(Math.abs(Number(before) - Number(after)) <= Math.max(1e-7, Math.abs(Number(before)) * 1e-10), address);
      } else assert.equal(after.toLowerCase(), before.toLowerCase(), address);
    }
  }
  const edited = applyWorkbookEdits(original, { budget: { sheet: 'Sheet1', address: 'O7', value: '15550000' } });
  assert.equal(edited.sheets[0].rows[87][14], '444499999');
  assert.deepEqual(edited.sheets[0].calculation_errors, {});
});
