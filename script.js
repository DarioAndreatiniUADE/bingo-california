// --- LÓGICA DE EDICIÓN DE CINTAS A PRUEBA DE FALLOS ---
        
// Intentamos cargar los datos desde el localStorage, si no hay, usamos los por defecto
let defaultSponsors = JSON.parse(localStorage.getItem('bingo_sponsors')) || ["Dario", "Roberto", "Lucas"];
let defaultPremios = JSON.parse(localStorage.getItem('bingo_premios')) || ["1° Premio: Pelota", "2° Premio: Make Up", "3° Premio: Juego de Mesa", "4° Premio: Fantasma"];

function renderizarCinta(trackId, itemsArray, claseCSS, prefijo = "") {
    const track = document.getElementById(trackId);
    
    let itemsSeguros = [...itemsArray];
    while(itemsSeguros.length < 15) {
        itemsSeguros = itemsSeguros.concat(itemsArray);
    }

    let itemsHTML = "";
    itemsSeguros.forEach(item => {
        if(item.trim() !== "") {
            itemsHTML += `<div class="${claseCSS}">${prefijo}${item}</div>`;
        }
    });
    const bloque = `<div class="marquee-items">${itemsHTML}</div>`;

    let cantidadBloques = 2; 
    if(itemsArray.length < 5) cantidadBloques = 6;
    if(itemsArray.length < 3) cantidadBloques = 10;

    track.style.setProperty('--bloques', cantidadBloques);

    track.style.animation = 'none';
    track.innerHTML = bloque.repeat(cantidadBloques);
    
    void track.offsetWidth; 
    
    let velocidad = itemsSeguros.length * 3; 
    track.style.animation = `scroll-infinito ${velocidad}s linear infinite`;
}

function abrirModal(idModal, textAreaId, arrayDatos) {
    document.getElementById(idModal).classList.add('show');
    document.getElementById(textAreaId).value = arrayDatos.join('\n');
    document.getElementById('dropdownConfig').classList.remove('show');
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.remove('show');
}

function guardarSponsors() {
    const texto = document.getElementById('textSponsors').value;
    defaultSponsors = texto.split('\n').filter(s => s.trim() !== "");
    if(defaultSponsors.length === 0) defaultSponsors = ["Sponsors del Club"]; 
    
    // GUARDAR EN MEMORIA
    localStorage.setItem('bingo_sponsors', JSON.stringify(defaultSponsors));
    
    renderizarCinta('trackSponsors', defaultSponsors, 'sponsor-item', '✦ ');
    cerrarModal('modalSponsors');
}

function guardarPremios() {
    const texto = document.getElementById('textPremios').value;
    defaultPremios = texto.split('\n').filter(p => p.trim() !== "");
    if(defaultPremios.length === 0) defaultPremios = ["Premios Sorpresa"]; 
    
    // GUARDAR EN MEMORIA
    localStorage.setItem('bingo_premios', JSON.stringify(defaultPremios));
    
    renderizarCinta('trackPremios', defaultPremios, 'premio-item');
    cerrarModal('modalPremios');
}

// Eventos del Menú
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdownConfig');
    const btn = document.getElementById('btnConfig');
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

document.getElementById('btnConfig').addEventListener('click', () => {
    document.getElementById('dropdownConfig').classList.toggle('show');
});

document.getElementById('btnEditSponsors').addEventListener('click', () => {
    abrirModal('modalSponsors', 'textSponsors', defaultSponsors);
});

document.getElementById('btnEditPremios').addEventListener('click', () => {
    abrirModal('modalPremios', 'textPremios', defaultPremios);
});

// Inicializar cintas
renderizarCinta('trackSponsors', defaultSponsors, 'sponsor-item', '✦ ');
renderizarCinta('trackPremios', defaultPremios, 'premio-item');


// --- LÓGICA DEL BINGO (CON GUARDADO DE PARTIDA) ---
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