

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

var playerOnePoints = 0;
var playerTwoPoints = 0;

var gNumPieces= 24; // Controla las piezas metidas en memoria. 
var gNumMoves =0; // Cuenta los movimientos sin que se produzca un salto. 

var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
var gMoveCount = 0;
var gMoveCountElem = 0;
var gGameInProgress;

// Oculta el elemento con el ID "contextGame"
contextGame = document.getElementById("contextGame");
contextGame.style.display = 'none';

// Oculta el elemento con el ID "juego"
juego = document.getElementById("juego");
juego.style.display = 'none';

// Oculta el elemento con el ID "esTurno"
esTurno = document.getElementById("esTurno");
esTurno.style.display = 'none';

// Oculta el elemento con el ID "isNotYourTurn"
isNotYourTurn = document.getElementById("isNotYourTurn");
isNotYourTurn.style.display = 'none';

// Oculta el elemento con el ID "endGameText"
endGameText = document.getElementById("endGameText");
endGameText.style.display = 'none';

// Oculta el elemento con el ID "tieText"
tieText = document.getElementById("tieText");
tieText.style.display = 'none';

// Oculta el elemento con el ID "cannotEatPieceSameColor"
cannotEatPieceSameColor = document.getElementById("cannotEatPieceSameColor");
cannotEatPieceSameColor.style.display = 'none';

// Oculta el elemento con el ID "moveAndPoints"
moveAndPoints = document.getElementById("moveAndPoints");
moveAndPoints.style.display = 'none';


var gamesHistory = localStorage.getItem('gamesHistory')
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
    var cell = new Casilla(Math.floor(y / kPieceHeight), Math.floor(x / kPieceWidth));
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


