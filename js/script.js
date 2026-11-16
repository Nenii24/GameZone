document.addEventListener('DOMContentLoaded', () => {

    /* Menu Hamburguesa 
       - Abre y cierra el menú de navegación con classList.toggle en movil y escritorio */
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const barraLateral = document.querySelector('.barra-lateral');

    if (btnHamburguesa && barraLateral) {
        // Función para abrir y cerrar (expandir y colapsar) el menú
        const alternarMenu = () => {
            // Alternamos clases con classList.toggle
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


    /* Interaccion modo claro y oscuro con persistencia en localStorage */
    const botonesTema = document.querySelectorAll('.btn-tema');
    const CLAVE_TEMA = 'ultihub_tema';

    // Función para sincronizar los iconos y textos de los botones según el tema activo
    const actualizarBotonesTema = (esOscuro) => {
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

    // Al cargar la página, leemos el tema guardado en localStorage con JSON.parse
    const temaGuardado = localStorage.getItem(CLAVE_TEMA);
    if (temaGuardado) {
        try {
            const configTema = JSON.parse(temaGuardado);
            document.body.classList.toggle('modo-oscuro', Boolean(configTema.modoOscuro));
        } catch (error) {
            console.warn('No se pudo leer la preferencia de tema guardada:', error);
        }
    }
    actualizarBotonesTema(document.body.classList.contains('modo-oscuro'));

    const alternarModoTema = () => {
        // Alternar la clase 'modo-oscuro' en el <body> usando classList.toggle
        document.body.classList.toggle('modo-oscuro');

        // Verificamos si la clase está activa con classList.contains
        const esOscuro = document.body.classList.contains('modo-oscuro');

        // Guardamos la preferencia en localStorage como JSON usando JSON.stringify
        localStorage.setItem(CLAVE_TEMA, JSON.stringify({ modoOscuro: esOscuro }));

        // Actualizamos los textos e iconos de todos los botones de tema en la interfaz
        actualizarBotonesTema(esOscuro);
    };

    // Asignamos el evento click a los botones de tema (móvil y escritorio)
    botonesTema.forEach(btn => {
        btn.addEventListener('click', alternarModoTema);
    });


    /* Interaccion buscar y filtrar */
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

                // Mostramos u ocultamos el elemento según si coincide con la búsqueda
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


    /* Torneos con fetch, manejo de carga/errores, favoritos en localStorage y SweetAlert2 */
    const contenedorTorneos = document.getElementById('contenedor-torneos');
    const estadoTorneos = document.getElementById('estado-torneos');
    const btnSoloFavoritos = document.getElementById('btn-solo-favoritos');
    const btnRecargarTorneos = document.getElementById('btn-recargar-torneos');
    const CLAVE_FAVORITOS = 'ultihub_favoritos';

    let listaTorneos = [];
    let mostrarSoloFavoritos = false;

    // Función auxiliar para mostrar avisos con SweetAlert2 respetando el estilo de las tarjetas del sitio
    const mostrarAlerta = (opciones) => {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                buttonsStyling: false,
                customClass: {
                    popup: 'ultihub-alerta',
                    title: 'ultihub-alerta__titulo',
                    htmlContainer: 'ultihub-alerta__texto',
                    actions: 'ultihub-alerta__acciones',
                    confirmButton: 'ultihub-alerta__btn-confirmar',
                    cancelButton: 'ultihub-alerta__btn-cancelar'
                },
                ...opciones
            });
        }
        alert(opciones.text || opciones.title || 'Aviso');
        return Promise.resolve({ isConfirmed: true });
    };

    // Leemos los IDs de torneos favoritos desde localStorage usando JSON.parse
    const obtenerFavoritos = () => {
        try {
            const datos = localStorage.getItem(CLAVE_FAVORITOS);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.warn('Error al leer favoritos de localStorage:', error);
            return [];
        }
    };

    // Guardamos los IDs de torneos favoritos en localStorage usando JSON.stringify
    const guardarFavoritos = (favoritos) => {
        localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
    };

    // Actualizamos el contador del botón de favoritos en la interfaz
    const actualizarContadorFavoritos = () => {
        if (!btnSoloFavoritos) return;
        const total = obtenerFavoritos().length;
        btnSoloFavoritos.textContent = `★ Favoritos (${total})`;
        btnSoloFavoritos.classList.toggle('activo', mostrarSoloFavoritos);
    };

    // Renderizamos las tarjetas de torneos en el DOM
    const renderizarTorneos = () => {
        if (!contenedorTorneos || !estadoTorneos) return;

        const favoritos = obtenerFavoritos();
        const torneosAMostrar = mostrarSoloFavoritos
            ? listaTorneos.filter(torneo => favoritos.includes(torneo.id))
            : listaTorneos;

        contenedorTorneos.innerHTML = '';
        actualizarContadorFavoritos();

        if (torneosAMostrar.length === 0) {
            estadoTorneos.innerHTML = `<div class="torneos-api__cargando">${
                mostrarSoloFavoritos
                    ? 'Aún no tienes torneos guardados en favoritos.'
                    : 'No hay torneos disponibles por el momento.'
            }</div>`;
            return;
        }

        estadoTorneos.innerHTML = '';

        torneosAMostrar.forEach(torneo => {
            const esFavorito = favoritos.includes(torneo.id);
            const estaLleno = torneo.estado.toLowerCase() === 'lleno';

            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-torneo';
            tarjeta.innerHTML = `
                <div class="tarjeta-torneo__top">
                    <span class="tarjeta-torneo__juego">${torneo.juego}</span>
                    <span class="tarjeta-torneo__badge ${estaLleno ? 'tarjeta-torneo__badge--lleno' : ''}">${torneo.estado}</span>
                </div>
                <h3 class="tarjeta-torneo__titulo">${torneo.titulo}</h3>
                <ul class="tarjeta-torneo__detalles">
                    <li>📅 ${torneo.fecha}</li>
                    <li>🏆 Premio: ${torneo.premio}</li>
                    <li>👥 Cupos: ${torneo.cupos}</li>
                    <li>🎮 ${torneo.plataforma}</li>
                </ul>
                <div class="tarjeta-torneo__acciones">
                    <button type="button" class="tarjeta-torneo__btn-inscribir" ${estaLleno ? 'disabled' : ''}>
                        ${estaLleno ? 'Cupo lleno' : 'Inscribirse'}
                    </button>
                    <button type="button" class="tarjeta-torneo__btn-fav ${esFavorito ? 'favorito' : ''}" title="${esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}" aria-label="Guardar torneo en favoritos">
                        ${esFavorito ? '★' : '☆'}
                    </button>
                </div>
            `;

            // Evento para confirmar inscripción usando SweetAlert2 sin icono de interrogación
            const btnInscribir = tarjeta.querySelector('.tarjeta-torneo__btn-inscribir');
            if (btnInscribir && !estaLleno) {
                btnInscribir.addEventListener('click', () => {
                    mostrarAlerta({
                        title: `¿Inscribirse a ${torneo.titulo}?`,
                        text: `Juego: ${torneo.juego} • Fecha: ${torneo.fecha}`,
                        showCancelButton: true,
                        confirmButtonText: 'Sí, inscribirme',
                        cancelButtonText: 'Cancelar'
                    }).then((resultado) => {
                        if (resultado.isConfirmed) {
                            mostrarAlerta({
                                title: '¡Inscripción confirmada!',
                                text: `Tu lugar en "${torneo.titulo}" ha sido registrado.`,
                                confirmButtonText: 'Aceptar'
                            });
                        }
                    });
                });
            }

            // Evento para agregar o quitar el torneo de favoritos en localStorage
            const btnFav = tarjeta.querySelector('.tarjeta-torneo__btn-fav');
            if (btnFav) {
                btnFav.addEventListener('click', () => {
                    let actuales = obtenerFavoritos();
                    const yaExiste = actuales.includes(torneo.id);

                    if (yaExiste) {
                        actuales = actuales.filter(id => id !== torneo.id);
                    } else {
                        actuales.push(torneo.id);
                    }

                    // Guardamos la lista actualizada en localStorage con JSON.stringify
                    guardarFavoritos(actuales);
                    renderizarTorneos();

                    // Mostramos una notificación rápida tipo toast con SweetAlert2
                    mostrarAlerta({
                        toast: true,
                        position: 'bottom-end',
                        title: yaExiste ? '☆ Eliminado de favoritos' : '★ Guardado en favoritos',
                        showConfirmButton: false,
                        timer: 1800
                    });
                });
            }

            contenedorTorneos.appendChild(tarjeta);
        });
    };

    // Obtenemos los torneos desde el archivo JSON propio usando fetch con manejo de carga y errores
    const cargarTorneos = async () => {
        if (!contenedorTorneos || !estadoTorneos) return;

        // Mostramos el mensaje de carga mientras llegan los datos
        contenedorTorneos.innerHTML = '';
        estadoTorneos.innerHTML = '<div class="torneos-api__cargando">⏳ Cargando torneos disponibles...</div>';

        try {
            const respuesta = await fetch('data/torneos.json');

            // Si la respuesta HTTP no es correcta, lanzamos un error para manejarlo en el catch
            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status} al obtener los torneos`);
            }

            listaTorneos = await respuesta.json();
            renderizarTorneos();
        } catch (error) {
            // Avisamos al usuario con un mensaje claro y un botón para reintentar
            console.error('Error al cargar torneos con fetch:', error);
            estadoTorneos.innerHTML = `
                <div class="torneos-api__error">
                    <p>⚠️ No se pudieron cargar los torneos. Verifica tu conexión o abre el proyecto desde un servidor local.</p>
                    <button type="button" class="torneos-api__btn-reintentar" id="btn-reintentar-torneos">Reintentar</button>
                </div>
            `;

            const btnReintentar = document.getElementById('btn-reintentar-torneos');
            if (btnReintentar) {
                btnReintentar.addEventListener('click', cargarTorneos);
            }
        }
    };

    if (btnSoloFavoritos) {
        btnSoloFavoritos.addEventListener('click', () => {
            mostrarSoloFavoritos = !mostrarSoloFavoritos;
            renderizarTorneos();
        });
    }

    if (btnRecargarTorneos) {
        btnRecargarTorneos.addEventListener('click', cargarTorneos);
    }

    // Conectamos también el botón principal de noticias destacadas con SweetAlert2
    const btnInscribirDestacado = document.querySelector('.noticias-destacadas__btn');
    if (btnInscribirDestacado) {
        btnInscribirDestacado.addEventListener('click', () => {
            mostrarAlerta({
                title: 'Overwatch Weekly Tournament',
                text: '¿Deseas confirmar tu inscripción al torneo destacado?',
                showCancelButton: true,
                confirmButtonText: 'Inscribirme',
                cancelButtonText: 'Cancelar'
            }).then((res) => {
                if (res.isConfirmed) {
                    mostrarAlerta({
                        title: '¡Registrado!',
                        text: 'Te enviaremos los detalles de la partida pronto.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            });
        });
    }

    // Iniciamos la carga de torneos al abrir la página
    cargarTorneos();

    // Manejo del envío del formulario de registro con validación y SweetAlert2
    const formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const edad = Number(document.getElementById('edad')?.value || 0);
            const password = document.getElementById('password')?.value || '';
            const regexPassword = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

            if (edad < 13) {
                mostrarAlerta({
                    title: 'Edad no válida',
                    text: 'Debes tener al menos 13 años para registrarte.',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            if (!regexPassword.test(password)) {
                mostrarAlerta({
                    title: 'Contraseña insegura',
                    text: 'Debe tener mínimo 8 caracteres, al menos un número y un carácter especial.',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const gamertag = document.getElementById('gamertag')?.value.trim() || 'Gamer';
            mostrarAlerta({
                title: '¡Registro completado!',
                text: `Bienvenido a UltiHub, ${gamertag}. Tu cuenta ha sido registrada.`,
                confirmButtonText: 'Aceptar'
            }).then(() => {
                formRegistro.reset();
            });
        });
    }

});
