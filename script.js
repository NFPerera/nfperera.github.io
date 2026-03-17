document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetSection = document.querySelector(this.getAttribute('href'));
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

const typingText = document.getElementById('typing-text');
const phrases = ["Software Developer", "Gameplay Programmer", "Unity Expert"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typingText.innerText = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.innerText = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500;
    
    }

    setTimeout(type, typingSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    if(typingText) setTimeout(type, 1000);
});

const emailBtn = document.getElementById('email-btn');
const myEmail = "tu-email@ejemplo.com"; // REEMPLAZA ESTO CON TU EMAIL REAL

if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(myEmail).then(() => {
            // Feedback visual: cambia el texto del botón
            const originalText = emailBtn.innerText;
            emailBtn.innerText = "Copied!";
            emailBtn.style.backgroundColor = "#2ea44f"; // Cambia a verde éxito

            // Revierte el cambio después de 2 segundos
            setTimeout(() => {
                emailBtn.innerText = originalText;
                emailBtn.style.backgroundColor = ""; // Vuelve al color original del CSS
            }, 2000);
        }).catch(err => {
            console.error('Error copying email: ', err);
        });
    });
}