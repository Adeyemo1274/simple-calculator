
const state = {
  current:     '0',   
  previous:    '',    
  operator:    null,  
  justEvaled:  false, 
  expression:  ''     
};

const displayEl    = document.getElementById('display');
const expressionEl = document.getElementById('expression');


function updateDisplay(value) {
  displayEl.classList.remove('error', 'shrink', 'xshrink');
  const str = String(value);
  displayEl.textContent = str;

  if (str.length > 12)      displayEl.classList.add('xshrink');
  else if (str.length > 8)  displayEl.classList.add('shrink');
}


function updateExpression(text) {
  expressionEl.textContent = text;
}


function formatNumber(str) {
  if (str === '' || str === '-') return str;
  const n = parseFloat(str);
  if (isNaN(n)) return 'Error';
 
  let formatted = parseFloat(n.toPrecision(10)).toString();
  return formatted;
}


function toMathOp(op) {
  return { '÷': '/', '×': '*', '−': '-', '+': '+' }[op];
}


function inputNumber(digit) {
  if (state.justEvaled) {
    
    state.current    = digit;
    state.previous   = '';
    state.operator   = null;
    state.expression = '';
    state.justEvaled = false;
  } else if (state.current === '0' && digit !== '.') {
    state.current = digit;
  } else if (state.current.length >= 15) {
    return; 
  } else {
    state.current += digit;
  }
  updateDisplay(state.current);
}

function inputDecimal() {
  if (state.justEvaled) {
    state.current    = '0.';
    state.justEvaled = false;
    state.previous   = '';
    state.operator   = null;
    state.expression = '';
  } else if (!state.current.includes('.')) {
    state.current += '.';
  }
  updateDisplay(state.current);
}

function inputOperator(op) {
  state.justEvaled = false;

  if (state.operator && state.current !== '') {
    
    calculate(false);
  }

  state.previous   = state.current !== '' ? state.current : state.previous;
  state.operator   = op;
  state.expression = `${state.previous} ${op}`;
  state.current    = '';

  updateExpression(state.expression);
  highlightActiveOp(op);
}

function calculate(finalEval = true) {
  if (!state.operator || state.previous === '') return;

  const a   = parseFloat(state.previous);
  const b   = parseFloat(state.current !== '' ? state.current : state.previous);
  const op  = toMathOp(state.operator);

  let result;
  if (op === '/' && b === 0) {
    displayEl.textContent = 'Cannot ÷ 0';
    displayEl.classList.add('error');
    updateExpression('');
    state.current    = '0';
    state.previous   = '';
    state.operator   = null;
    state.justEvaled = true;
    clearActiveOp();
    return;
  } else {
    result = eval(`${a} ${op} ${b}`);
  }

  const formatted = formatNumber(String(result));

  if (finalEval) {
    updateExpression(`${state.previous} ${state.operator} ${b} =`);
    state.justEvaled = true;
    state.operator   = null;
    clearActiveOp();
  }

  state.current  = formatted;
  state.previous = formatted;
  updateDisplay(formatted);
  updateExpression(finalEval ? `${a} ${state.operator || ''} ${b} =` : '');
}

function clear() {
  state.current    = '0';
  state.previous   = '';
  state.operator   = null;
  state.justEvaled = false;
  state.expression = '';
  updateDisplay('0');
  updateExpression('');
  clearActiveOp();
}

function toggleSign() {
  if (state.current === '0' || state.current === '') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay(state.current);
}

function inputPercent() {
  if (state.current === '' || state.current === '0') return;
  const val = parseFloat(state.current) / 100;
  state.current = formatNumber(String(val));
  updateDisplay(state.current);
}



function highlightActiveOp(op) {
  clearActiveOp();
  document.querySelectorAll('.btn-op').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active');
  });
}

function clearActiveOp() {
  document.querySelectorAll('.btn-op').forEach(btn => btn.classList.remove('active'));
}


function flashBtn(el) {
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 120);
}


document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    switch (action) {
      case 'number':   inputNumber(value);   break;
      case 'decimal':  inputDecimal();       break;
      case 'operator': inputOperator(value); break;
      case 'equals':   calculate(true);      break;
      case 'clear':    clear();              break;
      case 'sign':     toggleSign();         break;
      case 'percent':  inputPercent();       break;
    }
  });
});


const keyMap = {
  '0': { action: 'number',   value: '0' },
  '1': { action: 'number',   value: '1' },
  '2': { action: 'number',   value: '2' },
  '3': { action: 'number',   value: '3' },
  '4': { action: 'number',   value: '4' },
  '5': { action: 'number',   value: '5' },
  '6': { action: 'number',   value: '6' },
  '7': { action: 'number',   value: '7' },
  '8': { action: 'number',   value: '8' },
  '9': { action: 'number',   value: '9' },
  '.': { action: 'decimal',  value: '.' },
  ',': { action: 'decimal',  value: '.' },
  '+': { action: 'operator', value: '+' },
  '-': { action: 'operator', value: '−' },
  '*': { action: 'operator', value: '×' },
  '/': { action: 'operator', value: '÷' },
  'Enter':     { action: 'equals',   value: '=' },
  '=':         { action: 'equals',   value: '=' },
  'Backspace': { action: 'backspace', value: '' },
  'Escape':    { action: 'clear',    value: '' },
  '%':         { action: 'percent',  value: '' },
};

document.addEventListener('keydown', (e) => {
  const mapped = keyMap[e.key];
  if (!mapped) return;

  e.preventDefault();

  const { action, value } = mapped;

  let selector = '';
  if (action === 'number')   selector = `[data-action="number"][data-value="${value}"]`;
  if (action === 'operator') selector = `[data-action="operator"][data-value="${value}"]`;
  if (action === 'equals')   selector = `[data-action="equals"]`;
  if (action === 'clear')    selector = `[data-action="clear"]`;
  if (action === 'decimal')  selector = `[data-action="decimal"]`;
  if (action === 'percent')  selector = `[data-action="percent"]`;

  if (selector) {
    const el = document.querySelector(selector);
    if (el) flashBtn(el);
  }

  switch (action) {
    case 'number':    inputNumber(value);   break;
    case 'decimal':   inputDecimal();       break;
    case 'operator':  inputOperator(value); break;
    case 'equals':    calculate(true);      break;
    case 'clear':     clear();              break;
    case 'percent':   inputPercent();       break;
    case 'backspace':
      if (state.justEvaled) { clear(); break; }
      if (state.current.length <= 1) {
        state.current = '0';
      } else {
        state.current = state.current.slice(0, -1);
      }
      updateDisplay(state.current);
      break;
  }
});

updateDisplay('0');
