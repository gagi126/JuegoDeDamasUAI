var nombreBlancas = document.getElementById("playerOne").value;
var nombreRojas = document.getElementById("playerTwo").value;
var kBoardWidth = 8;
var kBoardHeight= 8;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);
var kFilasIniciales = 3;
var kRojas = "#FF0000";
var kBlancas = "#ffffff";

var turnoBlancas; // Para el control de turnos. 
var turnoRojas; 

var sonTablas = false; 
var acuerdoTablas = false; 

var indiceABorrar = -1; // Para borrar una pieza. 
var legalMoves; // Para los movimientos legales. 


var gCanvasElement;
var gDrawingContext;
var gPattern;

var piezas = [];

let playerOnePoints = 0;
let playerTwoPoints = 0;

var gNumPieces= 24; // Controla las piezas metidas en memoria. 
var gNumMoves =0; // Cuenta los movimientos sin que se produzca un salto. 

var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
let gMoveCount = 0;
let gMoveCountElem = 0;
var gGameInProgress;



let gamesHistory = localStorage.getItem('gamesHistory')
  ? JSON.parse(localStorage.getItem('gamesHistory'))
  : [];
//Dibuja el tablero
  function drawBoard() {

    // Actualiza el contador de movimientos en el documento si el elemento existe.
    var gMoveCountElem = document.getElementById('gMoveCountElem');
    if (gMoveCountElem !== null) {
        gMoveCountElem.innerHTML = gMoveCount;
    } else {
        console.error("El elemento con el ID 'gMoveCountElem' no existe en el documento.");
    }

    // Borra el lienzo de dibujo.
    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    // Inicia un nuevo trazado de dibujo.
    gDrawingContext.beginPath();

    /* Dibuja líneas verticales para crear el tablero de ajedrez */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
        gDrawingContext.moveTo(0.5 + x, 0);
        gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }

    /* Dibuja líneas horizontales para crear el tablero de ajedrez */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
        gDrawingContext.moveTo(0, 0.5 + y);
        gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }

    /* Establece el color y dibuja las líneas del tablero */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();

    // Dibuja las piezas en el tablero.
    for (var i = 0; i < piezas.length; i++) {
        if (piezas[i] instanceof Reina) {
            // Dibuja una reina.
            drawQueen(piezas[i], piezas[i].color, i === gSelectedPieceIndex);
        } else {
            // Dibuja una pieza genérica.
            drawPiece(piezas[i], piezas[i].color, i === gSelectedPieceIndex);
        }
    }

    // Actualiza el contador de movimientos.
    gMoveCountElem.innerHTML = gMoveCount;

    // Si el juego está en progreso y ha terminado, finaliza el juego.
    if (gGameInProgress && isTheGameOver()) {
        endGame();
    }
}


function drawPiece(p, color, selected) {
    // Obtiene la columna y la fila de la pieza.
    var column = p.column;
    var row = p.row;

    // Calcula las coordenadas del centro de la pieza.
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);

    // Calcula el radio de la pieza y su grosor de borde.
    var radius = (kPieceWidth/2) - (kPieceWidth/10);

    // Inicia un nuevo trazado de dibujo.
    gDrawingContext.beginPath();

    // Dibuja un círculo para representar la pieza.
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);

    // Cierra el trazado.
    gDrawingContext.closePath();

    // Establece el color de relleno de la pieza.
    gDrawingContext.fillStyle = color;
    gDrawingContext.fill();

    // Establece el color del borde de la pieza.
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();

    // Si la pieza está seleccionada, cambia el color de relleno.
    if (selected) {
        gDrawingContext.fillStyle = "#ff0000";
        gDrawingContext.fill();
    }
}

function drawQueen(p, color, selected) {
    // Obtiene la columna y la fila de la reina.
    var column = p.column;
    var row = p.row;

    // Calcula las coordenadas del centro de la reina.
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);

    // Calcula el radio de la reina y su grosor de borde.
    var radius = (kPieceWidth/2) - (kPieceWidth/10);

    // Inicia un nuevo trazado de dibujo.
    gDrawingContext.beginPath();

    // Dibuja un círculo para representar la reina.
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);

    // Cierra el trazado.
    gDrawingContext.closePath();

    // Establece el color de relleno de la reina.
    gDrawingContext.fillStyle = color;
    gDrawingContext.fill();

    // Establece el color del borde de la reina.
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();

    // Si la reina está seleccionada, cambia el color de relleno.
    if (selected) {
        gDrawingContext.fillStyle = "#ff0000";
        gDrawingContext.fill();
    }    

    // Dibuja una corona circular alrededor de la reina.
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius + 2.5, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();
}


