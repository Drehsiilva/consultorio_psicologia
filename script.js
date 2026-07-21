document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. CONTROLE DE ROLAGEM DO HEADER
       ========================================================================== */
    const header = document.getElementById('main-header');

    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);
    // Execução inicial para checar posição caso a página seja recarregada no meio
    handleHeaderScroll();


    /* ==========================================================================
       2. MENU MOBILE (HAMBÚRGUER)
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    };

    const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Fecha o menu ao clicar em qualquer link de âncora
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Fecha o menu se o usuário clicar fora dele
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickInsideToggle = menuToggle.contains(event.target);

        if (!isClickInsideMenu && !isClickInsideToggle && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });


    /* ==========================================================================
       3. ACORDEÃO DO FAQ
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionButton.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Fecha todos os itens abertos
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');

                const otherAnswer = otherItem.querySelector('.faq-answer');
                // Efeito slideUp sutil
                otherAnswer.style.display = 'none';
            });

            // Se o item clicado não estava ativo, abre ele
            if (!isActive) {
                item.classList.add('active');
                questionButton.setAttribute('aria-expanded', 'true');

                // Efeito slideDown sutil
                answer.style.display = 'block';
            }
        });
    });


    /* ==========================================================================
       4. VALIDAÇÃO E ENVIO DO FORMULÁRIO DE CONTATO
       ========================================================================== */
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // Expressões regulares para validação
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Aceita formatos de telefone comuns no Brasil: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

    const validateField = (input, regex, errorSpanId) => {
        const value = input.value.trim();
        const group = input.parentElement;
        let isValid = true;

        if (regex) {
            isValid = regex.test(value);
        } else {
            isValid = value.length > 0;
        }

        if (!isValid) {
            group.classList.add('invalid');
        } else {
            group.classList.remove('invalid');
        }

        return isValid;
    };

    // Validação em tempo real ao perder o foco (blur)
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const phoneInput = document.getElementById('form-phone');

    nameInput.addEventListener('blur', () => validateField(nameInput, null, 'error-name'));
    emailInput.addEventListener('blur', () => validateField(emailInput, emailRegex, 'error-email'));
    phoneInput.addEventListener('blur', () => validateField(phoneInput, phoneRegex, 'error-phone'));

    // Validação e envio real via Web3Forms
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateField(nameInput, null, 'error-name');
        const isEmailValid = validateField(emailInput, emailRegex, 'error-email');
        const isPhoneValid = validateField(phoneInput, phoneRegex, 'error-phone');

        if (isNameValid && isEmailValid && isPhoneValid) {
            // Desabilita o botão para evitar múltiplos cliques
            const submitBtn = document.getElementById('btn-submit-form');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(async (response) => {
                    let json = await response.json();
                    if (response.status === 200) {
                        formStatus.style.display = 'block';
                        formStatus.className = 'form-status success';
                        formStatus.textContent = 'Mensagem enviada com sucesso! A Dra. Neide entrará em contato em breve.';
                        form.reset();
                    } else {
                        formStatus.style.display = 'block';
                        formStatus.className = 'form-status error';
                        formStatus.textContent = json.message || 'Ocorreu um erro ao enviar a mensagem. Tente novamente.';
                    }
                })
                .catch(error => {
                    console.error(error);
                    formStatus.style.display = 'block';
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'Ocorreu um erro de conexão. Verifique sua internet e tente novamente.';
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;

                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 6000);
                });
        } else {
            // Feedback geral de erro de validação
            formStatus.style.display = 'block';
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Por favor, corrija os erros no formulário antes de enviar.';

            // Foca no primeiro campo com erro
            const firstInvalid = form.querySelector('.form-group.invalid input');
            if (firstInvalid) firstInvalid.focus();
        }
    });


    /* ==========================================================================
       5. REVELAÇÃO DE ELEMENTOS AO ROLAR A PÁGINA (SCROLL REVEAL)
       ========================================================================== */
    const revealElements = document.querySelectorAll(
        '.fade-in-element, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-card'
    );

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // viewport do navegador
            rootMargin: '0px',
            threshold: 0.15 // Dispara quando 15% do elemento estiver visível
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('element-visible');
                    // Uma vez revelado, não precisamos mais observar o elemento
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback para navegadores antigos sem suporte a IntersectionObserver
        revealElements.forEach(el => {
            el.classList.add('element-visible');
        });
    }
});
