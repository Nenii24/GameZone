export const validarRequerido = (valor) => {
    return (valor && valor.trim() !== '') ? '' : 'Este campo es obligatorio.';
};

export const validarEdad = (edad) => {
    const num = parseInt(edad, 10);
    return (num >= 18 && num <= 100) ? '' : 'La edad debe estar entre 18 y 100 años.';
};

export const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo) ? '' : 'Ingresa un correo electrónico válido.';
};

export const validarPassword = (password) => {
    return password.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.';
};