function getCursorPosition(e) {
    var x;
    var y;

    // Verifica si las coordenadas están disponibles en el evento.
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        // Calcula las coordenadas relativas al desplazamiento del documento.
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    // Ajusta las coordenadas para la posición del canvas.
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;

    // Limita las coordenadas a los límites del tablero.
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);

    // Calcula la celda correspondiente en el tablero de ajedrez.
    var cell = new Casilla(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
    return cell;
}


function getLegalMoves() {
    var theLegalMoves = [];
    var z = 0;

    // Itera sobre todas las piezas del tablero.
    while (z < piezas.length) {
        // Verifica si es el turno del jugador y el color de la pieza coincide con el turno.
        if (((turnoBlancas) && (kBlancas === piezas[z].color)) || ((turnoRojas) && (kRojas === piezas[z].color))) {
            // Obtiene los movimientos legales para una sola pieza.
            var nuevosMovimientos = getLegalMovesPieza(piezas[z]);

            // Ordena los saltos y movimientos legales.
            var t = 0;
            while (t < nuevosMovimientos.length) {
                // Se quitan los saltos y se ponen al principio de theLegalMoves.
                if (nuevosMovimientos[t] instanceof Jump) {
                    var oneJump = nuevosMovimientos.splice(t, 1);
                    theLegalMoves = oneJump.concat(theLegalMoves); // Concatena los saltos al inicio.
                } else {
                    t++;
                }
            }

            // Concatena los nuevosMovimientos con theLegalMoves.
            theLegalMoves = theLegalMoves.concat(nuevosMovimientos);
        }
        z++;
    }

    return theLegalMoves;
}


function getLegalMovesPieza(unaPieza){
	var i = -1;
	var fila=0; 
	var columna=0; 
	var someLegalMoves=[];
	var vacia = false; 
	
	while (i <2){
		if (((unaPieza.row != 0)&&(turnoBlancas))||((unaPieza.row != 7)&&(turnoRojas))){ // Si estan al final del tablero, no hay movimientos posibles
			if (((unaPieza.column != 0)&& (i==-1))||((unaPieza.column != 7)&& (i==1))){ // Si est�n en una esquina del tablero, solo hay que comprobar uno de los laterales
				if (turnoBlancas){ // As� controlamos la direcci�n de la pieza
					fila = unaPieza.row -1;
					columna = unaPieza.column +i; 
				}
				else {
					fila = unaPieza.row +1;
					columna = unaPieza.column +i; 
				}
				var j = 0; 
				var existe = false; 
				while ((j<piezas.length) && (existe===false)){ // Si hay una pieza en la casilla a la que nos queremos mover, no nos podemos mover, a menos que se pueda saltar
					if ((piezas[j].row === fila) && (piezas[j].column === columna)){
						existe = true; 
						if (piezas[j].color != unaPieza.color){ // Si son de distinto color, igual se puede saltar
							if ((i<0)&&(turnoBlancas)&&(unaPieza.column >= 2)&&(unaPieza.row >= 2)){ // Miramos si, siendo blancas, tienen sitio para saltar 
								fila = unaPieza.row -2;
								columna = unaPieza.column -2; 
								vacia = casillaVacia(fila, columna); // Si tiene sitio y est� vac�a, hay sitio para hacer un salto
							}
							else if ((i>0)&&(turnoBlancas)&&(unaPieza.column <= 5)&&(unaPieza.row >= 2)){ // Miramos si, siendo blancas, tienen sitio para saltar 
								fila = unaPieza.row -2;
								columna = unaPieza.column +2; 
								vacia = casillaVacia(fila, columna);  // Si tiene sitio y est� vac�a, hay sitio para hacer un salto
							}
							else if ((i<0)&&(turnoRojas)&&(unaPieza.column >= 2)&&(unaPieza.row <= 5)){ // Lo mismo para Rojas
								fila = unaPieza.row +2;
								columna = unaPieza.column -2; 
								vacia = casillaVacia(fila, columna); 	
							}
							else if ((i>0)&&(turnoRojas)&&(unaPieza.column <= 5)&&(unaPieza.row <= 5)){
								fila = unaPieza.row +2;
								columna = unaPieza.column +2; 
								vacia = casillaVacia(fila, columna); 	
							}
						}
					}
					else {
						j++; 
					}
				}	
				if ((existe === false)){ // Si la casilla contigua est� libre, se puede mover.
					var aMove = new Move(unaPieza.row, unaPieza.column, fila, columna); 
					someLegalMoves.push(aMove); 
				}
				else if ((existe === true) && (vacia===true)){  //Si no est� libre pero se puede hacer un salto, tambi�n.
					var aJump = new Jump(unaPieza.row, unaPieza.column, fila, columna); 
					someLegalMoves.unshift(aJump); // Los saltos quedan los primeros. 
				}
			}
		}
		i = i+2; 
	}	
	return someLegalMoves; 
}

