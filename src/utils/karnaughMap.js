// 產生 Karnaugh map 結構（1–4 變數）。
// rows 是 buildTruthTable 的輸出，每列含 values, predicate, index。
// 回傳 { rows: [{ header, cells: [{ value, label }] }], colHeaders, rowVar, colVar }
// value: true | false（target predicate 在該 cell 是否為真）
// label: 顯示用 row.index（minterm number）

const GRAY2 = [0, 1];
const GRAY4 = [0, 1, 3, 2]; // 00, 01, 11, 10

function bits(value, width) {
  return value.toString(2).padStart(width, '0');
}

export function buildKMap(rows, clauses, target = true) {
  const n = clauses.length;
  if (n < 1 || n > 4) {
    return { unsupported: true, n };
  }

  // 對每列以該列代表的 minterm index 建表（依 clauses 依序為 MSB → LSB）。
  const map = new Map();
  rows.forEach((row) => {
    const value = row.predicate === target;
    map.set(row.index, { value, minterm: row.index });
  });

  let rowOrder;
  let colOrder;
  let rowVars;
  let colVars;

  if (n === 1) {
    rowOrder = [0];
    colOrder = GRAY2;
    rowVars = [];
    colVars = [clauses[0]];
  } else if (n === 2) {
    rowOrder = GRAY2;
    colOrder = GRAY2;
    rowVars = [clauses[0]];
    colVars = [clauses[1]];
  } else if (n === 3) {
    rowOrder = GRAY2;
    colOrder = GRAY4;
    rowVars = [clauses[0]];
    colVars = [clauses[1], clauses[2]];
  } else {
    rowOrder = GRAY4;
    colOrder = GRAY4;
    rowVars = [clauses[0], clauses[1]];
    colVars = [clauses[2], clauses[3]];
  }

  const rowWidth = rowVars.length;
  const colWidth = colVars.length;

  const grid = rowOrder.map((rBits) => {
    const cells = colOrder.map((cBits) => {
      const minterm = (rBits << colWidth) | cBits;
      const entry = map.get(minterm);
      return {
        minterm,
        value: entry ? entry.value : false,
      };
    });
    return {
      header: rowWidth ? bits(rBits, rowWidth) : '',
      cells,
    };
  });

  return {
    unsupported: false,
    n,
    rowVars,
    colVars,
    colHeaders: colOrder.map((cBits) => bits(cBits, colWidth)),
    grid,
  };
}