// La función calcula los movimientos legales posibles para una pieza en el tablero.
function getLegalMovesPieza(unaPieza) {
    var i = -1; // Inicialización de la variable i con -1.
    var fila = 0; // Inicialización de la variable fila con 0.
    var columna = 0; // Inicialización de la variable columna con 0.
    var someLegalMoves = []; // Array para almacenar los movimientos legales.
    var vacia = false; // Bandera para comprobar si una casilla está vacía.

    // El siguiente bucle recorre posibles desplazamientos horizontales.
    while (i < 2) {
        // Se comprueba si la pieza no está en el borde del tablero y si es el turno de las blancas o rojas.
        if (((unaPieza.row != 0) && (turnoBlancas)) || ((unaPieza.row != 7) && (turnoRojas))) {
            // Se comprueba si la pieza no está en una esquina del tablero y solo se verifica un lateral.
            if (((unaPieza.column != 0) && (i == -1)) || ((unaPieza.column != 7) && (i == 1))) {
                // Se ajustan las coordenadas de fila y columna según el turno de las piezas.
                if (turnoBlancas) {
                    fila = unaPieza.row - 1;
                    columna = unaPieza.column + i;
                } else {
                    fila = unaPieza.row + 1;
                    columna = unaPieza.column + i;
                }

                var j = 0;
                var existe = false;
                // Se verifica si hay una pieza en la casilla a la que se quiere mover.
                while (j < piezas.length && existe === false) {
                    // Si hay una pieza en la casilla, se actualiza la bandera 'existe'.
                    if (piezas[j].row === fila && piezas[j].column === columna) {
                        existe = true;
                        // Si las piezas son de distinto color, se comprueba si se puede hacer un salto.
                        if (piezas[j].color != unaPieza.color) {
                            // Se verifican los posibles saltos según la posición de la pieza.
                            if (i < 0 && turnoBlancas && unaPieza.column >= 2 && unaPieza.row >= 2) {
                                fila = unaPieza.row - 2;
                                columna = unaPieza.column - 2;
                                vacia = casillaVacia(fila, columna); // Se comprueba si la casilla está vacía.
                            } else if (i > 0 && turnoBlancas && unaPieza.column <= 5 && unaPieza.row >= 2) {
                                fila = unaPieza.row - 2;
                                columna = unaPieza.column + 2;
                                vacia = casillaVacia(fila, columna);
                            } else if (i < 0 && turnoRojas && unaPieza.column >= 2 && unaPieza.row <= 5) {
                                fila = unaPieza.row + 2;
                                columna = unaPieza.column - 2;
                                vacia = casillaVacia(fila, columna);
                            } else if (i > 0 && turnoRojas && unaPieza.column <= 5 && unaPieza.row <= 5) {
                                fila = unaPieza.row + 2;
                                columna = unaPieza.column + 2;
                                vacia = casillaVacia(fila, columna);
                            }
                        }
                    } else {
                        j++; // Se pasa a la siguiente pieza.
                    }
                }

                // Si la casilla contigua está libre, se agrega el movimiento a someLegalMoves.
                if (existe === false) {
                    var aMove = new Move(unaPieza.row, unaPieza.column, fila, columna);
                    someLegalMoves.push(aMove);
                }
                // Si no está libre pero se puede hacer un salto, se agrega el salto al principio de someLegalMoves.
                else if (existe === true && vacia === true) {
                    var aJump = new Jump(unaPieza.row, unaPieza.column, fila, columna);
                    someLegalMoves.unshift(aJump);
                }
            }
        }
        i = i + 2; // Se incrementa i en 2 para pasar a la siguiente posición horizontal.
    }
    return someLegalMoves; // Se devuelve el array con los movimientos legales.
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


function clearbanner() {
    // Limpia el mensaje de comer piezas.
    document.getElementById('eatPiece').innerHTML = '';
}

function clearInformationTexts() {
    // Limpia varios mensajes de información.
    document.getElementById('eatPiece').innerHTML = '';
    document.getElementById('cannotEatPieceSameColor').innerHTML = '';
    document.getElementById('endGameText').innerHTML = '';
    document.getElementById('esTurno').innerHTML = '';
}

function clearEndGameTexts() {
    // Limpia mensajes relacionados con el final del juego.
    document.getElementById('isNotYourTurn').innerHTML = '';
    document.getElementById('eatPiece').innerHTML = '';
    document.getElementById('cannotEatPieceSameColor').innerHTML = '';
    document.getElementById('esTurno').innerHTML = '';
}


// Muestra el movimiento realizado en la interfaz.
function mostrarMovimiento(casilla1, casilla2, salto) {
    // Obtiene los nombres de los jugadores almacenados localmente.
    let playerOne = localStorage.getItem('playerOne');
    let playerTwo = localStorage.getItem('playerTwo');

    // Crea un elemento de párrafo para mostrar el movimiento.
    var movimiento = document.createElement("p");

    // Verifica el turno actual y actualiza los puntos si hubo un salto.
    if (turnoBlancas) {
        if (salto) {
            playerOnePoints += 10; // Aumenta los puntos del jugador uno en caso de un salto.
            document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints; // Actualiza los puntos en la interfaz.
        }
        document.getElementById("moveBlancas").appendChild(movimiento); // Agrega el movimiento a la sección de movimientos blancos.
		document.getElementById('esTurno').style.display = '';
        document.getElementById('esTurno').innerHTML = `Es turno del jugador rojo: ${playerTwo} !`; // Actualiza el mensaje de turno en la interfaz.
    } else {
        if (salto) {
            playerTwoPoints += 10; // Aumenta los puntos del jugador dos en caso de un salto.
            document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints; // Actualiza los puntos en la interfaz.
        }
        document.getElementById("moveRojas").appendChild(movimiento); // Agrega el movimiento a la sección de movimientos rojos.
		document.getElementById('esTurno').style.display = '';
        document.getElementById('esTurno').innerHTML = `Es turno del jugador blanco: ${playerOne} !`; // Actualiza el mensaje de turno en la interfaz.
    }
}


// Verifica si una pieza debe ser coronada.
function comprobarCoronacion() {
    // Verifica si la pieza seleccionada debe ser coronada.
    if (((turnoBlancas) && (piezas[gSelectedPieceIndex].color === kBlancas) && (piezas[gSelectedPieceIndex].row === 0)) || 
        ((turnoRojas) && (piezas[gSelectedPieceIndex].color === kRojas) && (piezas[gSelectedPieceIndex].row === 7))) {
        
        // Extrae la pieza que será candidata a coronación.
        var candidata = piezas.splice(gSelectedPieceIndex, 1);

        // Llama a la función para coronar la pieza candidata.
        coronar(candidata[0]);
    }
}


function cambioTurno() {
    // Cambia el turno de los jugadores.
    if (turnoBlancas) {
        clearbanner();
        turnoBlancas = false;
        turnoRojas = true;
    } else {
        clearbanner();
        turnoBlancas = true;
        turnoRojas = false;
    }
}


// Verifica si hay una pieza en el camino entre dos casillas.
function isThereAPieceBetween(casilla1, casilla2) {
    var existe = false; // Variable para verificar si hay una pieza en medio.
    var i = 0; // Índice para iterar a través de las piezas.
    var fila = 0;
    var columna = 0;

    // Determina la dirección del movimiento en función del turno y la casilla de destino.
    if ((turnoBlancas) && (casilla2.column - casilla1.column === -2) && (casilla2.row - casilla1.row === -2)) { // Hacia arriba a la izquierda
        columna = casilla1.column - 1;
        fila = casilla1.row - 1;
    } else if ((turnoBlancas) && (casilla2.column - casilla1.column === 2) && (casilla2.row - casilla1.row === -2)) { // Hacia arriba a la derecha
        columna = casilla1.column + 1;
        fila = casilla1.row - 1;
    } else if ((turnoRojas) && (casilla2.column - casilla1.column === -2) && (casilla2.row - casilla1.row === 2)) { // Hacia abajo a la izquierda
        columna = casilla1.column - 1;
        fila = casilla1.row + 1;
    } else if ((turnoRojas) && (casilla2.column - casilla1.column === 2) && (casilla2.row - casilla1.row === 2)) { // Hacia abajo a la derecha
        columna = casilla1.column + 1;
        fila = casilla1.row + 1;
    }

    // Itera a través de las piezas para verificar si hay una en la casilla intermedia.
    while ((i < piezas.length) && (existe === false)) {
        if ((piezas[i].row === fila) && (piezas[i].column === columna)) {
            if (casilla1.color !== piezas[i].color) { // No puedes comer fichas de tu mismo color.
                existe = true;
                indiceABorrar = i; // Guarda el índice de la pieza a borrar en caso de salto.
            } else {
                // Muestra un mensaje en la interfaz cuando se intenta comer una pieza del mismo color.
                document.getElementById('cannotEatPieceSameColor').style.display = '';
                document.getElementById('cannotEatPieceSameColor').innerHTML = 'No puedes comer fichas de tu mismo color';
                
                // Oculta el mensaje después de 2 segundos.
                setTimeout(() => {
                    document.getElementById('cannotEatPieceSameColor').style.display = 'none';
                }, 2000);
            }
        }
        i++;
    }
    return existe; // Retorna si hay una pieza en el camino.
}

function borrarPieza() {
    // Elimina la pieza en el índice indicado (indiceABorrar) de la matriz piezas.
    piezas.splice(indiceABorrar, 1);
    indiceABorrar = -1; // Restablece el valor del índice a borrar.
    gNumPieces--; // Reduce la cantidad total de piezas en el tablero.
}

function comprobarTablas() {
    // Comprueba si ha habido un empate debido a la regla de las 40 jugadas sin captura ni coronación.
    if (gNumMoves >= 40) {
        sonTablas = true; // Establece la variable sonTablas como verdadera.
        endGame(); // Llama a la función endGame() para finalizar el juego y mostrar el resultado.
    }
}

function isTheGameOver() {
    // Obtiene todos los movimientos legales posibles para el jugador actual.
    legalMoves = getLegalMoves();
    // Si no hay movimientos legales, se considera que el juego ha terminado.
    return legalMoves.length === 0;
}

function casillaVacia(fila, columna) {
    // Comprueba si una casilla en la fila y columna dadas está vacía.
    var y = 0;
    var vacia = true;
    while (y < piezas.length && vacia) {
        if (piezas[y].row === fila && piezas[y].column === columna) {
            vacia = false; // Si se encuentra una pieza en esa casilla, se marca como no vacía.
        } else {
            y++;
        }
    }
    return vacia; // Devuelve true si la casilla está vacía, de lo contrario, devuelve false.
}

function coronar(peon) {
    // Reemplaza un peón en la posición dada con una Reina del mismo color.
    piezas.push(new Reina(peon.row, peon.column, peon.color));
}


// Obtiene los nombres de los jugadores y realiza la configuración inicial del juego.
function getPlayersNames() {
    var playerOne = document.getElementById('playerOne').value; // Obtiene el nombre del jugador uno.
    var playerTwo = document.getElementById('playerTwo').value; // Obtiene el nombre del jugador dos.

    // Verifica si ambos nombres son válidos y no están vacíos.
    if (playerOne && playerTwo && playerOne.trim() !== "" && playerTwo.trim() !== "") {
        // El código dentro de esta condición se ejecutará si ambos nombres son válidos y no están vacíos.

        // Almacena los nombres de los jugadores en el almacenamiento local.
        localStorage.setItem('playerOne', playerOne);
        localStorage.setItem('playerTwo', playerTwo);

        // Actualiza la interfaz para mostrar información sobre el turno y el juego.
        document.getElementById('esTurno').style.display = '';
        document.getElementById('esTurno').innerHTML = `Empieza el jugador blanco: ${playerOne} !`;
        document.getElementById('moveAndPoints').style.display = '';
        document.getElementById('juego').style.display = '';
        document.getElementById('contextGame').style.display = '';

        // Inicia el juego pasando los elementos del lienzo y el contador de movimientos.
        iniciarJuego(
            document.getElementById('juego'),
            document.getElementById('count')
        );
    } else {
        // El código dentro de esta parte se ejecutará si playerOne o playerTwo son nulos o vacíos.
        
        // Muestra una alerta indicando que se deben ingresar los nombres de ambos jugadores.
        alert("Por favor, ingresa los nombres de ambos jugadores.");
    }
}


// Inicia una nueva partida.
function newGame() {
    // Reinicia las variables relacionadas con el juego y los puntos.
    gNumMoves = 0; // Reinicia el contador de movimientos.
    playerOnePoints = 0; // Reinicia los puntos del jugador uno.
    playerTwoPoints = 0; // Reinicia los puntos del jugador dos.

    // Actualiza los contadores de puntos en la interfaz.
    document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints;
    document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints;

    gNumPieces = 24; // Establece el número inicial de piezas.
    turnoBlancas = true; // Establece el turno de las piezas blancas.
    turnoRojas = false; // Establece que no es el turno de las piezas rojas.

    // Vacía la lista de piezas por si se está reiniciando el juego.
    piezas = [];

    // Agrega las piezas iniciales para el juego.
    for (var i = 0; i < kFilasIniciales; i++) {
        for (var j = (i + 1) % 2; j < kBoardHeight; j = j + 2) {
            piezas.push(new Casilla(i, j, kRojas)); // Agrega piezas rojas en las posiciones iniciales.
        }
    }

    for (var i = kBoardHeight - 1; i >= kBoardHeight - kFilasIniciales; i--) {
        for (var j = (i + 1) % 2; j < kBoardHeight; j = j + 2) {
            piezas.push(new Casilla(i, j, kBlancas)); // Agrega piezas blancas en las posiciones iniciales.
        }
    }

    gNumPieces = piezas.length; // Actualiza el número de piezas.
    gSelectedPieceIndex = -1; // Reinicia el índice de la pieza seleccionada.
    gSelectedPieceHasMoved = false; // Reinicia el estado de movimiento de la pieza seleccionada.
    gMoveCount = 0; // Reinicia el contador de movimientos.
    gGameInProgress = false; // Marca que el juego no está en progreso.

    turnoBlancas = true; // Establece el turno de las piezas blancas.
    turnoRojas = false; // Establece que no es el turno de las piezas rojas.

    drawBoard(); // Dibuja el tablero con las piezas iniciales.
    gGameInProgress = true; // Marca que el juego está en progreso.
}


function endGame() {
    // Limpia los textos de fin de juego y resetea las variables relacionadas con el juego
    clearEndGameTexts();

    // Obtiene los nombres de los jugadores almacenados en el localStorage
    let playerOne = localStorage.getItem('playerOne');
    let playerTwo = localStorage.getItem('playerTwo');

    // Establece que el juego ha terminado
    gGameInProgress = false;

    // Comprueba si el juego terminó en empate
    if (sonTablas) {
        // Muestra el mensaje de empate y actualiza su contenido
        document.getElementById('tieText').style.display = '';
        document.getElementById('tieText').innerHTML = 'Hubo empate, ¡juegue de nuevo!';
    } else if (turnoBlancas) {
        // Muestra el mensaje de fin de juego y actualiza su contenido con el nombre del jugador rojo ganador
        document.getElementById('endGameText').style.display = '';
        document.getElementById('endGameText').innerHTML = `Juego terminado, Jugador rojo ${playerTwo} Ganó!`;

        // Agrega una entrada en el historial de juegos para el jugador rojo
        gamesHistory.push({
            player: playerTwo,
            points: playerTwoPoints,
            date: new Date(),
        });

        // Actualiza el historial de juegos en el localStorage
        localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
    } else {
        // Muestra el mensaje de fin de juego y actualiza su contenido con el nombre del jugador blanco ganador
        document.getElementById('endGameText').style.display = '';
        document.getElementById('endGameText').innerHTML = `Juego terminado. Jugador blanco ${playerOne} Ganó!`;

        // Agrega una entrada en el historial de juegos para el jugador blanco
        gamesHistory.push({
            player: playerOne,
            points: playerOnePoints,
            date: new Date(),
        });

        // Actualiza el historial de juegos en el localStorage
        localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
    }

    // Mostrar el mensaje durante 6 segundos y luego limpiarlo y reiniciar un nuevo juego
    setTimeout(() => {
        document.getElementById('endGameText').innerHTML = '';
        document.getElementById('endGameText').style.display = 'none';
        document.getElementById('eatPiece').innerHTML = '';
        document.getElementById('tieText').style.display = 'none';
        newGame();
    }, 6000);
}

function saveGame() {
    // Elimina información anterior de piezas guardadas.
    for (var i = 0; i < gNumPieces; i++) {
        localStorage.removeItem('piece' + i + '.row');
        localStorage.removeItem('piece' + i + '.column');
        localStorage.removeItem('piece' + i + '.color');
    }

    // Guarda información actual del juego.
    localStorage.setItem('numMove', gMoveCount);
    localStorage.setItem('puntajeOne', playerOnePoints);
    localStorage.setItem('puntajeTwo', playerTwoPoints);
    gNumPieces = piezas.length;
    localStorage.setItem('numPiezas', gNumPieces);
    
    // Guarda el jugador cuyo turno es el actual.
    if (turnoBlancas) {
        localStorage.setItem('esTurno', 'playerOne');
    } else {
        localStorage.setItem('esTurno', 'playerTwo');
    }

    // Guarda información de cada pieza en el tablero.
    for (var i = 0; i < piezas.length; i++) {
        localStorage.setItem('piece' + i + '.row', piezas[i].row);
        localStorage.setItem('piece' + i + '.column', piezas[i].column);
        localStorage.setItem('piece' + i + '.color', piezas[i].color);
    }
}


// Carga un juego previamente guardado desde el almacenamiento local.
function loadGame() {
    piezas = []; // Reinicia la matriz de piezas para cargar nuevas piezas.
    gNumPieces = parseInt(localStorage.getItem('numPiezas')); // Obtiene el número de piezas guardadas.
    gMoveCount = parseInt(localStorage.getItem('numMove')); // Obtiene el número de movimientos guardados.
    playerOnePoints = parseInt(localStorage.getItem('puntajeOne')); // Obtiene el puntaje del jugador uno guardado.
    playerTwoPoints = parseInt(localStorage.getItem('puntajeTwo')); // Obtiene el puntaje del jugador dos guardado.

    // Actualiza los contadores de puntos en la interfaz.
    document.getElementById('playerOnePointsCount').innerHTML = playerOnePoints;
    document.getElementById('playerTwoPointsCount').innerHTML = playerTwoPoints;

    // Carga las piezas guardadas desde el almacenamiento local.
    for (var i = 0; i < gNumPieces; i++) {
        var row = parseInt(localStorage.getItem('piece' + i + '.row')); // Obtiene la fila de la pieza.
        var column = parseInt(localStorage.getItem('piece' + i + '.column')); // Obtiene la columna de la pieza.
        var color = localStorage.getItem('piece' + i + '.color'); // Obtiene el color de la pieza.

        // Agrega una pieza a la matriz solo si no es nula y hay espacio en la matriz de piezas.
        if (!(color === 'null') && piezas.length < 24) {
            piezas.push(new Casilla(row, column, color)); // Crea una nueva instancia de pieza y la agrega a la matriz.
        }
    }

    // Establece el turno en función de la carga.
    if (parseInt(localStorage.getItem('esTurno')) == 'playerOne') {
        turnoBlancas = true; // Es el turno de las blancas.
        turnoRojas = false;
    } else {
        turnoBlancas = false;
        turnoRojas = true; // Es el turno de las rojas.
    }

    drawBoard(); // Redibuja el tablero con la configuración cargada.
}



// Inicia el juego y configura la interfaz gráfica y la interacción del usuario.
function iniciarJuego(canvasElement, moveCountElement) {
    // Oculta elementos que no son necesarios y muestra el tablero del juego.
    document.getElementById('playerFields').style.display = 'none';
    document.getElementById('getPlayersButton').style.display = 'none';
    document.getElementById('endGameText').style.display = 'none';

    // Configura el lienzo con las dimensiones y la interacción de clic.
    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    gCanvasElement.addEventListener("click", gestorClick, false); // Asocia la función gestorClick al evento de clic en el lienzo.
    gMoveCountElem = moveCountElement; // Almacena una referencia al elemento HTML donde se mostrará el contador de movimientos.
    gDrawingContext = gCanvasElement.getContext("2d"); // Obtiene el contexto de dibujo 2D del lienzo.

    // Asigna funciones a los botones.
    loadButton = document.getElementById('loadButton'); // Obtiene el botón de carga del juego.
    loadButton.onclick = loadGame; // Asigna la función loadGame al evento de clic en el botón de carga.

    saveButton = document.getElementById('saveButton'); // Obtiene el botón de guardado del juego.
    saveButton.onclick = saveGame; // Asigna la función saveGame al evento de clic en el botón de guardado.

    newGameButton = document.getElementById('resetButton'); // Obtiene el botón de inicio de nueva partida.
    newGameButton.onclick = newGame; // Asigna la función newGame al evento de clic en el botón de inicio de nueva partida.

    // Inicia una nueva partida.
    newGame(); // Llama a la función newGame para iniciar el juego.
}

// Constructor de la clase Casilla para representar una posición en el tablero.
function Casilla(row, column, color) {
    this.row = row; // Fila
    this.column = column; // Columna
    this.color = color; // Color de la pieza
}

// Constructor de la clase Reina que hereda de Casilla.
function Reina(row, column, color) {
    Casilla.apply(this, [row, column, color]); // Llama al constructor de Casilla.
}

Reina.prototype = new Casilla(); // Hereda de Casilla.
Reina.prototype.constructor = Reina; // Establece el constructor correctamente.

// Constructor de la clase Move para representar un movimiento en el juego.
function Move(fromRow, fromCol, toRow, toCol) {
    this.fromRow = fromRow; // Fila de origen
    this.fromCol = fromCol; // Columna de origen
    this.toRow = toRow; // Fila de destino
    this.toCol = toCol; // Columna de destino
}

// Constructor de la clase Jump que hereda de Move.
function Jump(fromRow, fromCol, toRow, toCol) {
    Move.apply(this, [fromRow, fromCol, toRow, toCol]); // Llama al constructor de Move.
}

Jump.prototype = new Move(); // Hereda de Move.
Jump.prototype.constructor = Jump; // Establece el constructor correctamente.
