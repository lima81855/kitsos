const questions = [
    {
        title: 'O que está acontecendo com a sua planta hoje?',
        options: [
            '(A) Folhas amareladas, secas ou caindo.',
            '(B) Pontinhos brancos, pretos ou pequenas teias (pragas visíveis).',
            '(C) Folhas comidas ou com furos.',
            '(D) Está saudável, mas quero aprender a proteger.'
        ]
    },
    {
        title: 'Você já tentou usar "Sabão Verde" ou "Sabão de Coco" nela?',
        options: [
            '(A) Sim, faço as misturas "a olho" mesmo.',
            '(B) Sim, mas parece que as pragas sempre voltam.',
            '(C) Não, mas vi na internet e estava pensando em aplicar.',
            '(D) Nunca usei, tenho medo de queimar as folhas.'
        ]
    },
    {
        title: 'Se você fosse aplicar hoje, qual a proporção EXATA que você usaria?',
        options: [
            '(A) Uma colher de sopa para 1 litro de água.',
            '(B) Coloco bastante para fazer bastante espuma e matar rápido.',
            '(C) Passo a barra de sabão direto ou uso puro.',
            '(D) Não faço a menor ideia da medida segura.'
        ]
    },
    {
        title: 'Você sabia que a mistura de sabão, se aplicada sob a luz errada, age como uma lupa e frita a folha da planta em horas?',
        options: [
            '(A) Meu Deus, não fazia ideia!',
            '(B) Eu já desconfiava, acho que já queimei uma planta assim.',
            '(C) Eu sempre aplico no sol da manhã.'
        ]
    },
    {
        title: 'Além de queimar, aplicar sabão do jeito errado pode sufocar os poros da planta, impedindo que ela respire. Você sabe como evitar isso?',
        options: [
            '(A) Sim, sei exatamente como limpar depois.',
            '(B) Não, achei que era só jogar e deixar lá.',
            '(C) Nunca tinha parado para pensar nisso...'
        ]
    },
    {
        title: 'Você sabe identificar para QUAIS pragas o sabão realmente funciona e para quais ele não faz nem cócegas?',
        options: [
            '(A) Só conheço cochonilha e pulgão.',
            '(B) Para mim, inseto é tudo igual.',
            '(C) Não sei, aplico em tudo e torço para funcionar.'
        ]
    }
];

let currentQuestion = 0;

function initQuiz() {
    const container = document.getElementById('questions-container');
    
    questions.forEach((q, index) => {
        const stepDiv = document.createElement('section');
        stepDiv.className = 'quiz-step hidden';
        stepDiv.id = `step-question-${index}`;
        
        let optionsHTML = '';
        q.options.forEach((opt, optIndex) => {
            optionsHTML += `<button class="option-btn" onclick="answerQuestion(${index})">${opt}</button>`;
        });

        stepDiv.innerHTML = `
            <div class="question-header">
                <span class="question-counter">ETAPA ${index + 1} DE ${questions.length}</span>
                <h2 class="question-text">${q.title}</h2>
            </div>
            <div class="options-grid">
                ${optionsHTML}
            </div>
        `;
        
        container.appendChild(stepDiv);
    });
}

function hideAllSteps() {
    document.querySelectorAll('.quiz-step').forEach(step => {
        step.classList.remove('active');
        step.classList.add('hidden');
    });
}

function nextStep(stepIndex) {
    hideAllSteps();
    if (stepIndex === 1) {
        // Start quiz
        currentQuestion = 0;
        document.getElementById(`step-question-0`).classList.remove('hidden');
        document.getElementById(`step-question-0`).classList.add('active');
    }
}

function answerQuestion(index) {
    hideAllSteps();
    if (index + 1 < questions.length) {
        document.getElementById(`step-question-${index + 1}`).classList.remove('hidden');
        document.getElementById(`step-question-${index + 1}`).classList.add('active');
    } else {
        startAnalyzing();
    }
}

function startAnalyzing() {
    document.getElementById('step-analyzing').classList.remove('hidden');
    document.getElementById('step-analyzing').classList.add('active');

    const texts = [
        "Analisando suas respostas...",
        "Calculando o risco para suas plantas...",
        "Gerando o seu diagnóstico..."
    ];
    const textEl = document.getElementById('analyzing-text');
    const progressBar = document.getElementById('progress-bar');
    
    let textIndex = 0;
    let progress = 0;
    
    const textInterval = setInterval(() => {
        textIndex++;
        if (textIndex < texts.length) {
            textEl.innerText = texts[textIndex];
        }
    }, 1500);

    const progressInterval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(textInterval);
            clearInterval(progressInterval);
            showResult();
        }
    }, 90); // ~4.5 seconds total
}

function showResult() {
    // Em vez de mostrar a caixa final, redireciona para a Página de Vendas de Low Ticket
    window.location.href = 'vendas.html';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initQuiz);
