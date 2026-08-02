// ============ SCROLL HALUS KE TIMELINE ============
function scrollToTimeline() {
    document
        .getElementById("timeline")
        .scrollIntoView({ behavior: "smooth" });
}

// ============ SCROLL REVEAL (muncul saat discroll) ============
const hiddenElements = document.querySelectorAll(".hidden");

window.addEventListener("scroll", function () {
    hiddenElements.forEach(function (element) {
        const posisi = element.getBoundingClientRect().top;

        if (posisi < window.innerHeight - 100) {
            element.classList.add("show");
        }
    });
});

// ============ POPUP FOTO ============
function lihatFoto(foto) {
    document.getElementById("popup").style.display = "flex";
    document.getElementById("gambarPopup").src = foto.src;
    document.body.style.overflow = "hidden"; // cegah scroll belakang
}

// Tutup hanya jika klik area gelap di sekitar foto
function tutupFoto(event) {
    if (event.target === document.getElementById("gambarPopup")) return;
    document.getElementById("popup").style.display = "none";
    document.body.style.overflow = "";
}

// ============ VIDEO KENANGAN ============
function playVideo(id) {
    const video = document.getElementById(id);
    const playBtn = video.closest(".video-box").querySelector(".video-play");
    const span = playBtn.querySelector("span");

    if (video.paused) {
        video.play();
        playBtn.classList.add("hidden-btn");
        span.textContent = "⏸";
    } else {
        video.pause();
        playBtn.classList.remove("hidden-btn");
        span.textContent = "▶";
    }
}

// Munculkan kembali tombol play saat video selesai
document.querySelectorAll(".video-box video").forEach(function (video) {
    video.addEventListener("ended", function () {
        const playBtn = video.closest(".video-box").querySelector(".video-play");
        playBtn.classList.remove("hidden-btn");
        playBtn.querySelector("span").textContent = "▶";
    });
});

// ============ GALERI LENGKAP ============
function toggleGallery() {
    const gallery = document.getElementById("gallery-full");
    gallery.classList.toggle("show");

    const button = document.querySelector(".gallery-actions .btn-secondary");
    button.textContent = gallery.classList.contains("show")
        ? "Tutup Galeri"
        : "Lihat Galeri Selengkapnya";
}

// ============ KOTAK KENANGAN ============
function toggleBox(id) {
    const box = document.getElementById(id);

    // Tutup kotak lain yang sedang terbuka
    document.querySelectorAll(".memory-content.show").forEach(function (el) {
        if (el.id !== id) el.classList.remove("show");
    });

    box.classList.toggle("show");
}

// ============ MUSIC PLAYER ============
const lagu = document.getElementById("laguKita");
const tombol = document.querySelector(".play-btn");
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const cover = document.getElementById("coverLagu");
const wrapper = document.querySelector(".cover-wrapper");

// Set durasi otomatis dari file audio
lagu.addEventListener("loadedmetadata", function () {
    duration.textContent = formatWaktu(lagu.duration);
});

function putarLagu() {
    if (lagu.paused) {
        lagu.play();
        tombol.innerHTML = "⏸";
        cover.classList.add("berputar");
        wrapper.classList.add("glow");
    } else {
        lagu.pause();
        tombol.innerHTML = "▶";
        cover.classList.remove("berputar");
        wrapper.classList.remove("glow");
    }
}

// Update progress bar & waktu berjalan
lagu.addEventListener("timeupdate", function () {
    if (lagu.duration) {
        const progress = (lagu.currentTime / lagu.duration) * 100;
        progressBar.value = progress;
        currentTime.textContent = formatWaktu(lagu.currentTime);
    }
});

// Geser progress bar untuk mencari bagian lagu
progressBar.addEventListener("input", function () {
    if (lagu.duration) {
        lagu.currentTime = (progressBar.value / 100) * lagu.duration;
    }
});

// Reset tombol saat lagu selesai
lagu.addEventListener("ended", function () {
    tombol.innerHTML = "▶";
    cover.classList.remove("berputar");
    wrapper.classList.remove("glow");
    progressBar.value = 0;
    currentTime.textContent = "0:00";
});

