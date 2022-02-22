/** @type {HTMLButtonElement} */
const opcA = document.querySelector('#opc-a');
/** @type {HTMLButtonElement} */
const opcB = document.querySelector('#opc-b');
/** @type {HTMLDivElement} */
const result = document.querySelector('#result');
result.hidden = true;

class Item {
	constructor(name, value, power, background, color) {
		/** @type {String} */
		this.name = name;
		/** @type {Number} */
		this.value = value;
		/** @type {Number} */
		//max of 52 items...
		this.power = power;
		/** @type {String} */
		this.background = background;
		/** @type {String} */
		this.color = color;
	}



};

let opcs = [];
fetch('./opcs.json')
.then(response => response.json())
.then(data => {
	opcs = data.map((element, index) => {
		let c = RandomColor();
		return new Item(element, 0, Math.pow(2, index), c, InvertColor(c, true));
	});
	Next();
});

//#region

var done = [];

/** @type {Item} */
let a;
/** @type {Item} */
let b;

function DoneAdd(a, b, winner) {
	done.push({ sum: a.power + b.power, winner: winner });
}

function OnOpcClick(item, other) {
	if (!item)
		return;
	item.value++;
	DoneAdd(item, other, item);
	Next();
}

opcA.onclick = () => OnOpcClick(a, b);
opcB.onclick = () => OnOpcClick(b, a);

let level = 0;
let pointer = 0;

function Next() {

	if (pointer > -1) {
		console.clear();
		console.table(opcs);
	}

	a = undefined;
	b = undefined;
	for (let i = 0; i < opcs.length; i++) {
		if (opcs[i].value == level) {
			if (!a)
				a = opcs[i];
			else if (!b)
				b = opcs[i];
		}

		if (a && b) {
			let d = done.find(el => el.sum === a.power + b.power);
			if (d)
				d.winner.value++;
		}
	}

	if (a) {
		if (b) {
			SetOpc(opcA, a);
			SetOpc(opcB, b);
		}
		else {
			level++;
			Next();
			return;
		}
	}
	else
		if (!b) {
			pointer = -1;
			ShowResult();
		}

}

function SetOpc(opc, item) {
	opc.innerHTML = item.name;
	opc.style.backgroundColor = item.background;
	opc.style.color = item.color;
}

function ShowResult() {
	let final = "";
	for (let lvl = 0; lvl < opcs.length; lvl++) {
		for (let i = 0; i < opcs.length; i++)
			if (opcs[i].value == lvl) {
				final += opcs[i].name + "\<br\>";
				break;
			}
	}
	result.innerHTML = final;
	result.hidden = false;
}


//#region COLOR

function RandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];
	return color;
}

function InvertColor(hex, bw) {
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
	var r = parseInt(hex.slice(0, 2), 16),
		g = parseInt(hex.slice(2, 4), 16),
		b = parseInt(hex.slice(4, 6), 16);
	if (bw) {
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