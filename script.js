const questions = [
    {
        title: 'O que esta acontecendo com a sua planta hoje?',
        options: [
            '(A) Folhas amareladas, secas ou caindo.',
            '(B) Pontinhos brancos, pretos ou pequenas teias.',
            '(C) Folhas comidas ou com furos.',
            '(D) Esta saudavel, mas quero aprender a proteger.'
        ]
    },
    {
        title: 'Voce ja tentou usar sabao verde ou sabao de coco nela?',
        options: [
            '(A) Sim, faco as misturas a olho.',
            '(B) Sim, mas as pragas sempre voltam.',
            '(C) Nao, mas vi na internet e pensei em aplicar.',
            '(D) Nunca usei, tenho medo de queimar as folhas.'
        ]
    },
    {
        title: 'Se voce fosse aplicar hoje, qual medida usaria?',
        options: [
            '(A) Uma colher de sopa para 1 litro de agua.',
            '(B) Bastante sabao para fazer espuma.',
            '(C) Passaria a barra direto ou usaria puro.',
            '(D) Nao faco ideia da medida segura.'
        ]
    },
    {
        title: 'Voce sabia que sabao no horario errado pode fritar a folha em poucas horas?',
        options: [
            '(A) Nao fazia ideia.',
            '(B) Acho que ja queimei uma planta assim.',
            '(C) Eu sempre aplico no sol da manha.',
            '(D) Quero saber o jeito seguro antes de aplicar.'
        ]
    }
];

let currentQuestion = 0;
const answers = [];

function initQuiz() {
    const container = document.getElementById('questions-container');

    questions.forEach((q, index) => {
        const stepDiv = document.createElement('section');
        stepDiv.className = 'quiz-step hidden';
        stepDiv.id = `step-question-${index}`;

        const optionsHTML = q.options
            .map(opt => `<button class="option-btn" type="button" onclick="answerQuestion(event, ${index})">${opt}</button>`)
            .join('');

        stepDiv.innerHTML = `
            <div class="question-header">
                <span class="question-counter">ETAPA ${index + 1} DE ${questions.length}</span>
                <div class="question-progress">
                    <span style="width: ${((index + 1) / questions.length) * 100}%"></span>
                </div>
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
        if (window.trackQuizStart) window.trackQuizStart();
        currentQuestion = 0;
        document.getElementById('step-question-0').classList.remove('hidden');
        document.getElementById('step-question-0').classList.add('active');
    }
}

function answerQuestion(event, index) {
    const clickedButton = event.currentTarget;
    answers[index] = clickedButton.innerText;

    if (window.trackQuizAnswer) window.trackQuizAnswer(index + 1);

    document
        .querySelectorAll(`#step-question-${index} .option-btn`)
        .forEach(button => button.disabled = true);

    clickedButton.classList.add('selected');
    clickedButton.innerText = '✓ ' + clickedButton.innerText.replace(/^✓\s*/, '');

    setTimeout(() => {
        goToNextQuestion(index);
    }, 180);
}

function goToNextQuestion(index) {
    hideAllSteps();
    if (index + 1 < questions.length) {
        currentQuestion = index + 1;
        document.getElementById(`step-question-${currentQuestion}`).classList.remove('hidden');
        document.getElementById(`step-question-${currentQuestion}`).classList.add('active');
    } else {
        startAnalyzing();
    }
}

function startAnalyzing() {
    document.getElementById('step-analyzing').classList.remove('hidden');
    document.getElementById('step-analyzing').classList.add('active');

    const texts = [
        'Analisando suas respostas...',
        'Identificando o risco principal...',
        'Abrindo sua recomendacao...'
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
    }, 650);

    const progressInterval = setInterval(() => {
        progress += 4;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(textInterval);
            clearInterval(progressInterval);
            showResult();
        }
    }, 40);
}

function showResult() {
    const params = new URLSearchParams(window.location.search);
    params.set('quiz', 'complete');
    params.set('risk', 'alto');

    const target = `vendas.html?${params.toString()}`;
    if (window.trackQuizComplete) {
        window.trackQuizComplete(() => {
            window.location.href = target;
        });
        return;
    }
    window.location.href = target;
}

document.addEventListener('DOMContentLoaded', initQuiz);