function gestorClick(e) {
    // Obtiene la posición de la casilla en la que se hizo clic.
    var casilla = getCursorPosition(e);

    // Itera a través de las piezas para determinar si se hizo clic en una pieza.
    for (var i = 0; i < gNumPieces; i++) {
        if ((piezas[i].row === casilla.row) && (piezas[i].column === casilla.column)) {
            // Se hace clic en una pieza, llama a la función para manejar el clic en la pieza.
            clickOnPiece(i);
            return;
        }
    }

    // Si no se hizo clic en una pieza, llama a la función para manejar el clic en una celda vacía.
    clickOnEmptyCell(casilla);
}

function clickOnPiece(indicePieza) {
    // Reinicia el mensaje de turno incorrecto.
    document.getElementById('isNotYourTurn').innerHTML = '';

    // Verifica si es el turno del jugador y si la pieza es del color correcto.
    if ((turnoBlancas && (piezas[indicePieza].color === kBlancas)) || 
        (turnoRojas && (piezas[indicePieza].color === kRojas))) {
        // Si ya se había seleccionado la misma pieza, no hace nada.
        if (gSelectedPieceIndex === indicePieza) {
            return;
        }

        // Actualiza el índice de la pieza seleccionada y el estado de movimiento.
        gSelectedPieceIndex = indicePieza;
        gSelectedPieceHasMoved = false;

        // Vuelve a dibujar el tablero.
        drawBoard();
    } else {
        // Muestra un mensaje si no es el turno del jugador.
        document.getElementById('isNotYourTurn').innerHTML = '¡No es tu turno!';
    }
}


