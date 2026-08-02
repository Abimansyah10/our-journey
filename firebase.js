// ==========================================================
// Firebase - Harapan & Wishlist Masa Depan Kita 💙
// ----------------------------------------------------------
// CARA ISI KONFIGURASI:
// 1. Buka Firebase Console (console.firebase.google.com)
// 2. Project Settings > General > Your apps > pilih Web (</>)
// 3. Salin objek firebaseConfig lalu tempel di bawah ini
//    (ganti nilai "ISI_..." dengan nilai asli milikmu)
// ==========================================================

const firebaseConfig = {
    apiKey: "AIzaSyDg9Si5Dv-SGbiBJoElUL_Cw7g5TmUbJXI",
    authDomain: "our-journey-firebase.firebaseapp.com",
    projectId: "our-journey-firebase",
    storageBucket: "our-journey-firebase.firebasestorage.app",
    messagingSenderId: "826572384971",
    appId: "1:826572384971:web:bf7fc6aac96bb76872c94e"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cek apakah konfigurasi sudah diisi oleh pengguna
const configTerisi =
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId;

let db;

if (configTerisi) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

// ============ ELEMEN ============
const formHarapan = document.getElementById("harapan-form");
const statusHarapan = document.getElementById("harapan-status");
const btnToggle = document.getElementById("toggle-harapan-btn");
const wishlistSection = document.getElementById("wishlist-section");
const statsEl = document.getElementById("harapan-stats");
const listEl = document.getElementById("harapan-list");

// ============ STATUS HARAPAN ============
const OPSI_STATUS = {
    belum: "🌟 Belum tercapai",
    proses: "🚧 Sedang direncanakan",
    selesai: "✅ Sudah tercapai"
};

let daftarHarapan = []; // cache data agar statistik bisa di-update halus
let harapanBaru = false; // penanda untuk animasi pop kartu baru

// ============ SIMPAN HARAPAN ============
formHarapan.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nama = document.getElementById("harapan-nama").value.trim();
    const isi = document.getElementById("harapan-isi").value.trim();

    if (!configTerisi) {
        statusHarapan.textContent =
            "⚠️ Firebase belum dikonfigurasi. Isi firebaseConfig di firebase.js dulu ya!";
        statusHarapan.style.color = "#e53e3e";
        return;
    }

    if (!nama || !isi) {
        statusHarapan.textContent = "⚠️ Nama dan isi harapan wajib diisi ya!";
        statusHarapan.style.color = "#e53e3e";
        return;
    }

    // Tampilkan "menyimpan..."
    statusHarapan.textContent = "⏳ Menyimpan harapann kamuu...";
    statusHarapan.style.color = "var(--biru-gelap)";

    try {
        await addDoc(collection(db, "harapan"), {
            nama: nama,
            isi: isi,
            status: "belum", // status default: 🌟 Belum tercapai
            waktu: serverTimestamp()
        });

        statusHarapan.textContent =
            "✅ Berhasil disimpan! Harapanmu sudah masuk ke Wishlist 💙";
        statusHarapan.style.color = "#2ecc71";

        formHarapan.reset();

        // Buka daftar jika masih tertutup, lalu tampilkan kartu baru dengan animasi pop
        harapanBaru = true;
        if (!wishlistSection.classList.contains("open")) {
            wishlistSection.classList.remove("closing");
            wishlistSection.classList.add("open");
            btnToggle.innerHTML = "Tutup Daftar Harapan";
        }

        await muatHarapan();

        setTimeout(function () {
            wishlistSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
    } catch (err) {
        console.error("Gagal menyimpan harapan:", err);
        statusHarapan.textContent = "❌ Gagal menyimpan. Coba lagi ya.";
        statusHarapan.style.color = "#e53e3e";
    }
});

// ============ TOMBOL "LIHAT SEMUA HARAPAN" ============
btnToggle.addEventListener("click", function () {
    if (wishlistSection.classList.contains("open")) {
        // Tutup dengan animasi halus
        wishlistSection.classList.add("closing");
        btnToggle.disabled = true;
        btnToggle.innerHTML = "Lihat Semua Harapan";
        setTimeout(function () {
            wishlistSection.classList.remove("open", "closing");
            btnToggle.disabled = false;
        }, 400);
    } else {
        // Buka dengan animasi fade-in & slide-up
        wishlistSection.classList.remove("closing");
        wishlistSection.classList.add("open");
        btnToggle.innerHTML = "Tutup Daftar Harapan";
        muatHarapan();
        setTimeout(function () {
            wishlistSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }
});

// ============ MUAT SEMUA HARAPAN ============
async function muatHarapan() {
    if (!configTerisi) {
        renderStats([]);
        listEl.innerHTML =
            '<p class="harapan-kosong">⚠️ Firebase belum dikonfigurasi. Isi firebaseConfig di firebase.js dulu ya!</p>';
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "harapan"));
        daftarHarapan = [];

        snapshot.forEach(function (docData) {
            daftarHarapan.push({ ...docData.data(), id: docData.id });
        });

        // Urutkan berdasarkan waktu terbaru
        daftarHarapan.sort(function (a, b) {
            return getMillis(b.waktu) - getMillis(a.waktu);
        });

        renderStats(daftarHarapan);
        renderList(daftarHarapan);
    } catch (err) {
        console.error("Gagal memuat harapan:", err);
        listEl.innerHTML =
            '<p class="harapan-kosong">Gagal memuat data dari server.</p>';
    }
}

// ============ STATISTIK ============
function renderStats(items) {
    const total = items.length;
    const belum = items.filter(function (i) { return (i.status || "belum") === "belum"; }).length;
    const proses = items.filter(function (i) { return (i.status || "belum") === "proses"; }).length;
    const selesai = items.filter(function (i) { return (i.status || "belum") === "selesai"; }).length;

    statsEl.innerHTML =
        kartuStat("💙", total, "Total harapan") +
        kartuStat("🌟", belum, "Belum tercapai") +
        kartuStat("🚧", proses, "Sedang direncanakan") +
        kartuStat("✅", selesai, "Sudah tercapai");
}

function kartuStat(emoji, angka, label) {
    return (
        '<div class="stat-card">' +
        '<span class="stat-emoji">' + emoji + "</span>" +
        '<span class="stat-nomor">' + angka + "</span>" +
        '<span class="stat-label">' + label + "</span>" +
        "</div>"
    );
}

// ============ DAFTAR KARTU HARAPAN ============
function renderList(items) {
    listEl.innerHTML = "";

    if (items.length === 0) {
        listEl.innerHTML =
            '<div class="harapan-kosong">' +
            "💙 Belummm adaa harapan yang dituliss.<br>Ayoo buat harapan dan kenangan baruu bersamaa sayanggg." +
            "</div>";
        harapanBaru = false;
        return;
    }

    items.forEach(function (item, index) {
        const statusKey = item.status || "belum";
        const kartu = document.createElement("div");
        kartu.className = "harapan-card";
        kartu.style.animationDelay = index * 0.08 + "s";

        if (harapanBaru && index === 0) {
            kartu.classList.add("baru");
        }

        const waktuTexs = item.waktu ? "🕒 " + formatTanggal(item.waktu) : "";

        kartu.innerHTML =
            '<h4>💙 ' + escapeHtml(item.nama || "Anonim") + "</h4>" +
            '<p class="harapan-isi">' + escapeHtml(item.isi || "") + "</p>" +
            '<span class="harapan-waktu">' + waktuTexs + "</span>" +
            '<label class="status-label">Status</label>' +
            '<select class="status-select" data-id="' + item.id + '" data-key="' + statusKey + '">' +
            opsiStatus(statusKey) +
            "</select>";

        listEl.appendChild(kartu);
    });

    harapanBaru = false;

    // Hubungkan dropdown status ke Firestore
    listEl.querySelectorAll(".status-select").forEach(function (select) {
        select.addEventListener("change", function () {
            ubahStatus(this.getAttribute("data-id"), this.value, this);
        });
    });
}

function opsiStatus(terpilih) {
    let hasil = "";
    for (const kunci in OPSI_STATUS) {
        const terpilihAttr = kunci === terpilih ? " selected" : "";
        hasil += '<option value="' + kunci + '"' + terpilihAttr + ">" + OPSI_STATUS[kunci] + "</option>";
    }
    return hasil;
}

// ============ UBAH STATUS (langsung simpan ke Firestore) ============
async function ubahStatus(idHarapan, statusBaru, select) {
    if (!configTerisi) return;

    select.disabled = true;

    try {
        await updateDoc(doc(db, "harapan", idHarapan), { status: statusBaru });

        // Update cache lokal + statistik tanpa reload seluruh daftar (tetap halus)
        const item = daftarHarapan.find(function (x) { return x.id === idHarapan; });
        if (item) item.status = statusBaru;
        renderStats(daftarHarapan);

        select.setAttribute("data-key", statusBaru);
    } catch (err) {
        console.error("Gagal mengubah status:", err);
        select.value = select.getAttribute("data-key");
        alert("❌ Gagal mengubah status. Coba lagi ya.");
    } finally {
        select.disabled = false;
    }
}

// ============ FORMAT TANGGAL & JAM ============
function formatTanggal(waktu) {
    const date = typeof waktu.toDate === "function" ? waktu.toDate() : new Date(waktu);

    const hari = date.getDate();
    const bulan = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const jam = date.getHours().toString().padStart(2, "0");
    const menit = date.getMinutes().toString().padStart(2, "0");

    return hari + " " + bulan[date.getMonth()] + " " +
        date.getFullYear() + " • " + jam + ":" + menit;
}

function getMillis(waktu) {
    if (!waktu) return 0;
    if (typeof waktu.toMillis === "function") return waktu.toMillis();
    if (waktu instanceof Date) return waktu.getTime();
    return new Date(waktu).getTime() || 0;
}

// ============ AMAN DARI XSS ============
function escapeHtml(teks) {
    const div = document.createElement("div");
    div.textContent = teks;
    return div.innerHTML;
}

