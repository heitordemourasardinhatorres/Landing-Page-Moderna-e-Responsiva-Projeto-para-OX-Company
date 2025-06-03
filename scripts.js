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
    const { name, email, phone, message } = formValues;

    // Validação do nome
    if (!name || name.trim().length < 2) {
        showNotification('Por favor, preencha seu nome completo.', 'error');
        return false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showNotification('Por favor, insira um email válido.', 'error');
        return false;
    }

    // Validação do telefone
    if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            showNotification('Por favor, insira um número de telefone válido (DDD + número).', 'error');
            return false;
        }
    }

    // Validação da mensagem
    if (!message || message.trim().length < 10) {
        showNotification('Por favor, escreva uma mensagem com pelo menos 10 caracteres.', 'error');
        return false;
    }

    return true;
}

/**
 * Valida o número de telefone durante a digitação
 * @param {Event} e - Evento de input
 */
function validatePhoneInput(e) {
    const phone = e.target.value;
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length > 11) {
        e.target.value = cleanPhone.slice(0, 11);
    }
}

/**
 * Valida o número de telefone quando o campo perde o foco
 * @param {Event} e - Evento de blur
 */
function validatePhoneBlur(e) {
    const phone = e.target.value;
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        showNotification('Por favor, insira um número de telefone válido (DDD + número).', 'error');
    }
}

// Adiciona validação do telefone
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', validatePhoneInput);
        phoneInput.addEventListener('blur', validatePhoneBlur);
    }
});

/**
 * Mostra uma notificação em formato de pop-up
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success/error)
 */
function showNotification(message, type) {
    // Cria o pop-up
    const popup = document.createElement('div');
    popup.className = `notification-popup ${type}`;
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-icon">
                ${type === 'success' ? '✓' : '!'}
            </div>
            <div class="popup-message">${message}</div>
            <button class="popup-close">×</button>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(popup);

    // Anima a entrada
    requestAnimationFrame(() => {
        popup.style.transform = 'translateY(0)';
        popup.style.opacity = '1';
    });

    // Função para fechar o pop-up
    const closePopup = () => {
        popup.style.transform = 'translateY(-100%)';
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    };

    // Eventos de fechamento
    const closeButton = popup.querySelector('.popup-close');
    closeButton.addEventListener('click', closePopup);

    // Fecha automaticamente após 5 segundos
    setTimeout(closePopup, 5000);
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

// Atualiza os estilos CSS para o pop-up
const style = document.createElement('style');
style.textContent = `
    .notification-popup {
  position: fixed;
  top: 20px;
  left: 25%;
  transform: translateX(-50%) translateY(-100%);
  background-color: var(--bg-dark);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 5px 30px rgba(22, 248, 31, 0.2);
  z-index: 999999;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.popup-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.popup-icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 248, 31, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.popup-message {
  color: var(--text-light);
  font-size: 1rem;
  line-height: 1.4;
  flex-grow: 1;
  padding-right: 1rem;
  text-align: left;
}

.popup-close {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--bg-dark);
  border: 2px solid var(--primary);
  color: var(--text-light);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.popup-close:hover {
  background-color: var(--primary);
  color: var(--bg-dark);
  transform: rotate(90deg);
}

.notification-popup.success {
  border-color: #4caf50;
}

.notification-popup.error {
  border-color: #f44336;
  left: 50%;
}

.notification-popup.success .popup-icon {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.notification-popup.error .popup-icon {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

/* Responsividade para tablets */
@media (max-width: 768px) {
  .notification-popup {
    top: 15px;
    padding: 1.25rem;
    max-width: 90%;
  }

  .popup-content {
    gap: 0.75rem;
  }

  .popup-icon {
    font-size: 1.3rem;
    width: 35px;
    height: 35px;
  }

  .popup-message {
    font-size: 0.95rem;
    padding-right: 0.75rem;
  }

  .popup-close {
    top: -8px;
    right: -8px;
    width: 22px;
    height: 22px;
    font-size: 1.1rem;
  }
}

/* Responsividade para celulares */
@media (max-width: 480px) {
  .notification-popup {
    top: 10px;
    left: 25%;
    transform: translateX(-50%) translateY(-100%);
    padding: 1rem;
    max-width: 95%;
    width: 90%;
    border-width: 1px;
    margin: 0 auto;
  }

  .popup-content {
    gap: 0.5rem;
    justify-content: flex-start;
  }

  .popup-icon {
    font-size: 1.1rem;
    width: 30px;
    height: 30px;
  }

  .popup-message {
    font-size: 0.9rem;
    padding-right: 0.5rem;
    line-height: 1.3;
    text-align: left;
  }

  .popup-close {
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    font-size: 1rem;
    border-width: 1px;
  }
}

/* Ajustes para telas muito pequenas */
@media (max-width: 320px) {
  .notification-popup {
    padding: 0.75rem;
    width: 95%;
    left: 25%;
    transform: translateX(-50%) translateY(-100%);
  }

  .popup-content {
    justify-content: flex-start;
  }

  .popup-icon {
    width: 25px;
    height: 25px;
    font-size: 1rem;
  }

  .popup-message {
    font-size: 0.85rem;
    text-align: left;
  }

  .popup-close {
    width: 18px;
    height: 18px;
    font-size: 0.9rem;
  }
}

/* Ajustes para orientação paisagem em dispositivos móveis */
@media (max-height: 500px) and (orientation: landscape) {
  .notification-popup {
    top: 5px;
    padding: 0.75rem;
  }

  .popup-content {
    gap: 0.5rem;
  }

  .popup-icon {
    width: 25px;
    height: 25px;
    font-size: 1rem;
  }

  .popup-message {
    font-size: 0.85rem;
    line-height: 1.2;
  }
}

`;
document.head.appendChild(style);
