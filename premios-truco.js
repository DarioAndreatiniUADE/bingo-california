document.addEventListener('DOMContentLoaded', () => {
    const trackPremiosTruco = document.getElementById('trackPremiosTruco');
    
    if (trackPremiosTruco) {
        const premiosTruco = JSON.parse(localStorage.getItem('truco_premios')) || ["Premio"];
        
        // Clonamos para que no queden huecos blancos
        let itemsSeguros = [...premiosTruco];
        while(itemsSeguros.length < 10) {
            itemsSeguros = itemsSeguros.concat(premiosTruco);
        }

        let itemsHTML = "";
        itemsSeguros.forEach(item => {
            if(item.trim() !== "") {
                itemsHTML += `<div class="premio-item">${item}</div>`;
            }
        });
        
        const bloque = `<div class="marquee-items">${itemsHTML}</div>`;
        trackPremiosTruco.style.setProperty('--bloques', 2);
        trackPremiosTruco.innerHTML = bloque.repeat(2);
        
        let velocidad = itemsSeguros.length * 5; 
        trackPremiosTruco.style.animation = `scroll-infinito ${velocidad}s linear infinite`;
    }
});