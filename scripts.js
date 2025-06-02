'use strict';

// Configuração do EmailJS
const EMAILJS_CONFIG = {
    USER_ID: 'O_3_k5go5e-zTR_PF',
    SERVICE_ID: 'service_jos17dc',
    TEMPLATE_ID: 'template_2dm4l4o'
};

// Cache de elementos DOM
const DOM = {
    carousel: document.querySelector('.carousel'),
    carouselItems: document.querySelectorAll('.carousel-item'),
    prevBtn: document.getElementById('prev'),
    nextBtn: document.getElementById('next'),
    contactForm: document.getElementById('contactForm'),
    whatsappButton: document.getElementById('whatsapp-button'),
    navLinks: document.querySelectorAll('.nav-link'),
    floatingPhone: document.querySelector('.floating-phone'),
    sections: document.querySelectorAll('section')
};

// Estado do carrossel
const carouselState = {
    currentIndex: 0,
    totalItems: DOM.carouselItems.length,
    autoRotateInterval: null,
    isAutoRotating: true
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    setupContactForm();
    setupWhatsAppButton();
    enhanceAnimations();
    setupIntersectionObserver();
});

/**
 * Inicializa o carrossel com efeito de zoom ao centralizar
 */
function initCarousel() {
    if (!DOM.carousel || !DOM.carouselItems.length) return;

    // Configuração inicial
    updateCarousel();

    // Eventos dos botões
    DOM.prevBtn?.addEventListener('click', () => {
        carouselState.currentIndex = (carouselState.currentIndex - 1 + carouselState.totalItems) % carouselState.totalItems;
        updateCarousel();
    });

    DOM.nextBtn?.addEventListener('click', () => {
        carouselState.currentIndex = (carouselState.currentIndex + 1) % carouselState.totalItems;
        updateCarousel();
    });

    // Auto-rotação
    startAutoRotate();

    // Controles de pausa
    DOM.carousel.addEventListener('mouseenter', stopAutoRotate);
    DOM.carousel.addEventListener('mouseleave', startAutoRotate);
    DOM.carousel.addEventListener('touchstart', stopAutoRotate);
    DOM.carousel.addEventListener('touchend', startAutoRotate);
}

/**
 * Atualiza a posição e aparência do carrossel
 */
function updateCarousel() {
    DOM.carouselItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === carouselState.currentIndex) {
            item.classList.add('active');
            item.style.transform = 'scale(1)';
            item.style.opacity = '1';
        } else {
            item.style.transform = 'scale(0.8)';
            item.style.opacity = '0.7';
        }
    });

    const offset = -carouselState.currentIndex * 100;
    DOM.carousel.style.transform = `translateX(${offset}%)`;
}

/**
 * Inicia a rotação automática do carrossel
 */
function startAutoRotate() {
    if (carouselState.isAutoRotating) return;
    
    carouselState.isAutoRotating = true;
    carouselState.autoRotateInterval = setInterval(() => {
        carouselState.currentIndex = (carouselState.currentIndex + 1) % carouselState.totalItems;
        updateCarousel();
    }, 5000);
}

/**
 * Para a rotação automática do carrossel
 */
function stopAutoRotate() {
    if (!carouselState.isAutoRotating) return;
    
    carouselState.isAutoRotating = false;
    clearInterval(carouselState.autoRotateInterval);
}

/**
 * Configura o formulário de contato
 */
function setupContactForm() {
    if (!DOM.contactForm) return;

    // Verifica se o EmailJS está carregado
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS não está carregado!');
        return;
    }

    try {
        emailjs.init(EMAILJS_CONFIG.USER_ID);
    } catch (error) {
        console.error('Erro ao inicializar EmailJS:', error);
        return;
    }

    DOM.contactForm.addEventListener('submit', handleFormSubmit);
}

/**
 * Manipula o envio do formulário
 * @param {Event} e - Evento de submit
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(DOM.contactForm);
    const formValues = Object.fromEntries(formData.entries());

    // Validação
    if (!validateForm(formValues)) return;

    const submitButton = DOM.contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            formValues
        );

        showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        DOM.contactForm.reset();
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        showNotification('Erro ao enviar mensagem. Por favor, tente novamente.', 'error');
    } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

/**
 * Valida os dados do formulário
 * @param {Object} formValues - Valores do formulário
 * @returns {boolean} - Se o formulário é válido
 */
function validateForm(formValues) {
    const { name, email, message } = formValues;

    if (!name || !email || !message) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Por favor, insira um email válido.', 'error');
        return false;
    }

    return true;
}

/**
 * Mostra uma notificação
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success/error)
 */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Anima a entrada
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    // Remove após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Configura o botão de WhatsApp
 */
function setupWhatsAppButton() {
    if (!DOM.whatsappButton) return;

    DOM.whatsappButton.addEventListener('click', (e) => {
        const currentHref = DOM.whatsappButton.getAttribute('href');
        const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da OX Company.');
        
        if (!currentHref.includes('?text=')) {
            DOM.whatsappButton.setAttribute('href', `${currentHref}?text=${message}`);
        }
    });
}

/**
 * Aprimora as animações e efeitos visuais
 */
function enhanceAnimations() {
    // Efeito de sublinhado nos links do menu
    DOM.navLinks.forEach(link => {
        link.addEventListener('mouseenter', createUnderline);
        link.addEventListener('mouseleave', removeUnderline);
    });

    // Efeito de flutuação aprimorado para o celular
    if (DOM.floatingPhone) {
        animateFloatingPhone();
    }
}

/**
 * Cria efeito de sublinhado
 * @param {Event} e - Evento de mouseenter
 */
function createUnderline(e) {
    const underline = document.createElement('span');
    underline.classList.add('nav-underline');
    underline.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        height: 2px;
        background-color: var(--primary);
        transition: width 0.3s ease;
    `;
    
    e.target.appendChild(underline);
    requestAnimationFrame(() => underline.style.width = '100%');
}

/**
 * Remove efeito de sublinhado
 * @param {Event} e - Evento de mouseleave
 */
function removeUnderline(e) {
    const underline = e.target.querySelector('.nav-underline');
    if (underline) {
        underline.style.width = '0';
        setTimeout(() => underline.remove(), 300);
    }
}

/**
 * Anima o telefone flutuante
 */
function animateFloatingPhone() {
    let startTime = Date.now();
    
    function updatePhonePosition() {
        const elapsed = Date.now() - startTime;
        const yOffset = Math.sin(elapsed / 1000) * 10;
        const xOffset = Math.sin(elapsed / 1500) * 5;
        
        DOM.floatingPhone.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        requestAnimationFrame(updatePhonePosition);
    }
    
    requestAnimationFrame(updatePhonePosition);
}

/**
 * Configura o observador de interseção para animações
 */
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    DOM.sections.forEach(section => {
        section.classList.add('fade-in');
        sectionObserver.observe(section);
    });
}

// Adiciona estilos CSS para notificações
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-100%);
        transition: all 0.3s ease;
    }

    .notification.success {
        background-color: #4CAF50;
    }

    .notification.error {
        background-color: #f44336;
    }

    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