function formatWaktu(waktu) {
    const menit = Math.floor(waktu / 60);
    const detik = Math.floor(waktu % 60);
    return `${menit}:${detik < 10 ? "0" : ""}${detik}`;
}

// ============ QUIZ KECIL-KECILAN ============
const quizData = [
    {
        question: "Dimana kita pertama fotbar gitu?",
        options: ["Fore", "Kataloji", "Tribun AHAHA"],
        correct: [2],
        note: "Kuncinya tribun, tapi kalo yang fotbar-nya bener itu ya di Kataloji hehehe"
    },
    {
        question: "Siapa yang mulai mulai panggil sayang hayo",
        options: ["Kamu", "Kamuuu", "Tapi aku suka itu HEHE"],
        correct: [0, 1, 2],
        note: "Bener semua ajaaa deh HEHEHE"
    },
    {
        question: "Game roblox apa yang dulu kita mainin pas mulai deket lagi",
        options: ["Mount Everest", "Penjelajahan Antartika", "Balap Liar"],
        correct: [1],
        note: "Penjelajahan Antartika! seruu banget duluu kann walaupun kamu cuma mencet spasi"
    },
    {
        question: "Apa nama panggilan pertama yang kita pake",
        options: ["Abangg adee", "Baimm alaa", "Papih mamih AHAHA"],
        correct: [0],
        note: "Abangg adeee, masih lucuu jugaa adee sayanggg"
    },
    {
        question: "Siapa yang paling sering ngucapin love you",
        options: ["Kita", "Pasti kitaa", "Udaa kita ajaaa"],
        correct: [0, 1, 2],
        note: "Semua bener AHAHA. LOVEE YOUUU 💙"
    }
];

let quizIndex = 0;
let quizScore = 0;

function buildQuiz() {
    const container = document.getElementById("quiz-container");
    container.innerHTML = "";

    // Satu kotak utama (1 soal per halaman — hemat ruang di HP)
    const card = document.createElement("div");
    card.className = "quiz-card";

    // Baris progress
    const progressTrack = document.createElement("div");
    progressTrack.className = "quiz-progress-track";
    const progressFill = document.createElement("div");
    progressFill.className = "quiz-progress-fill";
    progressTrack.appendChild(progressFill);

    const counterEl = document.createElement("div");
    counterEl.className = "quiz-counter";

    const questionEl = document.createElement("h3");

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "quiz-options";

    const noteEl = document.createElement("p");
    noteEl.className = "quiz-note";

    // Tombol lanjut
    const navWrap = document.createElement("div");
    navWrap.className = "quiz-nav";
    const nextBtn = document.createElement("button");
    nextBtn.className = "quiz-next";
    nextBtn.disabled = true;
    nextBtn.addEventListener("click", soalBerikutnya);
    navWrap.appendChild(nextBtn);

    card.appendChild(progressTrack);
    card.appendChild(counterEl);
    card.appendChild(questionEl);
    card.appendChild(optionsWrap);
    card.appendChild(noteEl);
    card.appendChild(navWrap);
    container.appendChild(card);

    // Hasil (disembunyikan sampai quiz selesai)
    const resetWrap = document.createElement("div");
    resetWrap.className = "quiz-result-wrap";
    resetWrap.style.display = "none";
    resetWrap.innerHTML =
        '<div class="quiz-result"></div>' +
        '<button class="btn-secondary quiz-reset" onclick="resetQuiz()">Ulangi Quiz 🔄</button>';
    container.appendChild(resetWrap);

    tampilSoal();
}

function tampilSoal() {
    const card = document.querySelector(".quiz-card");
    const item = quizData[quizIndex];

    card.classList.remove("answered", "ganti");
    // paksa reflow supaya animasi slide berjalan tiap pindah soal
    void card.offsetWidth;
    card.classList.add("ganti");

    card.querySelector(".quiz-progress-fill").style.width =
        (quizIndex / quizData.length) * 100 + "%";
    card.querySelector(".quiz-counter").textContent =
        "Soal " + (quizIndex + 1) + " dari " + quizData.length;
    card.querySelector("h3").innerHTML =
        (quizIndex + 1) + ". " + item.question;
    card.querySelector(".quiz-note").textContent = "";

    const nextBtn = card.querySelector(".quiz-next");
    nextBtn.disabled = true;
    nextBtn.textContent =
        quizIndex === quizData.length - 1 ? "Lihat Hasil 🏁" : "Lanjut →";

    const optionsWrap = card.querySelector(".quiz-options");
    optionsWrap.innerHTML = "";
    item.options.forEach(function (opt, optIndex) {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = opt;
        btn.addEventListener("click", function () {
            jawabSoal(optIndex, btn);
        });
        optionsWrap.appendChild(btn);
    });
}

