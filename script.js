document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', (e) => {
        console.log(`Redirigiendo a ${e.target.href}`);
    });
});