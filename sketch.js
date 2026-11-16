//dataset: HAPPINESS INDEX. Pagina generale.
//Nella visualizzazione ogni Paese è un glifo rappresentato da una faccina
//Ogni faccina sarà colorata dal gradiente freddo-caldo del 'saldo emotivo'(=emozioni positive-negative) medio del Paese

let data;

let minSaldo = Infinity;
let maxSaldo = -Infinity;

let margin = 50;
let gutter = 4;

let topSpace = 200; //spazio per il titolo
let rightSpace = 250; //spazio per la legenda

//valori presi da 0 a 1 per stabilire i limiti del saldo emotivo
let lowLimit = 0.4; //da 0 a 0.4 saldo basso, da 0.4 a 0.65 saldo medio, da 0.65 a 1 saldo alto
let highLimit = 0.65; 

let label = ""; 

let colorScale = {
  'cold': '#3a6ea5',
  'mid': '#eee8d2',
  'warm': '#f47820',
  'missing': '#c8c8c8',
  'features': '#282828'
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('p5.js version:', p5.VERSION);
  // put setup code here
  
  //Carico il CSV
  data = await loadTable("assets/happinessIndex.csv", ",", "header");

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let saldo = readSaldo(rowNumber);
    if (saldo > maxSaldo) maxSaldo = saldo;
    if (saldo < minSaldo) minSaldo = saldo;
  }
}

//funzione per evitare che i dati mancanti diano problemi bloccando il codice
function readSaldo(rowNumber) {
  let cell = data.getString(rowNumber, "saldo");
  if (cell == "") {
    return NaN; //se non c'è niente restituisco Not a Number
  } else {
    return parseFloat(cell); //converto in numero
}
}

function draw() {
  // put drawing code here

  background('black');

  //griglia
  let gridWidth = windowWidth - rightSpace - 2 * margin;
  let gridHeight = windowHeight - topSpace - margin;

  let numberOfCountries = data.getRowCount();
  let cols = ceil(sqrt(numberOfCountries * gridWidth / gridHeight));
  let rows = ceil(numberOfCountries / cols);

  //dimensioni faccina
  let faceWidth = (gridWidth - (cols - 1) * gutter) / cols;
  let faceHeight = (gridHeight - (rows - 1) * gutter) / rows;
  let face = min(faceWidth, faceHeight);

  label = "";
  let hoverSaldo; 
  let hoverX; 
  let hoverY;

  for (let rowNumber = 0; rowNumber < numberOfCountries; rowNumber++) {
    let col = rowNumber % cols;
    let row = floor(rowNumber / cols);
    let x = margin + col * (face + gutter);
    let y = topSpace + row * (face + gutter);

     drawGlyph(readSaldo(rowNumber), x, y, face);
  
  //verifico se il puntatore si trova sopra la faccina e memorizzo il Paese
  if (
    mouseX >= x &&
    mouseX <= x + face &&
    mouseY >= y &&
    mouseY <= y +face
  ) {
    label = data.getString(rowNumber, "Country");
    hoverSaldo = readSaldo(rowNumber); 
    hoverX = x + face / 2;
    hoverY = y + face / 2;
    }
  }

  if (label != "") {
    
    noFill();
    stroke('white');
    strokeWeight(3);
    circle(hoverX, hoverY, face + 4);
    noStroke(); //evidenzio con bordo bianco

    let saldoText;
    if(isNaN(hoverSaldo)) {
      saldoText = "Saldo Emotivo: dato mancante";
    } else {
      saldoText = "Saldo Emotivo: "+ hoverSaldo;
    }

    textSize(14);
    textStyle(NORMAL);
    textAlign(LEFT);
    let cW = textWidth(label);
    textStyle(BOLD);
    let sW = textWidth(saldoText);
    let tW = max(cW, sW); 
    fill('white'); 
    rect(mouseX + 8, mouseY + 8, tW+16, 26*2); //targetta bianca
    fill('black');
    text(label, mouseX + 16, mouseY + 26); //inserisco il nome del Paese
    text(saldoText, mouseX + 16, mouseY + 44); //inserisco il saldo emotivo del Paese
  }

  drawTitle();
  drawLegend(gridWidth);

}

