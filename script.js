// =========================================================
// 1. DIBUJAR PREMIOS DEL BINGO (Lee de la memoria)
// =========================================================
const premiosBingo = JSON.parse(localStorage.getItem('bingo_premios')) || ["1° Premio", "2° Premio"];

const trackPremios = document.getElementById('trackPremios');
if (trackPremios) {
    // Clonamos para que no queden huecos blancos
    let itemsSeguros = [...premiosBingo];
    while(itemsSeguros.length < 10) {
        itemsSeguros = itemsSeguros.concat(premiosBingo);
    }

    let itemsHTML = "";
    itemsSeguros.forEach(item => {
        if(item.trim() !== "") {
            itemsHTML += `<div class="premio-item">${item}</div>`;
        }
    });
    
    const bloque = `<div class="marquee-items">${itemsHTML}</div>`;
    trackPremios.style.setProperty('--bloques', 2);
    trackPremios.innerHTML = bloque.repeat(2);
    
    let velocidad = itemsSeguros.length * 5; 
    trackPremios.style.animation = `scroll-infinito ${velocidad}s linear infinite`;
}

// =========================================================
// 2. LÓGICA DEL BINGO (BOLILLERO Y GUARDADO)
// =========================================================
const totalNumeros = 90; 
// Cargamos el estado anterior si existe
let numerosDisponibles = JSON.parse(localStorage.getItem('bingo_disponibles'));
let numerosLlamados = JSON.parse(localStorage.getItem('bingo_llamados')) || [];
let numeroAnterior = localStorage.getItem('bingo_anterior') || null;
let ultimoNumero = localStorage.getItem('bingo_ultimo') || null;

let isRolling = false; 

const contenedorCuadricula = document.getElementById('cuadricula');
const displayNumero = document.getElementById('displayNumero');
const displayAnterior = document.getElementById('displayAnterior');
const btnGenerar = document.getElementById('btnGenerar');
const btnReiniciar = document.getElementById('btnReiniciar');
const contador = document.getElementById('contador');

function formatearNumero(num) {
    return num < 10 ? '0' + num : num;
}

function guardarEstadoPartida() {
    localStorage.setItem('bingo_disponibles', JSON.stringify(numerosDisponibles));
    localStorage.setItem('bingo_llamados', JSON.stringify(numerosLlamados));
    if (numeroAnterior) localStorage.setItem('bingo_anterior', numeroAnterior);
    if (ultimoNumero) localStorage.setItem('bingo_ultimo', ultimoNumero);
}

function construirCuadricula() {
    contenedorCuadricula.innerHTML = '';
    for (let i = 1; i <= totalNumeros; i++) {
        const celda = document.createElement('div');
        celda.classList.add('celda');
        celda.id = 'celda-' + i;
        celda.textContent = i;
        
        // Si el número ya fue llamado, lo marcamos
        if (numerosLlamados.includes(i)) {
            celda.classList.add('marcada');
        }
        // Si es el último número, lo resaltamos
        if (i == ultimoNumero) {
            celda.classList.add('ultimo');
        }

        contenedorCuadricula.appendChild(celda);
    }
}

function iniciarJuego(esNuevaPartida = false) {
    // Si no hay datos guardados o forzamos nueva partida, reseteamos todo
    if (!numerosDisponibles || esNuevaPartida) {
        numerosDisponibles = Array.from({length: totalNumeros}, (_, i) => i + 1);
        numerosLlamados = [];
        numeroAnterior = null;
        ultimoNumero = null;
        
        // Limpiamos el guardado
        localStorage.removeItem('bingo_disponibles');
        localStorage.removeItem('bingo_llamados');
        localStorage.removeItem('bingo_anterior');
        localStorage.removeItem('bingo_ultimo');
    }
    
    // Actualizamos la pantalla con los datos cargados o reseteados
    displayNumero.textContent = ultimoNumero ? formatearNumero(ultimoNumero) : '--';
    displayAnterior.textContent = numeroAnterior ? formatearNumero(numeroAnterior) : '--';
    displayNumero.classList.remove('ganador-animacion');
    contador.textContent = `Llamados: ${numerosLlamados.length}/${totalNumeros}`;
    
    if (numerosDisponibles.length === 0) {
        btnGenerar.disabled = true;
        btnGenerar.textContent = "BINGO FINALIZADO";
    } else {
        btnGenerar.disabled = false;
        btnGenerar.textContent = "Tirar Bolilla";
    }

    construirCuadricula();
}

btnGenerar.addEventListener('click', () => {
    if (numerosDisponibles.length === 0 || isRolling) return;
    
    isRolling = true;
    btnGenerar.disabled = true;
    
    displayNumero.classList.remove('ganador-animacion');
    displayNumero.classList.add('sorteando'); 

    let intervaloGiro = setInterval(() => {
        let randomTemp = Math.floor(Math.random() * totalNumeros) + 1;
        displayNumero.textContent = formatearNumero(randomTemp);
    }, 50); 

    setTimeout(() => {
        clearInterval(intervaloGiro);
        displayNumero.classList.remove('sorteando');

        const indiceAleatorio = Math.floor(Math.random() * numerosDisponibles.length);
        const numeroSorteado = numerosDisponibles[indiceAleatorio];
        
        // Actualizamos las listas
        numerosDisponibles.splice(indiceAleatorio, 1); 
        numerosLlamados.push(numeroSorteado);

        if (ultimoNumero !== null) {
            numeroAnterior = ultimoNumero;
            displayAnterior.textContent = formatearNumero(numeroAnterior);
        }
        ultimoNumero = numeroSorteado;

        // Mostrar número con animación
        displayNumero.textContent = formatearNumero(ultimoNumero);
        void displayNumero.offsetWidth; 
        displayNumero.classList.add('ganador-animacion');

        contador.textContent = `Llamados: ${numerosLlamados.length}/${totalNumeros}`;

        // Marcar cuadrícula
        document.querySelectorAll('.celda.ultimo').forEach(el => {
            el.classList.remove('ultimo');
            el.classList.remove('animar-marca');
        });

        const celdaAMarcar = document.getElementById('celda-' + ultimoNumero);
        celdaAMarcar.classList.add('marcada');
        celdaAMarcar.classList.add('ultimo'); 
        celdaAMarcar.classList.add('animar-marca');

        // GUARDAMOS LA PARTIDA DESPUÉS DE CADA BOLILLA
        guardarEstadoPartida();

        isRolling = false;

        if (numerosDisponibles.length === 0) {
            btnGenerar.textContent = "BINGO FINALIZADO";
        } else {
            btnGenerar.disabled = false;
        }
    }, 4500); 
});

btnReiniciar.addEventListener('click', () => {
    if(confirm("¿Estás seguro de que quieres borrar todo y empezar una partida nueva?")) {
        iniciarJuego(true); // true = fuerza el reseteo
    }
});

// Arrancamos el juego al cargar la página
iniciarJuego();