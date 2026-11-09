// --- STATE & APP INITIALIZATION ---
let currentTab = 'home';
let currentUser = JSON.parse(localStorage.getItem('future_ai_user')) || null;

// MBTI Quiz State
let currentQuestionIndex = 0;
const totalQuestions = 40;
let userAnswers = [];

const sampleQuestions = [
    "تحب التفاعل مع الأنشطة الاجتماعية والمجموعات الكبيرة أكثر من العزلة؟",
    "تعتمد على الحقائق والواقع الملموس أكثر من التوقعات المستقبلية والحدس؟",
    "تتخذ قراراتك بناءً على التحليل المنطقي والموضوعي بحت لا على المشاعر؟",
    "تفضل الالتزام بجداول زمنية دقيقة وخطط واضحة بدلاً من العفوية؟"
];

// Lighthouse Data (100 sample subset structure)
const lighthouseItems = [
    { id: 1, title: "سُكينة القلب وسط العواصف", cat: "إيمانيات", desc: "اليقين بأن الله لا يضيع أجر المحسنين يمنح الصدر انشراحاً لا يضاهيه مال ولا جاه." },
    { id: 2, title: "إدارة القلق بالمواجهة", cat: "صحة نفسية", desc: "التفكير الزائد يستهلك طاقة العقل؛ قسم مخاوفك إلى أجزاء صغيرة واجهها واحدة تلو الأخرى." },
    { id: 3, title: "فقه الاستغفار والفرج", cat: "تزكية", desc: "الاستغفار مفتاح الأبواب المغلقة، وبه تُكفى الهموم وتغفر الخطايا." },
    { id: 4, title: "فن وضع الحدود الشخصية", cat: "تطوير ذات", desc: "قول 'لا' لما يرهق طاقتك ليس أنانية، بل هو حفاظ على صفاء ذهنك وعطائك." }
];

// Challenges Data (50 Tasks sample)
let challengesData = JSON.parse(localStorage.getItem('future_ai_challenges')) || [
    { id: 1, text: "قراءة صفحة من القرآن بتدبر يومي", done: false },
    { id: 2, text: "الممشى لمدة 20 دقيقة لتنشيط الدورة الدموية", done: false },
    { id: 3, text: "الامتناع عن شاشات الهاتف ساعة قبل النوم", done: false },
    { id: 4, text: "كتابة 3 نعم تشكر الله عليها اليوم", done: false },
    { id: 5, text: "صلة رحم باتصال قصير بأحد الأقارب", done: false }
];

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    renderLighthouse();
    renderChallenges();
});

