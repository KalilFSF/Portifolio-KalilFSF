// Use DOMContentLoaded para garantir que todos os elementos HTML (incluindo o canvas) estejam carregados
addEventListener('DOMContentLoaded', () => {

    // ==================================
    // 1. CLASSE PARTICLE (PARTÍCULA)
    // ==================================
    class Particle {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.velocity = velocity;
            this.alpha = 0.8;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        update(width, height) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            if (this.x - this.radius > width) {
                this.x = -this.radius;
            } else if (this.y + this.radius < 0) {
                this.y = height + this.radius;
            }
        }
    }

    // ==================================
    // 2. CLASSE PARTICLESYSTEM (SISTEMA)
    // ==================================
    class ParticleSystem {
        constructor(canvasId, config) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.config = config;
            this.particles = [];
            this.mouse = { x: null, y: null, radius: 100 };

            this.init();
            this.animate();
        }

        init() {
            this.resizeCanvas();
            this.createParticles();
            this.addEventListeners();
        }

        resizeCanvas() {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }

        createParticles() {
            const { particleCount, minRadius, maxRadius, colors, speed } = this.config;
            this.particles = [];

            for (let i = 0; i < particleCount; i++) {
                const radius = Math.random() * (maxRadius - minRadius) + minRadius;
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const color = colors[Math.floor(Math.random() * colors.length)];

                const velocity = {
                    x: Math.random() * speed * 0.8 + 0.1,
                    y: -(Math.random() * speed * 0.8 + 0.1)
                };

                this.particles.push(new Particle(x, y, radius, color, velocity));
            }
        }

        addEventListeners() {
            window.addEventListener('resize', () => {
                this.resizeCanvas();
                this.createParticles();
            });

            if (this.config.interactive) {
                const updateMousePosition = (clientX, clientY) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const NON_INTERACTIVE_ELEMENTS_ID = ['mainCanvas', 'interacao'];
                    const topElement = document.elementFromPoint(clientX, clientY);

                    if (topElement) {
                        let isOverBlockingElement = true;
                        if (topElement.closest(`#${NON_INTERACTIVE_ELEMENTS_ID[0]}`) ||
                            topElement.closest(`#${NON_INTERACTIVE_ELEMENTS_ID[1]}`)) {
                            isOverBlockingElement = false;
                        }
                        if (isOverBlockingElement) {
                            this.mouse.x = null;
                            this.mouse.y = null;
                            return;
                        }
                    }

                    this.mouse.x = clientX - rect.left;
                    this.mouse.y = clientY - rect.top;

                    if (this.mouse.x < 0 || this.mouse.x > this.canvas.width ||
                        this.mouse.y < 0 || this.mouse.y > this.canvas.height) {
                        this.mouse.x = null;
                        this.mouse.y = null;
                    }
                };

                window.addEventListener('mousemove', (event) => {
                    updateMousePosition(event.clientX, event.clientY);
                });

                window.addEventListener('touchmove', (event) => {
                    if (event.touches.length > 0) {
                        const touch = event.touches[0];
                        updateMousePosition(touch.clientX, touch.clientY);
                        event.preventDefault();
                    }
                });

                window.addEventListener('touchend', () => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                });

                window.addEventListener('mouseup', () => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                });
            }
        }

        animate = () => {
            requestAnimationFrame(this.animate);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(particle => {
                particle.update(this.canvas.width, this.canvas.height);
                particle.draw(this.ctx);

                if (this.config.interactive && this.mouse.x !== null) {
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const repulsionStrength = 0.1;

                        particle.velocity.x -= forceDirectionX * (repulsionStrength * (1 - distance / this.mouse.radius));
                        particle.velocity.y -= forceDirectionY * (repulsionStrength * (1 - distance / this.mouse.radius));
                    }
                }

                const maxSpeed = 1.6;
                const speed = Math.sqrt(particle.velocity.x * particle.velocity.x + particle.velocity.y * particle.velocity.y);
                if (speed > maxSpeed) {
                    particle.velocity.x = (particle.velocity.x / speed) * maxSpeed;
                    particle.velocity.y = (particle.velocity.y / speed) * maxSpeed;
                }
            });
        }
    }

    // ==================================
    // 3. CONFIGURAÇÃO E INICIALIZAÇÃO DO SISTEMA DE PARTÍCULAS
    // ==================================
    const lightColors = ['#EDC687', '#D78D58', '#BD6246'];
    const darkColors = ['#C0F8FF', '#34C6BC', '#536BB2'];

    const config = {
        particleCount: 150,
        minRadius: 3.1,
        maxRadius: 7,
        speed: 1,
        colors: lightColors,
        interactive: true
    };

    const particleSystem = new ParticleSystem('mainCanvas', config);

    // ==================================
    // 5. MODO ESCURO (ATUALIZADO)
    // ==================================
    const toggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        body.classList.add('dark-mode');
        toggle.checked = true;
        config.colors = darkColors;
        particleSystem.createParticles();
    }

    iniciarRaspadinha();

    function updateParticleColors() {
        const newColors = body.classList.contains('dark-mode') ? darkColors : lightColors;
        config.colors = newColors;
        particleSystem.createParticles();
    }

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
        updateParticleColors();
        drawLines();
        iniciarRaspadinha();
    });


    // ==================================
    // 4. LÓGICA DA LINHA DE MENU (MARKER UNDERLINE) - MODIFICADA
    // ==================================
    const marker = document.getElementById('marker');
    const navLinks = document.querySelectorAll('.nav-links a');
    let activeLink = null; // Começa sem link ativo
    let isHovering = false; // Controla se o mouse está sobre algum link

    // Função que move o marcador para a posição do elemento
    function updateMarker(element, show = true) {
        if (!marker || !element) {
            // Oculta o marcador se não houver elemento de destino válido
            marker.style.width = '0px';
            marker.style.opacity = 0;
            return;
        }

        // Calcula as posições relativas ao elemento pai do marker (que é o <nav>)
        const nav = marker.parentElement;
        if (!nav) return;

        // Posição do link e do nav em relação à viewport
        const linkRect = element.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();

        // Largura e posição X relativa dentro do nav
        const newWidth = linkRect.width;
        // Posição X (horizontal) do link menos a posição X do NAV
        const newX = linkRect.left - navRect.left;

        // Cálculo da posição vertical (Y)
        const newY = linkRect.bottom - navRect.top - 5;

        // Aplica a transformação
        marker.style.width = `${newWidth}px`;
        marker.style.transform = `translate(${newX}px, ${newY}px)`;
        marker.style.opacity = show ? 1 : 0; // Controla a visibilidade

        if (show) {
            activeLink = element;
        }
    }

    // Função para encontrar e mover para o link ativo (baseado no hash da URL)
    function moveToActiveLink() {
        // Tenta usar o hash atual
        const currentHash = window.location.hash;
        const targetLink = currentHash ? document.querySelector(`.nav-links a[href="${currentHash}"]`) : null;

        if (targetLink) {
            updateMarker(targetLink, true);
            activeLink = targetLink;
        } else {
            // Se não encontrar o hash, oculta o marker
            updateMarker(null, false);
            activeLink = null;
        }
    }

    // Inicializa o marcador na posição correta ao carregar
    moveToActiveLink();

    // Adiciona o listener para o evento hashchange
    window.addEventListener('hashchange', moveToActiveLink);

    navLinks.forEach(link => {
        // Mover o marker ao passar o mouse (hover) - APENAS MOSTRA
        link.addEventListener('mouseenter', (e) => {
            isHovering = true;
            updateMarker(e.target, true);
        });

        // Restaurar estado ao sair do link - APENAS SE NÃO FOR O LINK ATIVO
        link.addEventListener('mouseleave', (e) => {
            isHovering = false;

            // Se não é o link ativo e não estamos clicando, volta para o estado anterior
            if (activeLink !== e.target) {
                // Pequeno delay para evitar flickering
                setTimeout(() => {
                    if (!isHovering) {
                        moveToActiveLink();
                    }
                }, 50);
            }
        });

        // Mover o marker ao clicar no link (mantém o marker visível)
        link.addEventListener('click', (e) => {
            updateMarker(e.target, true);
            activeLink = e.target;

            // Timeout para garantir que o scroll tenha tempo de ocorrer
            setTimeout(() => {
                moveToActiveLink();
            }, 100);
        });

        // Evento de focus (para acessibilidade via teclado)
        link.addEventListener('focus', (e) => {
            updateMarker(e.target, true);
        });

        // Evento de blur (para acessibilidade via teclado)
        link.addEventListener('blur', (e) => {
            if (activeLink !== e.target) {
                moveToActiveLink();
            }
        });
    });

    // Quando o mouse sai da área de navegação, move o marcador de volta para o link 'ativo'
    const navElement = document.querySelector('nav');
    if (navElement) {
        navElement.addEventListener('mouseleave', () => {
            isHovering = false;
            // Só move de volta se não houver um link com foco (teclado)
            if (!navElement.contains(document.activeElement)) {
                moveToActiveLink();
            }
        });
    }

    // Lida com o redimensionamento da janela para recalcular a posição
    window.addEventListener('resize', () => {
        // Recalcula a posição com base no link ativo
        moveToActiveLink();
    });


    // ==================================
    // 6. PONTEIRO PERSONALIZADO
    // ==================================
    const pointerMain = document.getElementById('custom-pointer');
    const pointerTrail = document.getElementById('custom-pointer-trail');

    let mouseX = 0, mouseY = 0;
    let mainX = 0, mainY = 0;
    let trailX = 0, trailY = 0;

    let mainSpeed = 0.2;   // Velocidade de resposta da bolinha principal
    let trailSpeed = 0.08; // Velocidade mais lenta para o rastro

    // Atualiza posição do mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Anima o movimento das duas bolinhas
    function animateCursors() {
        // Movimento suave da bolinha principal
        mainX += (mouseX - mainX) * mainSpeed;
        mainY += (mouseY - mainY) * mainSpeed;

        // Movimento mais atrasado da bolinha de trilha
        trailX += (mouseX - trailX) * trailSpeed;
        trailY += (mouseY - trailY) * trailSpeed;

        // Centralização automática
        pointerMain.style.left = `${mainX}px`;
        pointerMain.style.top = `${mainY}px`;

        pointerTrail.style.left = `${trailX}px`;
        pointerTrail.style.top = `${trailY}px`;

        requestAnimationFrame(animateCursors);
    }
    animateCursors();

    // Efeitos de hover e seleção
    const linkTargets = document.querySelectorAll('.cursor-link-button');
    const textTargets = document.querySelectorAll('.cursor-text-box');

    linkTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            pointerMain.classList.remove('cursor-text-select');
            pointerMain.classList.add('cursor-hovered');
            pointerTrail.style.width = '60px';
            pointerTrail.style.height = '60px';
            pointerTrail.style.opacity = '0.65';
            mainSpeed = 0.3;
        });
        target.addEventListener('mouseleave', () => {
            pointerMain.classList.remove('cursor-hovered');
            pointerTrail.style.width = '40px';
            pointerTrail.style.height = '40px';
            pointerTrail.style.opacity = '1';
            mainSpeed = 0.2;
        });
    });

    textTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            pointerMain.classList.remove('cursor-hovered');
            pointerMain.classList.add('cursor-text-select');
            pointerTrail.style.borderRadius = "0px";
            pointerMain.style.borderRadius = "0px";
            pointerTrail.style.width = '20px';
            pointerMain.style.width = '10px';
            mainSpeed = 0.3;
        });
        target.addEventListener('mouseleave', () => {
            pointerMain.classList.remove('cursor-text-select');
            pointerTrail.style.borderRadius = "50%";
            pointerMain.style.borderRadius = "50%";
            pointerTrail.style.width = '40px';
            pointerMain.style.width = '20px';
            mainSpeed = 0.2;
        });
    });



    // ==================================
    // 7. HABILIDADES (Soft/Hard) — linha dinâmica estilo nav
    // ==================================
    const botaoSoft = document.getElementById("botaoSoft");
    const botaoHard = document.getElementById("botaoHard");
    const linhaMarker = document.getElementById("linha-marker");
    const habilidadesSoft = document.querySelectorAll(".habilidade-soft");
    const habilidadesHard = document.querySelectorAll(".habilidade-hard");

    let botaoAtivo = botaoSoft; // começa com Soft ativo

    function atualizarLinha(elemento) {
        const container = elemento.parentElement;
        const rectEl = elemento.getBoundingClientRect();
        const rectParent = container.getBoundingClientRect();

        const novaLargura = rectEl.width;
        const novaPosX = rectEl.left - rectParent.left;

        linhaMarker.style.width = `${novaLargura}px`;
        linhaMarker.style.transform = `translateX(${novaPosX}px)`;
        linhaMarker.style.opacity = 1;
    }

    function animarTroca(cardsOcultar, cardsMostrar) {
        cardsOcultar.forEach(card => {
            card.classList.remove("entrando", "visivel");
            card.classList.add("saindo");
        });

        setTimeout(() => {
            cardsOcultar.forEach(card => {
                card.style.display = "none";
                card.classList.remove("saindo");
            });

            cardsMostrar.forEach(card => {
                card.style.display = "block";
                card.classList.add("entrando");
            });

            requestAnimationFrame(() => {
                cardsMostrar.forEach(card => {
                    card.classList.remove("entrando");
                    card.classList.add("visivel");
                });
            });

            setTimeout(iniciarRaspadinha, 120);

        }, 250);
    }

    function mostrarSoft() {
        botaoSoft.classList.add("ativo");
        botaoHard.classList.remove("ativo");
        botaoAtivo = botaoSoft;
        atualizarLinha(botaoSoft);

        animarTroca(habilidadesHard, habilidadesSoft);
    }

    function mostrarHard() {
        botaoHard.classList.add("ativo");
        botaoSoft.classList.remove("ativo");
        botaoAtivo = botaoHard;
        atualizarLinha(botaoHard);

        animarTroca(habilidadesSoft, habilidadesHard);
    }

    botaoSoft.addEventListener("click", mostrarSoft);
    botaoHard.addEventListener("click", mostrarHard);

    setTimeout(iniciarRaspadinha, 50);

    // Atualiza posição em resize (responsivo)
    window.addEventListener("resize", () => {
        if (botaoAtivo) atualizarLinha(botaoAtivo);
    });

    // Inicializa com Soft ativo
    mostrarSoft();

    /* javascript.js */
    /* ADICIONE depois de mostrarSoft(); */

    const coinToggle = document.getElementById("coinToggle");
    let cardsOpened = false;

    function atualizarEstadoMoeda() {
    document.body.classList.toggle("cards-open", cardsOpened);
    coinToggle.classList.toggle("flipped", cardsOpened);

    /* animação em TODOS os canvases ao abrir e fechar */
    const canvases = document.querySelectorAll(".scratch-canvas");

    canvases.forEach((canvas, index) => {
        canvas.style.transition = "none";
        canvas.style.transform = "scale(.95)";
        canvas.style.opacity = cardsOpened ? "1" : "0";

        setTimeout(() => {
            canvas.style.transition =
                "transform .45s cubic-bezier(.22,1,.36,1), opacity .45s ease";

            canvas.style.transform = "scale(1)";
            canvas.style.opacity = cardsOpened ? "0" : "1";
        }, 20 + (index * 40));
    });
}

    coinToggle.addEventListener("click", () => {
        cardsOpened = !cardsOpened;
        atualizarEstadoMoeda();
    });

    /* sempre que recriar a raspadinha mantém estado */
    const iniciarRaspadinhaOriginal = iniciarRaspadinha;

    iniciarRaspadinha = function () {
        iniciarRaspadinhaOriginal();

        if (cardsOpened) {
            document.body.classList.add("cards-open");
        }
    };

    // ===================================
    // 6. LÓGICA DO EFEITO MOUSE-FOLLOW (GSAP)
    // Aplicado APENAS na div #alternar-habilidades
    // ===================================
    const alternarHabilidades = document.getElementById("alternar-habilidades");
    const bgEffectCursor = document.querySelector(".bg-effect-cursor");
    const bgEffectShapes = document.querySelectorAll(".bg-effect-shapes .shape");

    if (alternarHabilidades && bgEffectCursor && bgEffectShapes.length > 0) {

        // Listener de movimento de mouse APENAS na div alvo
        alternarHabilidades.addEventListener("mousemove", (evt) => {

            const rect = alternarHabilidades.getBoundingClientRect();

            const mouseX = evt.clientX - rect.left;
            const mouseY = evt.clientY - rect.top;

            gsap.set(bgEffectCursor, {
                x: mouseX,
                y: mouseY
            });

            gsap.to(bgEffectShapes, {
                x: mouseX,
                y: mouseY,
                stagger: -0.08,
                ease: "power2.out",
                duration: 0.45
            });

        });

        // Efeito de aparecer/desaparecer ao entrar e sair
        alternarHabilidades.addEventListener("mouseenter", () => {
            gsap.to([bgEffectCursor, bgEffectShapes], {
                opacity: 1,
                duration: 0.3
            });
        });

        alternarHabilidades.addEventListener("mouseleave", () => {
            gsap.to([bgEffectCursor, bgEffectShapes], {
                opacity: 0,
                duration: 0.5
            });
        });
    }


    const layers = [
        { element: document.getElementById('sky-layer'), speed: 0.1 },
        { element: document.getElementById('mountain-layer'), speed: 0.5 },
        { element: document.getElementById('road-layer'), speed: 1.5 }
    ];

    const toggleButton = document.getElementById('toggle-button');
    const constellationOverlay = document.getElementById('constellation-overlay');
    const sites = document.getElementById('sites')
    const car = document.getElementById('car');

    let isMoving = false;
    let positionX = 0;
    let lastTimestamp = 0;
    const BASE_VELOCITY = 10;
    const TRAVEL_DURATION = 10000; // 10 segundos
    let animationFrame;


    // Movimento da direita para a esquerda
    function animate(timestamp) {
        if (!isMoving) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        if (lastTimestamp === 0) lastTimestamp = timestamp;
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        const distance = BASE_VELOCITY * deltaTime;
        positionX += distance;

        layers.forEach(layer => {
            const transformValue = -positionX * layer.speed;
            layer.element.style.transform = `translateX(${transformValue}vw)`;
        });

        animationFrame = requestAnimationFrame(animate);
    }

    // Inicia o movimento e para automaticamente
    function startMovement() {
        if (isMoving) return;

        positionX = 0;
        layers.forEach(layer => layer.element.style.transform = `translateX(0)`);

        isMoving = true;
        lastTimestamp = 0;
        toggleButton.disabled = true;
        toggleButton.textContent = 'Viajando...';
        toggleButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        toggleButton.classList.add('bg-gray-500', 'cursor-not-allowed');
        constellationOverlay.style.opacity = '0';
        sites.style.opacity = '0';
        sites.style.pointerEvents = 'none'
        animationFrame = requestAnimationFrame(animate);

        setTimeout(() => {
            isMoving = false;
            constellationOverlay.style.opacity = '1';
            sites.style.opacity = '1';
            sites.style.pointerEvents = 'all'
            toggleButton.textContent = 'Fazer Viagem Novamente';
            toggleButton.disabled = false;
            toggleButton.classList.remove('bg-gray-500', 'cursor-not-allowed');
            toggleButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        }, TRAVEL_DURATION);
    }

    toggleButton.addEventListener('click', startMovement);

    // Troca de veículo
    document.querySelectorAll('.vehicle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            car.innerHTML = btn.innerHTML;

            // Remove classes antigas
            car.classList.remove('carro', 'moto', 'viagem', 'onibus');

            // Detecta o tipo de imagem pelo botão
            if (btn.querySelector('.imagem-carro')) {
                car.classList.add('carro');
            } else if (btn.querySelector('.imagem-moto')) {
                car.classList.add('moto');
            } else if (btn.querySelector('.imagem-viagem')) {
                car.classList.add('viagem');
            } else if (btn.querySelector('.imagem-onibus')) {
                car.classList.add('onibus');
            }
        });
    });

    function generateStars(count) {
        constellationOverlay.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '●';
            const top = Math.random() * 60 + 5;
            const left = Math.random() * 100;
            const size = Math.random() * 0.8 + 0.5;
            star.style.top = `${top}vh`;
            star.style.left = `${left}vw`;
            star.style.fontSize = `${size}rem`;
            star.style.animationDelay = `${Math.random() * 4}s`;
            constellationOverlay.appendChild(star);
        }
    }


    generateStars(50);

    const estrelas = document.querySelectorAll('.bolinha');
    const modals = document.querySelectorAll('.conteudo');
    const svg = document.getElementById('lines');

    // === Conexões entre as estrelas ===
    const connections = [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [3, 4],
        [4, 5]
    ];

    // === Função que desenha as linhas ===
    function drawLines() {
        svg.innerHTML = "";
        const rect = svg.getBoundingClientRect();

        connections.forEach(([a, b]) => {
            const p1 = estrelas[a].getBoundingClientRect();
            const p2 = estrelas[b].getBoundingClientRect();

            const x1 = p1.left - rect.left + p1.width / 2;
            const y1 = p1.top - rect.top + p1.height / 2;
            const x2 = p2.left - rect.left + p2.width / 2;
            const y2 = p2.top - rect.top + p2.height / 2;

            const themeStarColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--cor-estrelas')
                .trim();

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);


            svg.appendChild(line);
        });
    }

    // === Abrir modal ao clicar na estrela ===
    estrelas.forEach((estrela, i) => {
        estrela.addEventListener("click", () => {
            modals[i].style.display = "block";
        });
    });

    // === Fechar modal ao clicar no X ===
    const closes = document.querySelectorAll(".close");
    closes.forEach(close => {
        close.addEventListener("click", () => {
            modals.forEach(m => m.style.display = "none");
        });
    });


    // === Fechar modal ao clicar fora do conteúdo ===
    modals.forEach(modal => {
        modal.addEventListener("click", (event) => {
            // Só fecha se o clique for exatamente no fundo (fora do conteúdo)
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // === Redesenhar linhas ao carregar e redimensionar ===
    window.addEventListener("load", drawLines);
    window.addEventListener("resize", drawLines);

});

// ==================================
// CURSOR COLOR CHANGE IN CONTACT SECTION
// ==================================
const inverso = document.querySelectorAll('.inverso');
const pointerMain = document.getElementById('custom-pointer');
const pointerTrail = document.getElementById('custom-pointer-trail');

inverso.forEach(section => {

    section.addEventListener('mouseenter', () => {
        pointerMain.style.setProperty('background-color', 'var(--mouse-eye-conts)');
        pointerTrail.style.setProperty('background-color', 'var(--mouse-conts)');
    });

    section.addEventListener('mouseleave', () => {
        pointerMain.style.setProperty('background-color', 'var(--mouse-eye-color)');
        pointerTrail.style.setProperty('background-color', 'var(--mouse-color)');
    });

});

const form = document.getElementById('form-contato');

form.addEventListener('submit', function (event) {
    // 1. Impede o envio padrão do formulário (que causa o erro POST)
    event.preventDefault();

    // 2. Coleta os dados (opcional)
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    // ... continue para outros campos

    // 3. FAÇA O QUE VOCÊ QUISER COM OS DADOS AQUI!
    // Exemplo: Mostrar no console, enviar por uma API Fetch, etc.
    console.log("Dados coletados:", nome, email);

    // Opcional: Limpar o formulário
    form.reset();
});

let telefone = document.getElementById("telefone")
telefone.addEventListener("input", () => {
    let telefone = document.getElementById("telefone").value
    telefone = telefone.slice(0, 15)
    document.getElementById("telefone").value = telefone

    if (telefone[0] != "(") {
        if (telefone[0] != undefined) {
            document.getElementById("telefone").value = telefone.slice(0, 0) + "(" + telefone.slice(0)
        }
    }
    if (telefone[3] != ")") {
        if (telefone[3] != undefined) {
            document.getElementById("telefone").value = telefone.slice(0, 3) + ")" + telefone.slice(3)
        }
    }
    if (telefone[4] != " ") {
        if (telefone[4] != undefined) {
            document.getElementById("telefone").value = telefone.slice(0, 4) + " " + telefone.slice(4)
        }
    }
    if (telefone[10] != "-") {
        if (telefone[10] != undefined) {
            document.getElementById("telefone").value = telefone.slice(0, 10) + "-" + telefone.slice(10)
        }
    }
});

const container = document.getElementById("fotoContainer");
const topo = document.getElementById("imgTopo");

let aberto = false; // controla estado

// 🔹 Mouse follow (efeito spotlight)
container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    topo.style.setProperty("--x", `${x}px`);
    topo.style.setProperty("--y", `${y}px`);
});

