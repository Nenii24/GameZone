import { validarRequerido, validarEdad, validarCorreo, validarPassword } from './validaciones.js';
import { mostrarError, limpiarErrores } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-registro');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); // Detiene el envío
            limpiarErrores();   // Limpia los mensajes del DOM
            
            const formData = new FormData(formulario);
            const datos = Object.fromEntries(formData.entries());
            const generosSeleccionados = formData.getAll('generos'); 
            
            let formularioValido = true;

            // Validar textos requeridos
            const camposRequeridos = ['nombre', 'apellido', 'nacionalidad', 'gamertag', 'plataforma'];
            camposRequeridos.forEach(campo => {
                const error = validarRequerido(datos[campo]);
                if (error) {
                    mostrarError(campo, error);
                    formularioValido = false;
                }
            });

            // Validar Reglas Específicas
            const errorEdad = validarEdad(datos.edad);
            if (errorEdad) { mostrarError('edad', errorEdad); formularioValido = false; }

            const errorCorreo = validarCorreo(datos.correo);
            if (errorCorreo) { mostrarError('correo', errorCorreo); formularioValido = false; }

            const errorPassword = validarPassword(datos.password);
            if (errorPassword) { mostrarError('password', errorPassword); formularioValido = false; }

            // Validar Radio Buttons (Sexo)
            if (!datos.sexo) {
                mostrarError('sexo', 'Por favor, selecciona una opción.');
                formularioValido = false;
            }

            // Validar Checkboxes (Géneros)
            if (generosSeleccionados.length === 0) {
                mostrarError('generos', 'Selecciona al menos un género de videojuego.');
                formularioValido = false;
            }

            // Verificar estado final
            if (formularioValido) {
                console.log('Datos enviados correctamente:', { ...datos, generos: generosSeleccionados });
                // formulario.submit(); // Descomenta si deseas enviar los datos al servidor
            } else {
                console.log('Se encontraron errores en el formulario.');
            }
        });
    }
});