function clickOnEmptyCell(cell) {
    // Comprobar si hay un empate por tablas.
    comprobarTablas();

    // Si no hay una pieza seleccionada, no hace nada.
    if (gSelectedPieceIndex === -1) {
        return;
    }

    // Determina la dirección del movimiento en función del color de la pieza seleccionada.
    var direccion = 1;
    if (piezas[gSelectedPieceIndex].color === kBlancas) {
        direccion = -1;
    }

    // Calcula las diferencias de fila y columna.
    var rowDiff = direccion * (cell.row - piezas[gSelectedPieceIndex].row);
    var columnDiff = direccion * (cell.column - piezas[gSelectedPieceIndex].column);

    if ((rowDiff === 1 && Math.abs(columnDiff) === 1) && (!(legalMoves[0] instanceof Jump))) {
        // Muestra el movimiento realizado.
        mostrarMovimiento(piezas[gSelectedPieceIndex], cell, false);

        // Actualiza la posición de la pieza.
        piezas[gSelectedPieceIndex].row = cell.row;
        piezas[gSelectedPieceIndex].column = cell.column;

        // Comprueba si la pieza debe coronarse.
        comprobarCoronacion();

        // Cambia el turno y actualiza el contador de movimientos.
        cambioTurno();
        gMoveCount += 1;

        // Reinicia el índice de la pieza seleccionada y su estado de movimiento.
        gSelectedPieceIndex = -1;
        gSelectedPieceHasMoved = false;

        // Vuelve a dibujar el tablero y comprueba si hay un empate por tablas.
        drawBoard();
        gNumMoves += 1;
        comprobarTablas();
        return;
    } else if (rowDiff === 1 && Math.abs(columnDiff) === 1 && legalMoves[0] instanceof Jump) {
        // Muestra un mensaje si hay saltos disponibles para comer piezas.
        document.getElementById('eatPiece').innerHTML = '¡Puedes comer piezas fáciles!';
    } else if (Math.abs(rowDiff) === 2 && Math.abs(columnDiff) === 2 && isThereAPieceBetween(piezas[gSelectedPieceIndex], cell) && legalMoves[0] instanceof Jump) {
        if (!gSelectedPieceHasMoved) {
            gMoveCount += 1;
        }

        // Muestra el movimiento realizado.
        mostrarMovimiento(piezas[gSelectedPieceIndex], cell, true);

        // Actualiza la posición de la pieza.
        piezas[gSelectedPieceIndex].row = cell.row;
        piezas[gSelectedPieceIndex].column = cell.column;

        // Borra la pieza comida y comprueba si la pieza debe coronarse.
        if (indiceABorrar > gSelectedPieceIndex) {
            borrarPieza();
            comprobarCoronacion();
        } else {
            comprobarCoronacion();
            borrarPieza();
        }

        // Reinicia el índice de la pieza seleccionada y su estado de movimiento.
        gSelectedPieceIndex = -1;
        gSelectedPieceHasMoved = false;

        // Cambia el turno y vuelve a dibujar el tablero.
        cambioTurno();
        drawBoard();
        return;
    } else if ((rowDiff === 1 && Math.abs(columnDiff) === 1) && (legalMoves[0] instanceof Jump)) {
        // Muestra un mensaje si hay saltos disponibles para comer piezas.
        alert("Hay saltos fáciles disponibles, revise la jugada.");
    } else if ((Math.abs(rowDiff) === 2 && Math.abs(columnDiff) === 2) && isThereAPieceBetween(piezas[gSelectedPieceIndex], cell) && (legalMoves[0] instanceof Jump)) {
        if (!gSelectedPieceHasMoved) {
            gMoveCount += 1;
        }

        // Muestra el movimiento realizado.
        mostrarMovimiento(piezas[gSelectedPieceIndex], cell, true, nombreBlancas, nombreRojas);

        // Actualiza la posición de la pieza.
        piezas[gSelectedPieceIndex].row = cell.row;
        piezas[gSelectedPieceIndex].column = cell.column;

        // Borra la pieza comida y comprueba si la pieza debe coronarse.
        if (indiceABorrar > gSelectedPieceIndex) {
            borrarPieza();
            comprobarCoronacion();
        } else {
            comprobarCoronacion();
            borrarPieza();
        }

        // Reinicia el índice de la pieza seleccionada y su estado de movimiento.
        gSelectedPieceIndex = -1;
        gSelectedPieceHasMoved = false;

        // Cambia el turno y vuelve a dibujar el tablero.
        cambioTurno();
        drawBoard();
        return;
    }

    // Reinicia el índice de la pieza seleccionada y su estado de movimiento.
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;

    // Vuelve a dibujar el tablero.
    drawBoard();
}


function clearbanner()
{
	document.getElementById('eatPiece').innerHTML = '';
}
function clearInformationTexts() {
  document.getElementById('eatPiece').innerHTML = '';
  document.getElementById('cannotEatPieceSameColor').innerHTML = '';
  document.getElementById('endGameText').innerHTML = '';
  document.getElementById('esTurno').innerHTML = '';
}

function clearEndGameTexts() {
  document.getElementById('isNotYourTurn').innerHTML = '';
  document.getElementById('eatPiece').innerHTML = '';
  document.getElementById('cannotEatPieceSameColor').innerHTML = '';
  document.getElementById('esTurno').innerHTML = '';
}

function mostrarMovimiento(casilla1, casilla2, salto) {
  let playerOne = localStorage.getItem('playerOne');
  let playerTwo = localStorage.getItem('playerTwo');
  var movimiento = document.createElement("p");
  if (turnoBlancas) {
	  if(salto)
	  {
		   playerOnePoints += 10;
      document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints;
	  }
    document.getElementById("moveBlancas").appendChild(movimiento);
	document.getElementById('esTurno').innerHTML = `Es turno del jugador rojo: ${playerTwo} !`;
  } else {
	  if(salto)
	  {
		playerTwoPoints += 10;
      document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints; 
	  }
    document.getElementById("moveRojas").appendChild(movimiento);
	document.getElementById('esTurno').innerHTML = `Es turno del jugador blanco: ${playerOne} !`;
  }
}

function comprobarCoronacion(){
	if(((turnoBlancas) && (piezas[gSelectedPieceIndex].color === kBlancas) && (piezas[gSelectedPieceIndex].row === 0)) || 
	((turnoRojas) && (piezas[gSelectedPieceIndex].color === kRojas) && (piezas[gSelectedPieceIndex].row === 7))){
		var candidata = piezas.splice(gSelectedPieceIndex, 1); 
		coronar(candidata[0]); 
	}
}

