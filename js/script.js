document.addEventListener('DOMContentLoaded', () => {

    /* Menu Hamburguesa 
       - Abre y cierra el menú de navegación con classList.toggle en movil y escritorio */
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const barraLateral = document.querySelector('.barra-lateral');

    if (btnHamburguesa && barraLateral) {
        // Función para abrir y cerrar (expandir y colapsar) el menú
        const alternarMenu = () => {
            // Requisito 1: Alternamos clases con classList.toggle
            barraLateral.classList.toggle('menu-abierto');
            btnHamburguesa.classList.toggle('activo');
            document.body.classList.toggle('menu-expandido');
        };

        // Evento click en el botón hamburguesa
        btnHamburguesa.addEventListener('click', alternarMenu);

        // Si el usuario presiona una opción del menú en pantallas pequeñas, cerramos el menú
        const enlacesMenu = barraLateral.querySelectorAll('a');
        enlacesMenu.forEach(enlace => {
            enlace.addEventListener('click', () => {
                if (window.innerWidth < 768 && barraLateral.classList.contains('menu-abierto')) {
                    alternarMenu();
                }
            });
        });
    }


    /* Interaccion modo claro y oscuro */
    const botonesTema = document.querySelectorAll('.btn-tema');

    const alternarModoTema = () => {
        // Requisito 2: Alternar la clase 'modo-oscuro' en el <body> usando classList.toggle
        document.body.classList.toggle('modo-oscuro');

        // Verificamos si la clase está activa con classList.contains
        const esOscuro = document.body.classList.contains('modo-oscuro');

        // Actualizamos los textos e iconos de todos los botones de tema en la interfaz
        botonesTema.forEach(btn => {
            const icono = btn.querySelector('.btn-tema__icono');
            const texto = btn.querySelector('.btn-tema__texto');

            if (esOscuro) {
                if (icono) icono.textContent = '☀️';
                if (texto) texto.textContent = 'Modo Claro';
                btn.setAttribute('title', 'Cambiar a modo claro');
                btn.setAttribute('aria-label', 'Cambiar a modo claro');
            } else {
                if (icono) icono.textContent = '🌙';
                if (texto) texto.textContent = 'Modo Oscuro';
                btn.setAttribute('title', 'Cambiar a modo oscuro');
                btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
            }
        });
    };

    // Asignamos el evento click a los botones de tema (móvil y escritorio)
    botonesTema.forEach(btn => {
        btn.addEventListener('click', alternarModoTema);
    });


    /*Interaccion buscar y filtrar*/
    const inputBusqueda = document.getElementById('busqueda');
    const tarjetasComunidad = document.querySelectorAll('.tarjeta-video');
    const contenedorTarjetas = document.querySelector('.comunidad__tarjetas');

    // Creamos dinámicamente un contenedor de aviso por si ninguna tarjeta coincide
    const avisoSinResultados = document.createElement('div');
    avisoSinResultados.id = 'aviso-sin-resultados';
    avisoSinResultados.className = 'mensaje-sin-resultados';
    avisoSinResultados.textContent = 'No se encontraron publicaciones que coincidan con tu búsqueda.';
    avisoSinResultados.style.display = 'none';

    if (contenedorTarjetas) {
        contenedorTarjetas.appendChild(avisoSinResultados);
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', () => {
            // Obtenemos el texto ingresado en minúsculas y sin espacios a los lados
            const filtro = inputBusqueda.value.toLowerCase().trim();
            let tarjetasVisibles = 0;

            // Recorremos las tarjetas de contenido existente
            tarjetasComunidad.forEach(tarjeta => {
                // Obtenemos el texto completo de la tarjeta (título, descripción, autor, etc.)
                const textoTarjeta = tarjeta.textContent.toLowerCase();

                // Requisito 3: Mostramos u ocultamos el elemento según si coincide con la búsqueda
                if (textoTarjeta.includes(filtro)) {
                    tarjeta.classList.remove('oculta'); // Mostrar contenido
                    tarjetasVisibles++;
                } else {
                    tarjeta.classList.add('oculta');    // Ocultar contenido
                }
            });

            // Si el usuario escribió algo y no hay coincidencias, mostramos el aviso visual
            if (tarjetasVisibles === 0 && filtro !== '') {
                avisoSinResultados.style.display = 'block';
            } else {
                avisoSinResultados.style.display = 'none';
            }
        });

        // Tecla Escape para limpiar la búsqueda rápidamente
        inputBusqueda.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                inputBusqueda.value = '';
                // Disparamos el evento input para restablecer la vista
                inputBusqueda.dispatchEvent(new Event('input'));
            }
        });
    }

});
