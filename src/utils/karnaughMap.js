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

// 把 row/col 上的位元（依 rowClauseIdx / colClauseIdx 中的順序為 MSB→LSB）
// 還原成 truth table 的 minterm 編號（clauses[0] 在 minterm 中是 MSB）。
function composeMinterm(n, rowBits, colBits, rowClauseIdx, colClauseIdx) {
  let minterm = 0;
  rowClauseIdx.forEach((clauseIdx, i) => {
    const localBit = (rowBits >> (rowClauseIdx.length - 1 - i)) & 1;
    if (localBit) minterm |= 1 << (n - 1 - clauseIdx);
  });
  colClauseIdx.forEach((clauseIdx, i) => {
    const localBit = (colBits >> (colClauseIdx.length - 1 - i)) & 1;
    if (localBit) minterm |= 1 << (n - 1 - clauseIdx);
  });
  return minterm;
}

export function buildKMap(rows, clauses, target = true) {
  const n = clauses.length;
  if (n < 1 || n > 4) {
    return { unsupported: true, n };
  }

  const map = new Map();
  rows.forEach((row) => {
    map.set(row.index, { value: row.predicate === target, minterm: row.index });
  });

  let rowOrder;
  let colOrder;
  let rowVars;
  let colVars;
  let rowClauseIdx;
  let colClauseIdx;

  if (n === 1) {
    rowOrder = [0];
    colOrder = GRAY2;
    rowVars = [];
    colVars = [clauses[0]];
    rowClauseIdx = [];
    colClauseIdx = [0];
  } else if (n === 2) {
    rowOrder = GRAY2;
    colOrder = GRAY2;
    rowVars = [clauses[0]];
    colVars = [clauses[1]];
    rowClauseIdx = [0];
    colClauseIdx = [1];
  } else if (n === 3) {
    // 列：c；欄：ab（Gray code 00/01/11/10）。
    rowOrder = GRAY2;
    colOrder = GRAY4;
    rowVars = [clauses[2]];
    colVars = [clauses[0], clauses[1]];
    rowClauseIdx = [2];
    colClauseIdx = [0, 1];
  } else {
    // 列：cd；欄：ab，兩者皆為 Gray code 00/01/11/10。
    rowOrder = GRAY4;
    colOrder = GRAY4;
    rowVars = [clauses[2], clauses[3]];
    colVars = [clauses[0], clauses[1]];
    rowClauseIdx = [2, 3];
    colClauseIdx = [0, 1];
  }

  const rowWidth = rowClauseIdx.length;
  const colWidth = colClauseIdx.length;

  const grid = rowOrder.map((rBits) => {
    const cells = colOrder.map((cBits) => {
      const minterm = composeMinterm(n, rBits, cBits, rowClauseIdx, colClauseIdx);
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