// 🔹 Clique → animação radial
container.addEventListener("click", (e) => {
    const rect = container.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    topo.style.setProperty("--x", `${x}px`);
    topo.style.setProperty("--y", `${y}px`);

    if (!aberto) {
        expandirMascara();
    } else {
        contrairMascara();
    }

    aberto = !aberto;
});

// 🔥 animação expandir
function expandirMascara() {
    let radius = 0;

    const max = Math.sqrt(
        container.offsetWidth ** 2 + container.offsetHeight ** 2
    );

    const anim = setInterval(() => {
        radius += 20;
        topo.style.setProperty("--r", `${radius}px`);

        if (radius >= max) clearInterval(anim);
    }, 10);
}

// 🔥 animação contrair (invertida)
function contrairMascara() {
    let radius = Math.sqrt(
        container.offsetWidth ** 2 + container.offsetHeight ** 2
    );

    const anim = setInterval(() => {
        radius -= 20;
        topo.style.setProperty("--r", `${radius}px`);

        if (radius <= 0) clearInterval(anim);
    }, 10);
}

function drawCoverImage(ctx, img, canvas) {
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function iniciarRaspadinha() {
    const cards = document.querySelectorAll(".cartao");

    cards.forEach(card => {
        const oldCanvas = card.querySelector(".scratch-canvas");
        if (oldCanvas) oldCanvas.remove();

        const canvas = document.createElement("canvas");
        canvas.classList.add("scratch-canvas");

        const ctx = canvas.getContext("2d");
        card.appendChild(canvas);

        const resizeCanvas = () => {
            const width = card.offsetWidth;
            const height = card.offsetHeight;

            if (width === 0 || height === 0) return;

            canvas.width = width;
            canvas.height = height;

            const isDark = document.body.classList.contains("dark-mode");

            const img = new Image();
            img.src = isDark
                ? "imgs/raspar-noite.png"
                : "imgs/raspar-dia.png";

            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawCoverImage(ctx, img, canvas);
            };
        };

        resizeCanvas();

        let drawing = false;

        function raspar(x, y) {
            ctx.globalCompositeOperation = "destination-out";

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
            gradient.addColorStop(0, "rgba(0,0,0,1)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();

            const touch = e.touches ? e.touches[0] : e;

            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }

        function start(e) {
            drawing = true;
            const pos = getPos(e);
            raspar(pos.x, pos.y);
        }

        function move(e) {
            if (!drawing) return;
            e.preventDefault();

            const pos = getPos(e);
            raspar(pos.x, pos.y);
        }

        function end() {
            drawing = false;
        }

        canvas.addEventListener("mousedown", start);
        canvas.addEventListener("mousemove", move);
        canvas.addEventListener("mouseup", end);
        canvas.addEventListener("mouseleave", end);

        canvas.addEventListener("touchstart", start, { passive: false });
        canvas.addEventListener("touchmove", move, { passive: false });
        canvas.addEventListener("touchend", end);

        window.addEventListener("resize", resizeCanvas);
    });
}



// ==================================
// 8. TRADUÇÃO PORTUGUÊS/INGLÊS
// ==================================
const languageToggle = document.getElementById('languageToggle');
const languageText = document.getElementById('languageText');
let currentLanguage = 'pt';

// Textos traduzidos
const translations = {
    pt: {
        // Navegação
        sobreMim: "Sobre Mim",
        skills: "Skills",
        projetos: "Projetos",
        contato: "Contato",
        resume: "Currículo",

        // Header
        ola: "Olá! Eu sou",
        slogan: "Um Desenvolvedor de Softwares que Busca Resolver.",
        verProjetos: "Ver Projetos",
        entreContato: "Entre em Contato",

        // Sobre Mim
        sobreMimTitulo: "Sobre Mim",
        sobreMimTexto1: "Eu sou o Kalil, um estudante de 16 anos, que está atualmente no 2º ano do ensino médio técnico do COTEMIG. Atuo na área de TI, com foco em criação de Softwares/Sites e Agentes de IA para automação.",
        sobreMimTexto2: "Meu perfil comportamental é Analista e Planejador, gosto de compreender a lógica por traz das coisas e das pessoas ao meu redor, e posso dizer que sou alguém bastante observador.",
        sobreMimTexto3: "Tenho experiência em HTML/CSS/JS, MySQL, C#, N8N entre outras habilidades que você poderá ver na aba Skills, então não tenha pressa.",

        // Skills
        minhasSkills: "Minhas Skills",
        softSkills: "Soft Skills",
        hardSkills: "Hard Skills",

        // Soft Skills
        comunicacao: "Comunicação",
        comunicacaoDesc: "Se expressar bem e ouvir com atenção.",
        prestatividade: "Prestatividade",
        prestatividadeDesc: "Colaborar e ajudar os colegas.",
        lideranca: "Liderança",
        liderancaDesc: "Guiar e inspirar o time.",
        criatividade: "Criatividade",
        criatividadeDesc: "Pensar em soluções fora da caixa.",
        empatia: "Empatia",
        empatiaDesc: "Entender o ponto de vista dos outros.",
        organizacao: "Organização",
        organizacaoDesc: "Gerenciar tempo e tarefas com eficiência.",
        adaptabilidade: "Adaptabilidade",
        adaptabilidadeDesc: "Saber se ajustar a mudanças rápidas.",
        resiliencia: "Resiliência",
        resilienciaDesc: "Manter a calma sob pressão.",

        // Hard Skills
        html: "HTML",
        htmlDesc: "Estrutura semântica e acessível.",
        css: "CSS",
        cssDesc: "Design moderno e responsivo.",
        javascript: "JavaScript",
        javascriptDesc: "Interatividade e lógica dinâmica.",
        react: "React",
        reactDesc: "Construção de interfaces eficientes.",
        nodejs: "Node.js",
        nodejsDesc: "Desenvolvimento backend escalável.",
        git: "Git",
        gitDesc: "Controle de versão profissional.",
        figma: "Figma",
        figmaDesc: "Prototipagem e design UI/UX.",
        sql: "SQL",
        sqlDesc: "Gerenciamento de banco de dados.",

        // Projetos
        projetosTitulo: "Projetos",
        iniciarViagem: "Iniciar Viagem",
        fazerViagemNovamente: "Fazer Viagem Novamente",
        viajando: "Viajando...",

        // Contato
        contatoTitulo: "Contato",
        nome: "Nome",
        nomePlaceholder: "Digite seu Nome Completo",
        email: "Email",
        emailPlaceholder: "Digite seu e-mail",
        telefone: "Telefone",
        telefonePlaceholder: "(00) 00000-0000",
        mensagem: "Mensagem",
        mensagemPlaceholder: "Escreva sua mensagem aqui...",
        enviar: "Enviar",
        ou: "ou",

        // Footer
        footer: "© 2025 Kalil Felipe • Todos os direitos reservados",

        // Botões
        curriculo: "Currículo",
        idioma: "PT"
    },
    en: {
        // Navigation
        sobreMim: "About Me",
        skills: "Skills",
        projetos: "Projects",
        contato: "Contact",
        resume: "Resume/CV",

        // Header
        ola: "Hello! I'm",
        slogan: "A Software Developer Who Seeks to Solve.",
        verProjetos: "View Projects",
        entreContato: "Get in Touch",

        // About Me
        sobreMimTitulo: "About Me",
        sobreMimTexto1: "I'm Kalil, a 16-year-old student currently in the 2nd year of technical high school at COTEMIG. I work in the IT field, focusing on Software/Website creation and AI Agents for automation.",
        sobreMimTexto2: "My behavioral profile is Analyst and Planner, I enjoy understanding the logic behind things and people around me, and I can say I'm quite observant.",
        sobreMimTexto3: "I have experience in HTML/CSS/JS, MySQL, C#, N8N among other skills you can see in the Skills section, so take your time.",

        // Skills
        minhasSkills: "My Skills",
        softSkills: "Soft Skills",
        hardSkills: "Hard Skills",

        // Soft Skills
        comunicacao: "Communication",
        comunicacaoDesc: "Express yourself well and listen carefully.",
        prestatividade: "Helpfulness",
        prestatividadeDesc: "Collaborate and help colleagues.",
        lideranca: "Leadership",
        liderancaDesc: "Guide and inspire the team.",
        criatividade: "Creativity",
        criatividadeDesc: "Think outside the box solutions.",
        empatia: "Empathy",
        empatiaDesc: "Understand others' perspectives.",
        organizacao: "Organization",
        organizacaoDesc: "Manage time and tasks efficiently.",
        adaptabilidade: "Adaptability",
        adaptabilidadeDesc: "Know how to adjust to rapid changes.",
        resiliencia: "Resilience",
        resilienciaDesc: "Stay calm under pressure.",

        // Hard Skills
        html: "HTML",
        htmlDesc: "Semantic and accessible structure.",
        css: "CSS",
        cssDesc: "Modern and responsive design.",
        javascript: "JavaScript",
        javascriptDesc: "Interactivity and dynamic logic.",
        react: "React",
        reactDesc: "Efficient interface construction.",
        nodejs: "Node.js",
        nodejsDesc: "Scalable backend development.",
        git: "Git",
        gitDesc: "Professional version control.",
        figma: "Figma",
        figmaDesc: "Prototyping and UI/UX design.",
        sql: "SQL",
        sqlDesc: "Database management.",

        // Projects
        projetosTitulo: "Projects",
        iniciarViagem: "Start Journey",
        fazerViagemNovamente: "Take Journey Again",
        viajando: "Traveling...",

        // Contact
        contatoTitulo: "Contact",
        nome: "Name",
        nomePlaceholder: "Enter your Full Name",
        email: "Email",
        emailPlaceholder: "Enter your email",
        telefone: "Phone",
        telefonePlaceholder: "(00) 00000-0000",
        mensagem: "Message",
        mensagemPlaceholder: "Write your message here...",
        enviar: "Send",
        ou: "or",

        // Footer
        footer: "© 2025 Kalil Felipe • All rights reserved",

        // Buttons
        curriculo: "CV",
        idioma: "EN"
    }
};

// Função para aplicar tradução
function applyTranslation(language) {
    const texts = translations[language];

    // Navegação
    document.querySelector('a[href="#sobre_mim"]').textContent = texts.sobreMim;
    document.querySelector('a[href="#skills"]').textContent = texts.skills;
    document.querySelector('a[href="#projetos"]').textContent = texts.projetos;
    document.querySelector('a[href="#contato"]').textContent = texts.contato;
    document.querySelector('.curriculo-mobile').textContent = texts.resume;

    // Header
    document.querySelector('#titulo-espaco h2').textContent = texts.ola;
    document.querySelector('.slogan').textContent = texts.slogan;
    document.querySelector('.action-buttons a[href="#projetos"]').textContent = texts.verProjetos;
    document.querySelector('.action-buttons a[href="#contato"]').textContent = texts.entreContato;

    // Sobre Mim
    document.querySelector('#sobre_mim .titulo h3').textContent = texts.sobreMimTitulo;
    const sobreMimTextos = document.querySelectorAll('#sobre_mim .texto p');
    sobreMimTextos[0].textContent = texts.sobreMimTexto1;
    sobreMimTextos[1].textContent = texts.sobreMimTexto2;
    sobreMimTextos[2].textContent = texts.sobreMimTexto3;

    // Skills
    document.querySelector('.tit-ski h3').textContent = texts.minhasSkills;
    document.getElementById('botaoSoft').textContent = texts.softSkills;
    document.getElementById('botaoHard').textContent = texts.hardSkills;

    // Soft Skills
    const softSkillsCards = document.querySelectorAll('.habilidade-soft');
    softSkillsCards[0].querySelector('h3').textContent = texts.comunicacao;
    softSkillsCards[0].querySelector('p').textContent = texts.comunicacaoDesc;
    softSkillsCards[1].querySelector('h3').textContent = texts.prestatividade;
    softSkillsCards[1].querySelector('p').textContent = texts.prestatividadeDesc;
    softSkillsCards[2].querySelector('h3').textContent = texts.lideranca;
    softSkillsCards[2].querySelector('p').textContent = texts.liderancaDesc;
    softSkillsCards[3].querySelector('h3').textContent = texts.criatividade;
    softSkillsCards[3].querySelector('p').textContent = texts.criatividadeDesc;
    softSkillsCards[4].querySelector('h3').textContent = texts.empatia;
    softSkillsCards[4].querySelector('p').textContent = texts.empatiaDesc;
    softSkillsCards[5].querySelector('h3').textContent = texts.organizacao;
    softSkillsCards[5].querySelector('p').textContent = texts.organizacaoDesc;
    softSkillsCards[6].querySelector('h3').textContent = texts.adaptabilidade;
    softSkillsCards[6].querySelector('p').textContent = texts.adaptabilidadeDesc;
    softSkillsCards[7].querySelector('h3').textContent = texts.resiliencia;
    softSkillsCards[7].querySelector('p').textContent = texts.resilienciaDesc;

    // Hard Skills
    const hardSkillsCards = document.querySelectorAll('.habilidade-hard');
    hardSkillsCards[0].querySelector('h3').textContent = texts.html;
    hardSkillsCards[0].querySelector('p').textContent = texts.htmlDesc;
    hardSkillsCards[1].querySelector('h3').textContent = texts.css;
    hardSkillsCards[1].querySelector('p').textContent = texts.cssDesc;
    hardSkillsCards[2].querySelector('h3').textContent = texts.javascript;
    hardSkillsCards[2].querySelector('p').textContent = texts.javascriptDesc;
    hardSkillsCards[3].querySelector('h3').textContent = texts.react;
    hardSkillsCards[3].querySelector('p').textContent = texts.reactDesc;
    hardSkillsCards[4].querySelector('h3').textContent = texts.nodejs;
    hardSkillsCards[4].querySelector('p').textContent = texts.nodejsDesc;
    hardSkillsCards[5].querySelector('h3').textContent = texts.git;
    hardSkillsCards[5].querySelector('p').textContent = texts.gitDesc;
    hardSkillsCards[6].querySelector('h3').textContent = texts.figma;
    hardSkillsCards[6].querySelector('p').textContent = texts.figmaDesc;
    hardSkillsCards[7].querySelector('h3').textContent = texts.sql;
    hardSkillsCards[7].querySelector('p').textContent = texts.sqlDesc;

    // Projetos
    document.querySelector('.espa-proj h3').textContent = texts.projetosTitulo;
    const toggleButton = document.getElementById('toggle-button');
    if (toggleButton.textContent.includes('Iniciar') || toggleButton.textContent.includes('Start')) {
        toggleButton.textContent = texts.iniciarViagem;
    } else if (toggleButton.textContent.includes('Fazer') || toggleButton.textContent.includes('Take')) {
        toggleButton.textContent = texts.fazerViagemNovamente;
    } else if (toggleButton.textContent.includes('Viajando') || toggleButton.textContent.includes('Traveling')) {
        toggleButton.textContent = texts.viajando;
    }

    // Contato
    document.querySelector('.tit-cont h3').textContent = texts.contatoTitulo;
    document.querySelector('label[for="nome"]').textContent = texts.nome;
    document.getElementById('nome').placeholder = texts.nomePlaceholder;
    document.querySelector('label[for="email"]').textContent = texts.email;
    document.getElementById('email').placeholder = texts.emailPlaceholder;
    document.querySelector('label[for="telefone"]').textContent = texts.telefone;
    document.getElementById('telefone').placeholder = texts.telefonePlaceholder;
    document.querySelector('label[for="mensagem"]').textContent = texts.mensagem;
    document.getElementById('mensagem').placeholder = texts.mensagemPlaceholder;
    document.getElementById('btn-enviar').textContent = texts.enviar;
    document.querySelector('#area-cont span').textContent = texts.ou;

    // Footer
    document.querySelector('#footer p').textContent = texts.footer;

    // Botões
    document.getElementById('resumeText').textContent = texts.curriculo;
    languageText.textContent = texts.idioma;

    // Salvar preferência
    localStorage.setItem('language', language);
}

// Event listener para alternar idioma
languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
    applyTranslation(currentLanguage);
});

// Carregar idioma salvo ao iniciar
const savedLanguage = localStorage.getItem('language') || 'pt';
currentLanguage = savedLanguage;
applyTranslation(currentLanguage);

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    menuToggle.classList.toggle("active");
});
