const SUPABASE_URL = 'https://mkufikpvfdsbdvzzqkou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KjOAmU5ogqxiyBMVxUdJlg_XC-X0B5a';
const mySupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Tarjima bazasi
const translations = {
    uz: {
        login_title: "Xush Kelibsiz", login_btn: "Kirish", or: "yoki",
        next_btn: "Keyingi savol", cert_header: "FAXRIIY YORLIQ",
        cert_sub: "Ushbu hujjat egasi", cert_date: "Sana", cert_score: "Natija",
        download_btn: "Sertifikatni yuklash", restart_btn: "Qayta ishlash",
        msg_perfect: "Siz daho ekansiz! Barcha savollarga bexato javob berdingiz!",
        msg_good: "Yaxshi natija! Bilimingizni yanada oshiring."
    },
    en: {
        login_title: "Welcome", login_btn: "Login", or: "or",
        next_btn: "Next Question", cert_header: "CERTIFICATE OF COMPLETION",
        cert_sub: "This is to certify that", cert_date: "Date", cert_score: "Score",
        download_btn: "Download PDF", restart_btn: "Restart Quiz",
        msg_perfect: "You are a genius! Perfect score!",
        msg_good: "Good job! Keep improving your knowledge."
    },
    ru: {
        login_title: "Добро пожаловать", login_btn: "Войти", or: "или",
        next_btn: "Следующий вопрос", cert_header: "СЕРТИФИКАТ ОБ ОКОНЧАНИИ",
        cert_sub: "Настоящий сертификат подтверждает, что", cert_date: "Дата", cert_score: "Баллы",
        download_btn: "Скачать PDF", restart_btn: "Начать заново",
        msg_perfect: "Вы гений! Идеальный результат!",
        msg_good: "Хороший результат! Продолжайте в том же духе."
    }
};

let currentLang = 'uz';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 600;

// Tilni o'zgartirish funksiyasi
document.getElementById('lang-select').onchange = (e) => {
    currentLang = e.target.value;
    updateLanguage();
};

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[currentLang][key];
    });
}

// Auth Login
document.getElementById('login-submit').onclick = () => {
    const login = document.getElementById('reg-login').value;
    const pass = document.getElementById('reg-password').value;

    if(login === "admin" && pass === "123") {
        localStorage.setItem('user_name', login);
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        initQuiz();
    } else {
        alert("Xato! Saytdan chiqarilasiz.");
        window.location.href = "https://google.com";
    }
};

async function initQuiz() {
    const { data } = await mySupabase.from('questions').select('*');
    questions = data;
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-number').textContent = `Savol ${currentQuestionIndex + 1}`;
    document.getElementById('question-text').textContent = q.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    // Progress bar
    document.getElementById('progress').style.width = `${((currentQuestionIndex+1)/questions.length)*100}%`;

    ['option_a', 'option_b', 'option_c', 'option_d'].forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = q[key];
        btn.onclick = () => {
            document.querySelectorAll('.options-grid button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if(key === q.correct) score++;
            document.getElementById('next-btn').classList.remove('hidden');
        };
        container.appendChild(btn);
    });
}

document.getElementById('next-btn').onclick = () => {
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length) {
        renderQuestion();
        document.getElementById('next-btn').classList.add('hidden');
    } else {
        showCertificate();
    }
};

function showCertificate() {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('cert-modal').classList.remove('hidden');
    document.getElementById('user-display-name').textContent = localStorage.getItem('user_name');
    document.getElementById('cert-score').textContent = `${score} / ${questions.length}`;
    
    const msg = (score === questions.length) ? translations[currentLang].msg_perfect : translations[currentLang].msg_good;
    document.getElementById('cert-desc').textContent = msg;
    updateLanguage();
}

// PDF Yuklab olish (html2pdf kutubxonasi yordamida)
document.getElementById('download-pdf').onclick = () => {
    const element = document.getElementById('cert-to-print');
    const opt = { margin: 0, filename: 'DTM_Sertifikat.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } };
    html2pdf().set(opt).from(element).save();
};

function startTimer() {
    const timerEl = document.getElementById('timer');
    const interval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerEl.textContent = `${m}:${s < 10 ? '0'+s : s}`;
        if(timeLeft <= 0) { clearInterval(interval); showCertificate(); }
    }, 1000);
}