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

let rightSpace = 200; //spazio per la legenda
let topSpace = 150; //spazio per il titolo
let margin = 50; 

let hoverChart = null; 

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

    hoverChart = null;
    //glifo = chart
    for (let rowNumber = 0; rowNumber < countryRows.length; rowNumber++) {
      let row = countryRows[rowNumber];
      let year = int(row.get("Year"));
      let chartX = margin + (year-firstYear)* chartWidth;

    //verifico se il puntatore si trov sopra i charts, evidenzio la zona e memorizzo la riga del dataset relatiova al grafico
    if (
      mouseX >= chartX &&
      mouseX <= chartX + chartWidth-16 &&
      mouseY >= lineY-chartHeight &&
      mouseY <= lineY
    ) {
      hoverChart = row;
      fill(255, 40);
      noStroke();
      rect(chartX, lineY-chartHeight, chartWidth-16, chartHeight);
    }

    drawChart(row, chartX, lineY, chartWidth, chartHeight);

    }

    drawTitle();
    drawLegend(gridWidth);

    //metto qui i valori specifici degli indicatori (con l'hover), perchè nell'if prima si sarebbero disegnati sotto i grafici a barre
    if (hoverChart != null) {
      let ind = ["positive", "negative", "corruption", "generosity"];
      let nameInd = ["Emozioni positive", "Emozioni negative", "Percezione corruzione", "Generosità"];

      fill('white');
      rect(mouseX + 8, mouseY + 5, 175, 70); //targhetta bianca
      fill ('black');
      textAlign(LEFT);
      textSize(12);

      for(let i = 0; i < 4; i++) {
        let I = readValue(hoverChart, ind[i]);
        text(nameInd[i] + ": " + I, mouseX + 12, mouseY + 20 + i*16); //inserisco nome e valore degli indicatori
      }
    }
  }

//disegno il chart
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


function drawTitle () {
  noStroke();
  fill('white');
  textAlign(LEFT);
  textSize(14);
  textFont('Inter');
  const textLink = "← Torna alla pagina iniziale";
  text(textLink, margin, 30);

  noStroke();
  fill('white');
  textSize(30);
  textStyle(BOLD);
  const head1 = "Happiness Index: " + selCountry;
  text(head1, margin, margin+20);

  textSize(14);
  textStyle(NORMAL);
  const text1 = "Per ogni anno dal 2005 al 2020 un grafico a barre visualizza i 4 indicatori di felicità del Paese.";
  text(text1, margin, margin+60);
}

function drawLegend (gW) {
  noStroke();
  textAlign(LEFT);
  textSize(12);
  fill('white');

  let yLegend = topSpace+20;
  let xLegend = margin + gW + 25;

  text("Ogni gruppo di 4 barre è un anno. Ogni barra corrisponde a:", xLegend, yLegend, 200, 50);

  let ind = ["Emozioni positive", "Emozioni negative", "Percezione corruzione", "Generosità"];
  let colors = [colorScale.positive, colorScale.negative, colorScale.corruption, colorScale.generosity];

  for (let i=0; i<4; i++) {
    fill(colors[i]);
    rect (xLegend, yLegend + 40 + i*22, 12, 12);
    fill('white');
    text(ind[i], xLegend + 20, yLegend + 52 + i*22);
  }

  text("Passa il mouse sui grafici per scoprire il valore degli indicatori di felicità.", xLegend, yLegend + 170, 200, 50);

  fill('grey');
  textStyle(ITALIC);
  text("Tutti i grafici si basano su una scala da zero al valore massimo, valido per tutti i Paesi. Laddove non compare il grafico, i dati non sono sufficienti per calcolarne gli indicatori.", xLegend, yLegend + 440, 200, 100);
}

//link per tornare alla pagina index
function mousePressed() {
  if(
    mouseX >= margin &&
    mouseX <= margin + textWidth("← Torna alla pagina iniziale") &&
    mouseY >= 15 &&
    mouseY <= 35
  ) {
    window.location.href = "index.html";
  }
}