function jawabSoal(optionIndex, btn) {
    const card = document.querySelector(".quiz-card");
    const item = quizData[quizIndex];
    const allBtns = card.querySelectorAll(".quiz-option");

    if (card.classList.contains("answered")) return;
    card.classList.add("answered");
    allBtns.forEach(function (b) {
        b.disabled = true;
    });

    const isCorrect = item.correct.includes(optionIndex);

    if (isCorrect) {
        btn.classList.add("correct");
        btn.innerHTML = btn.textContent + " ✓";
        quizScore++;
    } else {
        btn.classList.add("wrong");
        btn.innerHTML = btn.textContent + " ✗";

        item.correct.forEach(function (ci) {
            allBtns[ci].classList.add("correct");
            allBtns[ci].innerHTML = allBtns[ci].textContent + " ✓";
        });
    }

    card.querySelector(".quiz-note").textContent = item.note;
    card.querySelector(".quiz-progress-fill").style.width =
        ((quizIndex + 1) / quizData.length) * 100 + "%";

    card.querySelector(".quiz-next").disabled = false;
}

function soalBerikutnya() {
    if (quizIndex === quizData.length - 1) {
        showQuizResult();
        return;
    }
    quizIndex++;
    tampilSoal();
    document.getElementById("quiz").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showQuizResult() {
    document.querySelector(".quiz-card").style.display = "none";

    const resetWrap = document.querySelector(".quiz-result-wrap");
    resetWrap.style.display = "block";

    const result = resetWrap.querySelector(".quiz-result");

    let pesan;
    if (quizScore === quizData.length) {
        pesan = "WOWWW BETULL SEMUAAA ii kerenn sayanggg akuu. LOVE YOUUU 💙";
    } else if (quizScore === quizData.length - 1) {
        pesan = "Yahhh belum bener semuaa tapi gapapaa soalnya itu juga seinget akuu doangg hehe. tapii tetepp sayanggg akuu yang selalu benar";
    } else if (quizScore >= quizData.length - 2) {
        pesan = "Yahh salah duwaa, berarti harus menambah momen baru nii. tapii tetepp sayanggg akuu yang selalu benar";
    } else {
        pesan = "Yaaa gapapaa laa nantii kita buat kenangan baru ajaa yang banyakk biar inget wleee. tapii tetepp sayanggg akuu yang selalu benar";
    }

    result.textContent = `Skor kamu: ${quizScore}/${quizData.length}. ${pesan}`;

    setTimeout(function () {
        resetWrap.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
}

function resetQuiz() {
    quizIndex = 0;
    quizScore = 0;
    buildQuiz();
    document.getElementById("quiz").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

buildQuiz();

// ============ TEMA SIANG & MALAM OTOMATIS ============
// Siang 06.00 - 17.59, Malam 18.00 - 05.59
function aturTema() {
    const jam = new Date().getHours();
    const malam = jam >= 18 || jam < 6;
    document.body.classList.toggle("theme-night", malam);
}

aturTema();
setInterval(aturTema, 60000); // cek ulang tiap 1 menit

// ============ BINTANG-BINTANG ============
const kumpulanBintang = document.getElementById("stars");
if (kumpulanBintang) {
    for (let i = 0; i < 80; i++) {
        const bintang = document.createElement("span");
        bintang.className = "star";
        bintang.style.left = Math.random() * 100 + "%";
        bintang.style.top = Math.random() * 90 + "%";
        bintang.style.animationDelay = Math.random() * 4 + "s";
        bintang.style.animationDuration = Math.random() * 2 + 2 + "s";
        kumpulanBintang.appendChild(bintang);
    }
}



