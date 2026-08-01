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
function playVideo() {
    const video = document.getElementById("videoKita");
    const playBtn = document.querySelector(".video-play");

    if (video.paused) {
        video.play();
        playBtn.classList.add("hidden-btn");
    } else {
        video.pause();
        playBtn.classList.remove("hidden-btn");
    }
}

// Munculkan kembali tombol play saat video selesai
document.getElementById("videoKita").addEventListener("ended", function () {
    document.querySelector(".video-play").classList.remove("hidden-btn");
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

