//dataset: HAPPINESS INDEX. Pagina di dettaglio. 
//Il Paese arriva dalla pagina generale tramite l'indirizzo
//Per ogni anno dal 2005 al 2020 un glifo di 4 barre mostra i 4 indici di felicità del Paese

let data;
let selCountry;
let countryRows = [];

let firstYear = 2005;
let lastYear = 2020;

let maxPos = 0;
let maxNeg = 0;
let maxCor = 0;
let minGen = Infinity;
let maxGen = -Infinity;

let rightSpace = 200;
let topSpace = 150;
let margin = 50; 

let colorScale = {
   'positive': '#f47820',
  'negative': '#3a6ea5',
  'corruption': '#E6D9FF',
  'generosity': '#DFF5EA'
}

async function setup() {
    createCanvas(windowWidth, windowHeight);

    //carico il CSV
    data = await loadTable("assets/happinessDetail.csv", ",", "header");

    let params = getURLParams();
    selCountry = "";

    if(params.country) {
        selCountry = decodeURIComponent(params.country);
    }

    countryRows = data.findRows(selCountry, "Country");

    for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let row = data.getRow(rowNumber);
    let pos = readValue(row, "positive");
    let neg = readValue(row, "negative");
    let cor = readValue(row, "corruption");
    let gen = readValue(row, "generosity");

    if (pos > maxPos) maxPos = pos;
    if (neg > maxNeg) maxNeg = neg;
    if (cor > maxCor) maxCor = cor;
    if (gen > maxGen) maxGen = gen;
    if (gen < minGen) minGen = gen;
  }
}

//funzione per evitare che i dati mancanti diano problemi bloccando il codice
function readValue(row, column) {
  let cell = row.get(column);
  if (cell == "") {
    return NaN; //se non c'è niente restituisco Not a Number
  } else {
    return parseFloat(cell); //converto in numero
  }
}

function draw() {
    
    background('black');

    //griglia per tutti i glifi = charts
    let gridWidth = windowWidth - rightSpace - 2*margin;
    let gridHeight = windowHeight - topSpace - 2*margin;

    let lineY = topSpace + gridHeight;

    let yearsNum = lastYear - firstYear + 1;

    let chartWidth = gridWidth / yearsNum; 
    let chartHeight = gridHeight-100; 

    stroke('grey');
    strokeWeight(1);
    line(margin, lineY, margin + gridWidth, lineY); //linea temporale
    noStroke();
    fill('grey');
    textSize(14);
    textStyle(NORMAL);
    textAlign(CENTER);
    for (let i=0; i<yearsNum; i++) {
      text(firstYear + i, margin + i*chartWidth +15, lineY + 20); //anni 
    }

    //glifo = chart
    for (let rowNumber = 0; rowNumber < countryRows.length; rowNumber++) {
      let row = countryRows[rowNumber];
      let year = int(row.get("Year"));
      let chartX = margin + (year-firstYear)* chartWidth;

    drawChart(row, chartX, lineY, chartWidth, chartHeight);
    }
  }

//prova glifo
function drawChart (row, x, y, w, h) {

    let values = [readValue(row, "positive"), readValue(row, "negative"), readValue(row, "corruption"), readValue(row, "generosity")];
    let minimums = [0, 0, 0, minGen];
    let maximums = [maxPos, maxNeg, maxCor, maxGen];

    let colors = [colorScale.positive, colorScale.negative, colorScale.corruption, colorScale.generosity];

    for (let i = 0; i < 4; i++) {
        if(isNaN(values[i])) continue; //se il dato è mancante non disegna niente

        let barH = map(values[i], minimums[i], maximums[i], 0, h);
        let barW = w/4 -4; 
        fill(colors[i]);
        rect (x + i*barW, y-barH, barW, barH);
    }
}