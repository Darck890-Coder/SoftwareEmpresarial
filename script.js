// Efectos de movimiento para los botones
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.button');
    
    // Efecto de entrada con animación escalonada
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.6s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Efecto de pulsación al hacer clic
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Crear efecto de onda
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Efecto de flotación suave
        button.addEventListener('mouseenter', function() {
            this.style.animation = 'float 2s ease-in-out infinite';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });
    
    // Efecto de seguimiento del mouse
    document.addEventListener('mousemove', function(e) {
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const intensity = (maxDistance - distance) / maxDistance;
                const rotateX = (deltaY / maxDistance) * 10 * intensity;
                const rotateY = (deltaX / maxDistance) * 10 * intensity;
                
                button.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            } else {
                button.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            }
        });
    });
    
    // Efecto de partículas al hacer hover
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            createParticles(this);
        });
    });
});

// Función para crear partículas
function createParticles(button) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        document.body.appendChild(particle);
        
        // Animación de la partícula
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 1;
        let scale = 1;
        
        const animate = () => {
            opacity -= 0.02;
            scale -= 0.01;
            
            if (opacity <= 0) {
                particle.remove();
                return;
            }
            
            particle.style.opacity = opacity;
            particle.style.transform = `translate(${vx * (1 - opacity)}px, ${vy * (1 - opacity)}px) scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}