//disegno il glifo faccina
function drawGlyph(saldo, x, y, s) {
  noStroke();
  let cx = x + s / 2;      // centro della faccina
  let cy = y + s / 2;


  if (isNaN(saldo)) { //isNan risponde true o false
    fill(colorScale.missing);
    circle(cx, cy, s);
    return;  //se il saldo è mancante la faccina è neutra
  }

  // map() porta il saldo su una scala da 0 a 1 (sorta di proporzione)
  let t = map(saldo, minSaldo, maxSaldo, 0, 1);

  //faccia
  fill(gradientColor(t));
  circle(cx, cy, s);

  //occhi
  fill(colorScale.features);
  circle(cx - s * 0.18, cy - s * 0.1, s * 0.1);
  circle(cx + s * 0.18, cy - s * 0.1, s * 0.1);

  //bocca
  noFill();
  stroke(colorScale.features);
  strokeWeight(max(1, s*0.06));
  strokeCap(ROUND); // estremi arrotondati

  if (t < lowLimit) {
    arc(cx, cy + s * 0.28, s * 0.5, s * 0.4, PI, TWO_PI, OPEN);
  } else if ( t < highLimit) {
    line(cx - s * 0.22, cy + s * 0.2, cx + s * 0.22, cy + s * 0.2);
  } else {
  arc(cx, cy + s * 0.05, s * 0.5, s * 0.4, 0, PI, OPEN);
  }

  noStroke();
}

function gradientColor(t) {
  if (t < 0.5) {
    return lerpColor(color(colorScale.cold), color(colorScale.mid), t * 2);
  } else {
  return lerpColor(color(colorScale.mid), color(colorScale.warm), (t - 0.5) * 2);
  }
}//lerpColor mi dà un gradiente più preciso invece di solo 3 colori di differenzazione

function drawTitle() {
  noStroke();
  fill('white');
  textAlign(LEFT);
  textSize(30);
  textStyle(BOLD);
  textFont('Inter');
  const head1 = "Happiness Index";
  text(head1, margin, margin+20);

  noStroke();
  fill('white');
  textSize(14);
  textStyle(NORMAL);
  textFont('Inter');
  const head2 = "Le emoji rappresentate visualizzano gli indici medi di felicità per 166 paesi.";
  text(head2, margin, margin+60);

  const text1 = "L'indice medio di felicità è calcolato in base al saldo emotivo registrato per ogni Paese, fra il 2005 e il 2020.";
  text(text1, margin, margin+80);

  const text2 = "Clicca sulle emoji per conoscere i 4 indicatori di felicità relativi ad ogni anno, del Paese selezionato.";
  text(text2, margin, margin+120);
}

function drawLegend(gW) {

  noStroke();
  textAlign(LEFT);
  textSize(12);
  fill('white');

  let xLegend = margin + gW + margin;
  let yLegend = topSpace+20;

  text("Saldo emotivo = ", xLegend, yLegend);
  text("emozioni positive - emozioni negative", xLegend, yLegend+20);

  text("Gradiente colore", xLegend, yLegend+100);
  let barW = 200;
  for (let i = 0; i < barW; i++) {
    let r = i/barW;
    fill(gradientColor(r));
    rect(xLegend+i, yLegend+115, 1, 25);
  } //il gradiente lo formo con tanti rettangoli sottili colorati diversi

  fill('white');
  textSize(10);
  textStyle(ITALIC);

  text("↓ saldo basso", xLegend, yLegend+150);
  text("saldo alto ↑", xLegend+barW-60, yLegend+150);

  fill('grey');
  textSize(12);

  text("I glifi neutri non hanno abbastanza", xLegend, yLegend+500);
  text("dati per determinare il saldo emotivo.", xLegend, yLegend+520);
}

function mousePressed() {
  if (label != "") {
    window.location.href = "detail.html?country=" + encodeURIComponent(label);
  }
}