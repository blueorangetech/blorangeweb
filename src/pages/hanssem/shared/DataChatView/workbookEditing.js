import FormulaParser from 'fast-formula-parser';
const { FormulaError, FormulaHelpers } = FormulaParser;

function excelText(argument) {
  const value = FormulaHelpers.accept(argument);
  if (value instanceof FormulaError) throw value;
  if (typeof value === 'number') return String(Number(value.toPrecision(15)));
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return value == null ? '' : String(value);
}

export function cellPosition(address) {
  const [, column, row] = /^([A-Z]+)(\d+)$/.exec(address);
  return { row: Number(row), col: [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) };
}

function cellAddress(row, col) {
  let name = '';
  while (col > 0) {
    name = String.fromCharCode(65 + (col - 1) % 26) + name;
    col = Math.floor((col - 1) / 26);
  }
  return name + row;
}

export function inputValue(text, type) {
  if (text === '') return null;
  if (type === 'b') {
    if (!/^(true|false)$/i.test(text.trim())) throw new Error('TRUE 또는 FALSE를 입력해 주세요.');
    return text.trim().toLowerCase() === 'true';
  }
  if (type === 's' || type === 'inlineStr') return text;
  const numeric = text.trim().replace(/,/g, '');
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?%?$/.test(numeric)) {
    const result = Number(numeric.replace('%', '')) / (numeric.endsWith('%') ? 100 : 1);
    if (!Number.isFinite(result)) throw new Error('유효한 숫자를 입력해 주세요.');
    return result;
  }
  return text;
}

export function applyWorkbookEdits(original, edits) {
  const sheets = original.sheets.map(sheet => ({
    ...sheet, rows: sheet.rows.map(row => [...row]), formulas: { ...sheet.formulas },
    cell_types: { ...sheet.cell_types }, calculation_errors: {},
  }));
  for (const edit of Object.values(edits)) {
    const sheet = sheets.find(item => item.name === edit.sheet);
    const { row, col } = cellPosition(edit.address);
    if (edit.value.startsWith('=')) sheet.formulas[edit.address] = edit.value;
    else {
      const value = inputValue(edit.value, sheet.cell_types[edit.address]);
      sheet.rows[row - 1][col - 1] = value === null ? '' : String(value);
      delete sheet.formulas[edit.address];
      sheet.cell_types[edit.address] = typeof value === 'number' ? 'n' : typeof value === 'boolean' ? 'b' : 's';
    }
  }
  const byName = new Map(sheets.map(sheet => [sheet.name.toLowerCase(), sheet]));
  const cache = new Map();
  const active = new Set();
  const cyclic = new Set();
  const parsers = [];
  let depth = 0;
  function evaluate(sheetName, row, col) {
    const sheet = byName.get(sheetName?.toLowerCase());
    if (!sheet || row < 1 || col < 1) return FormulaError.REF;
    const address = cellAddress(row, col);
    const key = JSON.stringify([sheet.name, address]);
    if (cache.has(key)) return cache.get(key);
    if (active.has(key)) {
      for (const dependency of active) cyclic.add(dependency);
      return FormulaError.REF;
    }
    if (depth > 150) return FormulaError.REF;
    const formula = sheet.formulas[address];
    if (!formula) {
      const value = sheet.rows[row - 1]?.[col - 1] ?? '';
      if (sheet.cell_types[address] === 'e') return new FormulaError(value);
      return inputValue(value, sheet.cell_types[address]);
    }
    active.add(key);
    let value;
    try {
      const parser = parsers[depth] || (parsers[depth] = new FormulaParser({
        // Excel converts numeric arguments to text at 15 significant digits.
        functions: { EXACT: (left, right) => excelText(left) === excelText(right) },
        onCell: ref => evaluate(ref.sheet, ref.row, ref.col),
        onRange: ref => {
          const target = byName.get(ref.sheet?.toLowerCase());
          if (!target) throw FormulaError.REF;
          const height = target.rows.length;
          const width = Math.max(0, ...target.rows.map(r => r.length));
          const rows = [];
          for (let r = ref.from.row; r <= Math.min(ref.to.row, height); r++) {
            const values = [];
            for (let c = ref.from.col; c <= Math.min(ref.to.col, width); c++) values.push(evaluate(target.name, r, c));
            rows.push(values);
          }
          return rows.length ? rows : [[null]];
        },
        onVariable: () => { throw FormulaError.NAME; },
      }));
      depth++;
      value = parser.parse(formula.slice(1), { sheet: sheet.name, row, col });
      if (typeof value === 'number' && !Number.isFinite(value)) value = FormulaError.NUM;
      if (Array.isArray(value) || (value && typeof value === 'object' && !(value instanceof FormulaError))) value = FormulaError.VALUE;
    } catch (error) {
      value = error instanceof FormulaError ? error : FormulaError.NAME;
    } finally {
      depth--;
      active.delete(key);
    }
    if (cyclic.has(key)) value = FormulaError.REF;
    if (value instanceof FormulaError && !['#REF!', '#DIV/0!', '#VALUE!', '#NAME?', '#NUM!', '#N/A', '#NULL!'].includes(String(value))) value = FormulaError.VALUE;
    cache.set(key, value);
    return value;
  }
  // Compute everything before writing results, so original literals remain typed.
  for (const sheet of sheets) {
    for (const address of Object.keys(sheet.formulas)) {
      const { row, col } = cellPosition(address);
      evaluate(sheet.name, row, col);
    }
  }
  for (const sheet of sheets) {
    for (const address of Object.keys(sheet.formulas)) {
      const { row, col } = cellPosition(address);
      const value = cache.get(JSON.stringify([sheet.name, address]));
      const text = value === null || value === undefined ? '' : String(value);
      sheet.rows[row - 1][col - 1] = text;
      sheet.cell_types[address] = value instanceof FormulaError ? 'e' : typeof value === 'number' ? 'n' : typeof value === 'boolean' ? 'b' : 's';
      if (value instanceof FormulaError) sheet.calculation_errors[address] = text;
    }
  }
  return { ...original, sheets, calculated: true };
}

export function calculationCache(workbook) {
  return Object.fromEntries(workbook.sheets.map(sheet => [sheet.name,
    Object.fromEntries(Object.keys(sheet.formulas).map(address => {
      const { row, col } = cellPosition(address);
      const text = sheet.rows[row - 1][col - 1];
      const value = sheet.calculation_errors[address] ? { error: text }
        : sheet.cell_types[address] === 'b' ? text === 'true'
          : sheet.cell_types[address] === 'n' ? Number(text) : text;
      return [address, value];
    })),
  ]));
}
