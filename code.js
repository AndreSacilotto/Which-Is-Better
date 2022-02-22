
//#region Query

/** @type {HTMLButtonElement} */
const opcA = document.querySelector('#opc-a');
/** @type {HTMLButtonElement} */
const opcB = document.querySelector('#opc-b');
/** @type {HTMLDivElement} */
const result = document.querySelector('#result');

//#endregion

class Item {
	constructor(name, value, background, color) {
		/** @type {String} */
		this.name = name;
		/** @type {Number} */
		this.level = value;
		/** @type {Item[]} */
		this.winFrom = [];
		/** @type {String} */
		this.background = background;
		/** @type {String} */
		this.color = color;
	}
	/** @param {Item} other */
	AlreadyMeet(other) {
		return AlreadyWon(other) || other.AlreadyWon(this);
	}
	/** @param {Item} other */
	AlreadyWon(other) {
		return this.winFrom.includes(other);
	}
};

/** @type {Item[]} */
let opcs;
fetch('./opcs.json')
	.then(response => response.json())
	.then(data => {
		opcs = data.map(element => {
			const color = RandomColorFromText(element);
			return new Item(element, 0, color, InvertColor(color, true));
		});
		currentOpcs = opcs;
		Next();
	});

//#region

/** @type {Item} */
let a;
/** @type {Item} */
let b;

let level = 0;

opcA.onclick = () => OnOpcClick(a, b);
opcB.onclick = () => OnOpcClick(b, a);

/** @param {Item} winner @param {Item} looser */
function OnOpcClick(winner, looser) {
	if (winner && looser) {
		winner.level++;
		winner.winFrom.push(looser);
		Next();
	}
}

function Next() {
	console.clear();
	console.table(opcs);
	console.log(level);

	let found = FindNextPair();

	if (found) {
		console.log(a, b);
		if (a.AlreadyWon(b)) {
			a.level++;
			Next();
		}
		else if(b.AlreadyWon(a))
		{
			b.level++;
			Next();
		}
		else {
			SetOpc(opcA, a);
			SetOpc(opcB, b);
		}
	}
	else {
		level++;
		if (level >= opcs.length) {
			a = b = undefined;
			ShowResult();
		}
		else
			Next();
	}

}

function FindNextPair() {
	let currentOpcs = opcs.filter(el => el.level === level);

	if (currentOpcs.length <= 1)
		return false;

	let aIdx = RandomInt(0, currentOpcs.length-1);
	a = currentOpcs[aIdx];
	let bIdx = RandomInt(0, currentOpcs.length-1);
	if(aIdx === bIdx)
		bIdx = bIdx + 1 % currentOpcs.length;
	b = currentOpcs[bIdx];
	return true;
}

/** @param {HTMLElement} opc @param {Item} item */
function SetOpc(opc, item) {
	opc.innerHTML = item.name;
	opc.style.backgroundColor = item.background;
	opc.style.color = item.color;
}

function ShowResult() {
	let str = "";
	for (let lvl = 0; lvl < opcs.length; lvl++) {
		for (let i = 0; i < opcs.length; i++)
			if (opcs[i].level === lvl) {
				str += opcs[i].name + "\n";
				break;
			}
	}
	console.log(str);
	result.innerHTML = str.replaceAll("\n", "\<br\>");
	result.hidden = false;
}


//#region COLOR

/** @param {Number} min @param {Number} max */
function RandomInt(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min)
}

/** @param {String} text */
function RandomColorFromText(text) {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		let n = text.charCodeAt((i * i >> 2) % text.length);
		color += letters[Math.floor(n % letters.length)];
	}
	return color;
}

function RandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];
	return color;
}

/** @param {String} hex @param {Boolean} blackWhite */
function InvertColor(hex, blackWhite) {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error('Invalid HEX color.');
	}
	let r = parseInt(hex.slice(0, 2), 16),
		g = parseInt(hex.slice(2, 4), 16),
		b = parseInt(hex.slice(4, 6), 16);
	if (blackWhite) {
		// https://stackoverflow.com/a/3943023/112731
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186
			? '#000000'
			: '#FFFFFF';
	}
	// invert color components
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);
	// pad each with zeros and return
	return "#" + padZero(r) + padZero(g) + padZero(b);
}

//#endregion