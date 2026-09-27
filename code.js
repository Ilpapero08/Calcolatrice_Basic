const display = document.querySelector('#display');
const expression = document.querySelector('#expression');
const keypad = document.querySelector('.keypad');

let currentInput = '0';
let storedValue = null;
let pendingOperator = null;
let shouldStartNewInput = false;
let lastExpression = '';

const operatorSymbols = {
	'+': '+',
	'-': '−',
	'*': '×',
	'/': '÷'
};

function formatNumber(value) {
	if (!Number.isFinite(value)) return 'Errore';
	const rounded = Number.parseFloat(value.toPrecision(12));
	return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 10 }).format(rounded);
}

function refreshDisplay() {
	display.textContent = formatNumber(Number(currentInput));
	expression.textContent = lastExpression || '\u00a0';
	keypad.querySelectorAll('[data-operator]').forEach((button) => {
		button.classList.toggle('is-selected', button.dataset.operator === pendingOperator && !shouldStartNewInput);
	});
}

function enterDigit(digit) {
	if (currentInput === 'Errore' || shouldStartNewInput) {
		currentInput = digit;
		shouldStartNewInput = false;
	} else if (currentInput.replace('-', '').replace('.', '').length < 12) {
		currentInput = currentInput === '0' ? digit : currentInput + digit;
	}
	lastExpression = '';
	refreshDisplay();
}

function enterDecimal() {
	if (currentInput === 'Errore' || shouldStartNewInput) {
		currentInput = '0.';
		shouldStartNewInput = false;
	} else if (!currentInput.includes('.')) {
		currentInput += '.';
	}
	lastExpression = '';
	refreshDisplay();
}

function calculate(left, right, operator) {
	switch (operator) {
		case '+': return left + right;
		case '-': return left - right;
		case '*': return left * right;
		case '/': return right === 0 ? NaN : left / right;
		default: return right;
	}
}

function chooseOperator(operator) {
	const inputValue = Number(currentInput);
	if (!Number.isFinite(inputValue)) {
		clearCalculator();
		return;
	}

	if (pendingOperator && !shouldStartNewInput) {
		const result = calculate(storedValue, inputValue, pendingOperator);
		if (!Number.isFinite(result)) {
			showError();
			return;
		}
		currentInput = String(result);
		storedValue = result;
	} else {
		storedValue = inputValue;
	}

	pendingOperator = operator;
	shouldStartNewInput = true;
	lastExpression = `${formatNumber(storedValue)} ${operatorSymbols[operator]}`;
	refreshDisplay();
}

function showError() {
	currentInput = 'Errore';
	storedValue = null;
	pendingOperator = null;
	shouldStartNewInput = true;
	lastExpression = 'Non si può dividere per zero';
	refreshDisplay();
}

function equals() {
	if (!pendingOperator || storedValue === null || currentInput === 'Errore') return;
	const right = Number(currentInput);
	const result = calculate(storedValue, right, pendingOperator);
	if (!Number.isFinite(result)) {
		showError();
		return;
	}

	lastExpression = `${formatNumber(storedValue)} ${operatorSymbols[pendingOperator]} ${formatNumber(right)} =`;
	currentInput = String(result);
	storedValue = null;
	pendingOperator = null;
	shouldStartNewInput = true;
	refreshDisplay();
}

function clearCalculator() {
	currentInput = '0';
	storedValue = null;
	pendingOperator = null;
	shouldStartNewInput = false;
	lastExpression = '';
	refreshDisplay();
}

function backspace() {
	if (currentInput === 'Errore') {
		clearCalculator();
		return;
	}
	if (shouldStartNewInput) return;
	currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
	if (currentInput === '-') currentInput = '0';
	refreshDisplay();
}

function changeSign() {
	if (currentInput === '0' || currentInput === 'Errore') return;
	currentInput = String(Number(currentInput) * -1);
	refreshDisplay();
}

function percent() {
	if (currentInput === 'Errore') return;
	currentInput = String(Number(currentInput) / 100);
	shouldStartNewInput = false;
	refreshDisplay();
}

function handleAction(action) {
	switch (action) {
		case 'clear': clearCalculator(); break;
		case 'backspace': backspace(); break;
		case 'decimal': enterDecimal(); break;
		case 'sign': changeSign(); break;
		case 'percent': percent(); break;
		case 'equals': equals(); break;
	}
}

keypad.addEventListener('click', (event) => {
	const button = event.target.closest('button');
	if (!button) return;

	if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
	else if (button.dataset.operator) chooseOperator(button.dataset.operator);
	else if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener('keydown', (event) => {
	if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
	else if (event.key === '.' || event.key === ',') enterDecimal();
	else if (['+', '-', '*', '/'].includes(event.key)) chooseOperator(event.key);
	else if (event.key === 'Enter' || event.key === '=') {
		event.preventDefault();
		equals();
	} else if (event.key === 'Backspace') backspace();
	else if (event.key === 'Escape' || event.key === 'Delete') clearCalculator();
	else if (event.key === '%') percent();
});

refreshDisplay();
