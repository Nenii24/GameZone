export const mostrarError = (idCampo, mensaje) => {
    const spanError = document.getElementById(`error-${idCampo}`);
    if (spanError) {
        spanError.textContent = mensaje;
    }
};

export const limpiarErrores = () => {
    const spans = document.querySelectorAll('.error-msg');
    spans.forEach(span => {
        span.textContent = '';
    });
};