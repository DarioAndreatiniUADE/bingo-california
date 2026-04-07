document.addEventListener('DOMContentLoaded', () => {
    // 1. Buscamos si la página actual tiene el espacio reservado para los sponsors
    const placeholder = document.getElementById('sponsors-placeholder');
    if (!placeholder) return; // Si no lo tiene, no hacemos nada

    // 2. Traemos los sponsors de la memoria compartida
    const sponsorsGuardados = JSON.parse(localStorage.getItem('bingo_sponsors')) || ["Sponsor"];
    
    let itemsSeguros = [...sponsorsGuardados];
    while(itemsSeguros.length < 15) {
        itemsSeguros = itemsSeguros.concat(sponsorsGuardados);
    }

    let itemsHTML = "";
    itemsSeguros.forEach(item => {
        if(item.trim() !== "") {
            itemsHTML += `<div class="sponsor-item">✦ ${item}</div>`;
        }
    });
    const bloque = `<div class="marquee-items">${itemsHTML}</div>`;

    let cantidadBloques = 2; 
    if(sponsorsGuardados.length < 5) cantidadBloques = 6;
    if(sponsorsGuardados.length < 3) cantidadBloques = 10;

    // 3. Inyectamos todo el HTML estructural automáticamente
    placeholder.innerHTML = `
        <div class="seccion-sponsors">
            <p class="titulo-sponsors">Agradecemos a nuestros sponsors:</p>
            <div class="cinta-sponsors">
                <div class="marquee-track" id="trackSponsorsGlobal" style="--bloques: ${cantidadBloques};">
                    ${bloque.repeat(cantidadBloques)}
                </div>
            </div>
        </div>
    `;

    // 4. Activamos la animación con la velocidad correcta
    const trackSponsors = document.getElementById('trackSponsorsGlobal');
    let velocidad = itemsSeguros.length * 8; 
    trackSponsors.style.animation = `scroll-infinito ${velocidad}s linear infinite`;
});