function cambioTurno(){
	if (turnoBlancas){
		clearbanner()
		turnoBlancas=false; 
		turnoRojas=true; 
	}
	else {
		clearbanner()
		turnoBlancas=true; 
		turnoRojas=false; 
	}
}

function isThereAPieceBetween(casilla1, casilla2) {
	var existe = false; 
	var i = 0; 
	var fila = 0; 
	var columna = 0; 
	
	if ((turnoBlancas) && (casilla2.column- casilla1.column === -2) && (casilla2.row- casilla1.row === -2)){ // Hacia arriba a la izquierda
		columna = casilla1.column -1; 
		fila = casilla1.row -1; 
	}
	else if ((turnoBlancas) && (casilla2.column-casilla1.column === 2) && (casilla2.row- casilla1.row === -2)){ // Hacia arriba a la derecha
		columna = casilla1.column +1; 
		fila = casilla1.row -1; 
	}
	else  if((turnoRojas) && (casilla2.column- casilla1.column === -2 ) && (casilla2.row- casilla1.row === 2)){ // Hacia abajo a la izquierda
		columna = casilla1.column -1; 
		fila = casilla1.row +1; 
	}
	else  if((turnoRojas) && (casilla2.column- casilla1.column === 2) && (casilla2.row- casilla1.row === 2)){ // Hacia abajo a la derecha
		columna = casilla1.column +1; 
		fila = casilla1.row +1; 
	}
	while ((i<piezas.length) && (existe===false)){ 
		if ((piezas[i].row === fila) && (piezas[i].column === columna)){
			if (casilla1.color !==piezas[i].color){ // No puedes comer fichas de tu mismo color
				existe = true; 
				indiceABorrar = i; 
			}
			else {
				alert("No puedes comer fichas de tu mismo color"); 
			}
		}
		i++;
	}
	return existe; 
}

function borrarPieza(){
	piezas.splice(indiceABorrar, 1); 
	indiceABorrar = -1; 
	gNumPieces--;
}

function comprobarTablas(){
	if ((gNumMoves >=40)){
		sonTablas = true; 
		endGame(); 
	}
}

function isTheGameOver(){
	legalMoves = getLegalMoves(); 
	if (legalMoves.length === 0){
		return true;
	}
	else {
		return false; 
	}
}

function casillaVacia(fila, columna){
	var y = 0; 
	var vacia = true; 
	while ((y<piezas.length) && (vacia===true)){
		if ((piezas[y].row ===fila) && (piezas[y].column === columna)){
			vacia = false; 
		}
		else {
			y++;
		}	
	}
	return vacia; 
}

function coronar(peon){
	piezas.push(new Reina(peon.row, peon.column, peon.color)); 
}

function getPlayersNames() {
  let playerOne = document.getElementById('playerOne').value;
  let playerTwo = document.getElementById('playerTwo').value;

  if (playerOne && playerTwo) {
    localStorage.setItem('playerOne', playerOne);
    localStorage.setItem('playerTwo', playerTwo);
    document.getElementById(
      'esTurno'
    ).innerHTML = `Empieza el jugador blanco : ${playerOne} !`;
    document.getElementById('moveAndPoints').style.display = '';
    document.getElementById('newGame').style.display = '';
    document.getElementById('juego').style.display = '';
    iniciarJuego(
      document.getElementById('juego'),
      document.getElementById('count')
    );
  }
}

function newGame() {

	// Reiniciamos variables. 
	gNumMoves = 0;	
	playerOnePoints = 0;
	playerTwoPoints = 0;
	document.getElementById('endGameText').style.display = 'none';
	document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints;
	document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints;
	gNumPieces = 24;	
	turnoBlancas = true; 
	turnoRojas = false; 
	
	
	piezas = []; // Vaciamos la lista de piezas, por si estamos pulsando el resetButton. 

	for (var i=0; i< kFilasIniciales; i++){
		for (var j=(i+1)%2; j < kBoardHeight; j=j+2) {
			piezas.push(new Casilla(i,j, kRojas));
		}
	}

	for (var i=kBoardHeight-1; i >= kBoardHeight - kFilasIniciales; i--){
		for (var j=(i+1)%2; j < kBoardHeight; j=j+2) {
			piezas.push(new Casilla(i,j, kBlancas));
		}
	}

    gNumPieces = piezas.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
	gGameInProgress = false; 
	
	turnoBlancas = true; 
	turnoRojas = false;  
	
	drawBoard();
	gGameInProgress = true;  
}

