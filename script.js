// --- SOZLAMALAR ---
const SUPABASE_URL = 'https://mkufikpvfdsbdvzzqkou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KjOAmU5ogqxiyBMVxUdJlg_XC-X0B5a';

// O'zgaruvchi nomini 'mySupabase' deb o'zgartirdik, to'qnashuv bo'lmasligi uchun
const mySupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- O'ZGARUVCHILAR ---
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 600;

const questionText = document.getElementById('question-text');
const questionNumber = document.getElementById('question-number');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const modal = document.getElementById('result-modal');
const scoreText = document.getElementById('score-text');
const timerEl = document.getElementById('timer');

document.addEventListener('DOMContentLoaded', async () => {
    const savedIndex = localStorage.getItem('dtm_current_index');
    if (savedIndex) {
        currentQuestionIndex = parseInt(savedIndex);
    }
    await fetchQuestions();
    startTimer();
});

async function fetchQuestions() {
    try {
        // Bu yerda ham 'mySupabase' ishlatildi
        const { data, error } = await mySupabase
            .from('questions')
            .select('*');

        if (error) throw error;

        questions = data;
        
        if (questions && questions.length > 0) {
            if (currentQuestionIndex >= questions.length) {
                showResult();
            } else {
                renderQuestion();
            }
        } else {
            questionText.textContent = "Supabase-da 'questions' jadvali bo'sh yoki topilmadi.";
        }
    } catch (err) {
        console.error('Xatolik tafsiloti:', err);
        questionText.textContent = "Xatolik: Ma'lumotlarni o'qib bo'lmadi. Jadval (Table) yaratilganini tekshiring.";
    }
}

function renderQuestion() {
    const currentQ = questions[currentQuestionIndex];
    questionNumber.textContent = `Savol ${currentQuestionIndex + 1} / ${questions.length}`;
    questionText.textContent = currentQ.question;
    optionsContainer.innerHTML = '';
    nextBtn.style.display = 'none';

    const options = [
        { key: 'option_a', text: currentQ.option_a },
        { key: 'option_b', text: currentQ.option_b },
        { key: 'option_c', text: currentQ.option_c },
        { key: 'option_d', text: currentQ.option_d }
    ];

    options.forEach(opt => {
        if(opt.text) {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.onclick = () => selectOption(btn, opt.key, currentQ.correct);
            optionsContainer.appendChild(btn);
        }
    });
}

function selectOption(selectedBtn, selectedKey, correctKey) {
    const allBtns = optionsContainer.querySelectorAll('button');
    allBtns.forEach(btn => btn.disabled = true);
    selectedBtn.classList.add('selected');
    if (selectedKey === correctKey) {
        score++;
    }
    nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    localStorage.setItem('dtm_current_index', currentQuestionIndex);
    if (currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
});

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResult();
        }
    }, 1000);
}

function showResult() {
    clearInterval(timerInterval);
    modal.classList.remove('hidden');
    scoreText.textContent = `${score} / ${questions.length}`;
    localStorage.removeItem('dtm_current_index');
}

window.restartQuiz = function() {
    localStorage.removeItem('dtm_current_index');
    location.reload();
}