// --- THEME MANAGEMENT ---
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// --- NAVIGATION ---
function switchTab(tabId) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`sec-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('text-emerald-600');
        btn.classList.add('text-slate-400');
    });
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-400');
        activeNav.classList.add('text-emerald-600');
    }
    currentTab = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- AUTHENTICATION & GOOGLE SIMULATION ---
function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function simulateGoogleLogin(name, email, avatar) {
    currentUser = { name, email, avatar };
    localStorage.setItem('future_ai_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeLoginModal();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('future_ai_user');
    updateAuthUI();
}

function updateAuthUI() {
    const container = document.getElementById('auth-container');
    const welcomeTitle = document.getElementById('welcome-user-title');
    if (currentUser) {
        container.innerHTML = `
            <div class="flex items-center gap-2">
                <img src="${currentUser.avatar}" class="w-8 h-8 rounded-full object-cover border border-emerald-500">
                <button onclick="logout()" class="text-xs text-red-500 hover:underline">خروج</button>
            </div>
        `;
        welcomeTitle.innerText = `أهلاً بك، ${currentUser.name} ✨`;
    } else {
        container.innerHTML = `
            <button onclick="openLoginModal()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5">
                <i class="fa-brands fa-google text-xs"></i> دخول
            </button>
        `;
        welcomeTitle.innerText = `أهلاً بك يا زائرنا الكريم ✨`;
    }
}

// --- MBTI QUIZ LOGIC ---
function answerQuiz(score) {
    userAnswers.push(score);
    currentQuestionIndex++;
    
    if (currentQuestionIndex < sampleQuestions.length) {
        document.getElementById('quiz-question-text').innerText = sampleQuestions[currentQuestionIndex];
        const pct = ((currentQuestionIndex + 1) / sampleQuestions.length) * 100;
        document.getElementById('quiz-progress-label').innerText = `السؤال ${currentQuestionIndex + 1} من ${sampleQuestions.length}`;
        document.getElementById('quiz-percentage').innerText = `${pct}%`;
        document.getElementById('quiz-progress-bar').style.width = `${pct}%`;
    } else {
        // Show result
        document.getElementById('quiz-options-container').classList.add('hidden');
        document.getElementById('quiz-question-text').classList.add('hidden');
        document.getElementById('quiz-result-box').classList.remove('hidden');
    }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    document.getElementById('quiz-options-container').classList.remove('hidden');
    document.getElementById('quiz-question-text').classList.remove('hidden');
    document.getElementById('quiz-result-box').classList.add('hidden');
    document.getElementById('quiz-question-text').innerText = sampleQuestions[0];
    document.getElementById('quiz-progress-bar').style.width = '2.5%';
    document.getElementById('quiz-progress-label').innerText = `السؤال 1 من ${sampleQuestions.length}`;
}

// --- LOCAL AI CONSULTANT CHAT ---
function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';

    // Simulate smart local AI response
    setTimeout(() => {
        const reply = generateLocalAiResponse(text);
        appendMessage(reply, 'ai');
    }, 600);
}

function sendPresetChat(text) {
    document.getElementById('chat-input').value = text;
    sendMessage();
}

function appendMessage(text, sender) {
    const box = document.getElementById('chat-messages');
    const isUser = sender === 'user';
    const html = `
        <div class="flex gap-3 max-w-[85%] ${isUser ? 'mr-auto flex-row-reverse' : ''}">
            <div class="w-8 h-8 rounded-full ${isUser ? 'bg-teal-600' : 'bg-emerald-600'} text-white flex items-center justify-center text-xs flex-shrink-0">
                ${isUser ? 'أنت' : 'AI'}
            </div>
            <div class="p-3.5 rounded-2xl ${isUser ? 'rounded-tl-none bg-emerald-600 text-white' : 'rounded-tr-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'} text-sm leading-relaxed">
                ${text}
            </div>
        </div>
    `;
    box.insertAdjacentHTML('beforeend', html);
    box.scrollTop = box.scrollHeight;
}

function generateLocalAiResponse(query) {
    q = query.toLowerCase();
    if (q.includes('قلق') || q.includes('توتر') || q.includes('خوف')) {
        return "أشعر بما تمر به. القلق غالباً يكون محاولة للسيطرة على مستقبل غيبي. أنصحك بتطبيق قاعدة التنفس العميق (4 ثوانٍ شهيق، 4 زفير)، مع ترديد الذكر والاستعانة بالله، وتذكر أنك أديت ما عليك والباقي بيد خالقك.";
    } else if (q.includes('الله') || q.includes('علاقتي') || q.includes('إيمان')) {
        return "القرب من الله يبدأ بلحظة صدق وخلوة قصيرة. داوم على الاستغفار وركعتين في جوف الليل، وتذكر قوله تعالى: (وإذا سألك عبادي عني فإني قريب). الباب مفتوح دائماً.";
    } else if (q.includes('تسويف') || q.includes('كسل') || q.includes('تأجيل')) {
        return "التسويف سببه غالباً ضخامة المهمة في عقلك. جرب 'قاعدة الدقائق الخمس': انوِ العمل لمدة 5 دقائق فقط، وغالباً ستستمر بعدها بحماس.";
    }
    return "هذا أمر يستحق التوقف عنده بعمق. من الناحية النفسية، الاعتراف بالمشكلة هو نصف الحل. هل ترغب في أن نضع خطوة عملية بسيطة نبدأ بها اليوم؟";
}

// --- LIGHTHOUSE RENDER ---
function renderLighthouse(filter = '') {
    const list = document.getElementById('lighthouse-list');
    list.innerHTML = '';
    const filtered = lighthouseItems.filter(item => item.title.includes(filter) || item.desc.includes(filter));
    
    filtered.forEach(item => {
        list.innerHTML += `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                <div class="flex justify-between items-center">
                    <h4 class="font-bold text-sm">${item.title}</h4>
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">${item.cat}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${item.desc}</p>
            </div>
        `;
    });
}

function filterLighthouse() {
    const query = document.getElementById('lighthouse-search').value;
    renderLighthouse(query);
}

// --- CHALLENGES RENDER ---
function renderChallenges() {
    const list = document.getElementById('challenges-list');
    list.innerHTML = '';
    let completed = 0;

    challengesData.forEach((ch, idx) => {
        if (ch.done) completed++;
        list.innerHTML += `
            <div onclick="toggleChallenge(${idx})" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-lg ${ch.done ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'} flex items-center justify-center text-xs transition">
                        ${ch.done ? '<i class="fa-solid fa-check"></i>' : ''}
                    </div>
                    <span class="text-sm font-medium ${ch.done ? 'line-through text-slate-400' : ''}">${ch.text}</span>
                </div>
                <span class="text-[10px] text-slate-400">تحدي يومي</span>
            </div>
        `;
    });
    document.getElementById('completed-count').innerText = `${completed} / ${challengesData.length}`;
    localStorage.setItem('future_ai_challenges', JSON.stringify(challengesData));
}

function toggleChallenge(index) {
    challengesData[index].done = !challengesData[index].done;
    renderChallenges();
}