function endGame(){
	clearEndGameTexts();
	let playerOne = localStorage.getItem('playerOne');
	let playerTwo = localStorage.getItem('playerTwo');
	gGameInProgress = false; 
	if (sonTablas){
		document.getElementById('tieText').style.display = '';
	}
	else if (turnoBlancas){
		document.getElementById(
      'endGameText'
    ).innerHTML = `Juego terminado, Jugador rojo ${playerTwo} Gano!`;
    gamesHistory.push({
      player: playerTwo,
      points: playerTwoPoints,
      date: new Date(),
    });
    localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
	}
	else {
		document.getElementById(
      'endGameText'
    ).innerHTML = `Juego terminado. Jugador blanco ${playerOne} Gano!`;
    gamesHistory.push({
      player: playerOne,
      points: playerOnePoints,
      date: new Date(),
    });
    localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
	}
	newGame();
}

function saveGame() {
  for (var i = 0; i < gNumPieces; i++) {
    localStorage.removeItem('piece' + i + '.row');
    localStorage.removeItem('piece' + i + '.column');
    localStorage.removeItem('piece' + i + '.color');
  }

  localStorage.setItem('numMove', gMoveCount);
  localStorage.setItem('puntajeOne', playerOnePoints);
  localStorage.setItem('puntajeTwo', playerTwoPoints);
  gNumPieces = piezas.length;
  localStorage.setItem('numPiezas', gNumPieces);
  if (turnoBlancas) {
    localStorage.setItem('esTurno', 'playerOne');
  } else {
    localStorage.setItem('esTurno', 'playerTwo');
  }
  for (var i = 0; i < piezas.length; i++) {
    localStorage.setItem('piece' + i + '.row', piezas[i].row);
    localStorage.setItem('piece' + i + '.column', piezas[i].column);
    localStorage.setItem('piece' + i + '.color', piezas[i].color);
  }
}

function loadGame() {
  piezas = [];
  gNumPieces = parseInt(localStorage.getItem('numPiezas'));
  gMoveCount = parseInt(localStorage.getItem('numMove'));
	playerOnePoints = parseInt(localStorage.getItem('puntajeOne'));
	playerTwoPoints = parseInt(localStorage.getItem('puntajeTwo'));
	document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints
	document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints
  for (var i = 0; i < gNumPieces; i++) {
    var row = parseInt(localStorage.getItem('piece' + i + '.row'));
    var column = parseInt(localStorage.getItem('piece' + i + '.column'));
    var color = localStorage.getItem('piece' + i + '.color');
    if (!(color === 'null') && piezas.length < 24) {
      piezas.push(new Casilla(row, column, color));
    }
  }

  if (parseInt(localStorage.getItem('esTurno')) == 'playerOne') {
    turnoBlancas = true;
    turnoRojas = false;
  } else {
    turnoBlancas = false;
    turnoRojas = true;
  }

  drawBoard();
}

function iniciarJuego(canvasElement, moveCountElement) {
	document.getElementById('playerFields').style.display = 'none';
	document.getElementById('getPlayersButton').style.display = 'none';
	document.getElementById('endGameText').style.display = 'none';
    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    gCanvasElement.addEventListener("click", gestorClick, false);
    gMoveCountElem = moveCountElement;
    gDrawingContext = gCanvasElement.getContext("2d");
	
	loadButton = document.getElementById('loadButton');
	loadButton.onclick = loadGame;

  saveButton = document.getElementById('saveButton');
  saveButton.onclick = saveGame;
	// Nueva partida
  saveButton = document.getElementById('resetButton');
  saveButton.onclick = newGame;

	
    newGame();
}

function Casilla(row, column, color) {
    this.row = row;
    this.column = column;
    this.color = color;
}

function Reina(row, column, color) {
    Casilla.apply(this, [row, column, color]);
}

Reina.prototype = new Reina();
Reina.prototype.constructor = Reina;

function Move(r1, c1, r2, c2) {
    this.fromRow = r1;
    this.fromCol = c1;
    this.toRow = r2;
	this.toCol = c2;
}

function Jump(r1, c1, r2, c2) {
    Move.apply(this, [r1, c1, r2, c2])
}

Jump.prototype = new Move();
Jump.prototype.constructor = Move;















