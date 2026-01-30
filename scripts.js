/*
 * SCRIPTS.JS - Lógica e Interatividade para o site OX Company.
 * Este arquivo é carregado de forma assíncrona (defer) após o HTML ser analisado.
 */

// Aguarda o conteúdo do DOM ser totalmente carregado antes de executar os scripts.
document.addEventListener('DOMContentLoaded', () => {

    /* --- INICIALIZAÇÃO DE BIBLIOTECAS --- */

    // Configuração para o serviço de envio de e-mail EmailJS.
    const EMAILJS_CONFIG = {
        SERVICE_ID: 'service_jos17dc',
        TEMPLATE_ID: 'template_2dm4l4o',
        USER_ID: 'O_3_k5go5e-zTR_PF'
    };

    // Inicializa a biblioteca AOS (Animate On Scroll) para animações de rolagem.
    // A verificação `if (typeof AOS !== 'undefined')` garante que o script não quebre se a biblioteca não carregar.
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800, // Duração da animação em milissegundos.
            once: true,    // A animação acontece apenas uma vez por elemento.
        });
    }

    /* --- CARROSSEL DE RESULTADOS --- */

    // Seleciona os elementos do carrossel.
    const carousel = document.querySelector('.carousel');
    // Se o carrossel não existir na página, interrompe a execução deste bloco.
    if (!carousel) return;

    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    let currentIndex = 0; // Índice do slide atualmente visível.
    const totalItems = items.length; // Número total de slides.
    let autoRotateInterval; // Variável para armazenar o ID do intervalo de auto-rotação.

    /**
     * Atualiza a exibição do carrossel.
     * Move o contêiner de slides e aplica a classe 'active' ao slide correto.
     */
    function updateCarousel() {
        // Move o contêiner do carrossel para a esquerda com base no índice atual.
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;

        // Percorre todos os slides para atualizar a classe 'active'.
        items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentIndex) {
                item.classList.add('active');
            }
        });
    }

    /**
     * Inicia ou reinicia o temporizador de auto-rotação.
     * Limpa qualquer intervalo anterior para evitar múltiplos temporizadores.
     */
    function startAutoRotate() {
        clearInterval(autoRotateInterval); // Limpa o intervalo existente.
        autoRotateInterval = setInterval(() => {
            // Avança para o próximo slide.
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }, 15000); // Muda o slide a cada 15 segundos.
    }

    // Event listener para o botão "Próximo".
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalItems; // Avança o índice, voltando ao início se chegar ao fim.
        updateCarousel();
        startAutoRotate(); // Reinicia o temporizador de auto-rotação.
    });

    // Event listener para o botão "Anterior".
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems; // Retrocede o índice, indo para o final se estiver no início.
        updateCarousel();
        startAutoRotate(); // Reinicia o temporizador de auto-rotação.
    });

    // Define o slide inicial como ativo e inicia a auto-rotação.
    updateCarousel();
    startAutoRotate();

    /* --- NAVEGAÇÃO MÓVEL (HAMBURGER) --- */

    /**
     * Configura a funcionalidade do menu de navegação móvel (hamburger).
     */
    function setupMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const headerRight = document.querySelector('.header-right');
        const navLinks = document.querySelectorAll('.main-nav a, .btn-header-whatsapp');

        if (!navToggle || !headerRight) return;

        const toggleNav = () => {
            document.body.classList.toggle('nav-open');
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        };

        navToggle.addEventListener('click', toggleNav);

        // Fecha o menu ao clicar em um link (para navegação na mesma página)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('nav-open')) {
                    toggleNav();
                }
            });
        });
    }

    /* --- FORMULÁRIO DE CONTATO COM EMAILJS E NOTIFICAÇÕES --- */

    /**
     * Mostra uma notificação em formato de pop-up.
     * @param {string} message - A mensagem a ser exibida.
     * @param {'success' | 'error'} type - O tipo da notificação.
     * @param {string | null} icon - Um ícone customizado (opcional).
     */
    function showNotification(message, type, icon = null) {
        // Cria o elemento do pop-up.
        const popup = document.createElement('div');
        popup.className = `notification-popup ${type}`;
        const displayIcon = icon ? icon : (type === 'success' ? '✓' : '!');
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon">${displayIcon}</div>
                <div class="popup-message">${message}</div>
                <button class="popup-close">×</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Anima a entrada do pop-up.
        requestAnimationFrame(() => {
            popup.classList.add('visible');
        });

        // Função para fechar o pop-up.
        const closePopup = () => {
            // Se o popup já estiver invisível ou em processo de fechamento, não faz nada.
            if (!popup.classList.contains('visible')) return;

            popup.classList.remove('visible');
            // Garante que o elemento seja removido do DOM após a animação de saída (400ms, conforme o CSS).
            setTimeout(() => popup.remove(), 400);
        };

        // Adiciona evento de clique no botão de fechar.
        popup.querySelector('.popup-close').addEventListener('click', closePopup);

        // Fecha automaticamente após 5 segundos.
        setTimeout(closePopup, 5000);
    }

    /**
     * Valida os dados do formulário antes do envio.
     * @param {Object} formValues - Os valores dos campos do formulário.
     * @returns {boolean} - Retorna true se o formulário for válido, senão false.
     */
    function validateForm(formValues) {
        const { name, email, phone, message } = formValues;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || name.trim().length < 2) {
            showNotification('Opa! Parece que você esqueceu seu nome.', 'error', '👤');
            return false;
        }
        if (!email || !emailRegex.test(email)) {
            showNotification('Precisamos de um e-mail válido para responder.', 'error', '✉️');
            return false;
        }
        // Validação opcional do telefone: se preenchido, deve ter no mínimo 10 dígitos.
        if (phone && phone.replace(/\D/g, '').length < 10) {
            showNotification('O número de telefone parece inválido.', 'error', '📞');
            return false;
        }
        if (!message || message.trim().length < 10) {
            showNotification('Sua mensagem está um pouco curta. Conte-nos mais!', 'error', '✍️');
            return false;
        }
        return true;
    }

    /**
     * Formata o valor de um campo de telefone enquanto o usuário digita.
     * @param {InputEvent} event - O evento de input do campo.
     */
    function formatPhone(event) {
        const input = event.target;
        // Remove tudo que não for dígito e limita a 11 caracteres.
        let value = input.value.replace(/\D/g, '').substring(0, 11);

        if (value.length > 10) {
            // Formato para celular com 9 dígitos: (XX) XXXXX-XXXX
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 6) {
            // Formato para telefone fixo ou celular com 8 dígitos: (XX) XXXX-XXXX
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
            // Formato inicial: (XX) XXXX
            value = value.replace(/^(\d{2})(\d*)/, '($1) $2');
        }

        input.value = value;
    }

    /**
     * Manipula o evento de envio do formulário.
     * @param {Event} event - O evento de submit.
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());

        // Valida o formulário.
        if (!validateForm(formValues)) {
            return;
        }

        // Desabilita o botão e mostra o estado de "enviando".
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            // Envia o e-mail usando EmailJS.
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, formValues);
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            form.reset();
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            showNotification('Erro ao enviar a mensagem. Por favor, tente novamente mais tarde.', 'error');
        } finally {
            // Restaura o botão ao seu estado original.
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    /**
     * Configura o formulário de contato.
     */
    function setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Verifica se a biblioteca EmailJS está disponível.
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS não foi carregado. O formulário de contato não funcionará.');
            return;
        }

        // Adiciona o listener para formatação automática do telefone.
        const phoneInput = contactForm.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhone);
        }

        emailjs.init(EMAILJS_CONFIG.USER_ID);
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Inicia a configuração do formulário.
    setupMobileNav();
    setupContactForm();

});