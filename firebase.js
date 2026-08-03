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

// ==========================================================
// 🏦 TABUNGAN KITA
// ==========================================================

// ---------- ELEMEN ----------
const formTabungan = document.getElementById("tabungan-form");
const statusTabungan = document.getElementById("tabungan-status");
const statsTabunganEl = document.getElementById("tabungan-stats");
const accordionEl = document.getElementById("tabungan-accordion");
const ringkasanEl = document.getElementById("tabungan-ringkasan");

let daftarTabungan = []; // cache data tabungan

// Nama hari & bulan untuk format Indonesia
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// ---------- AVATAR FOTO ----------
// 💙 Ganti src-nya dengan foto kamu & foto dia masing-masing.
// Kalau file belum ada, otomatis pakai emoji (👦 / 👧) jadi tidak rusak.
const AVATAR_BAIM = "images/avatar/abaim.jpg"; // GANTI: foto Baimm Ganteng
const AVATAR_DIA = "images/avatar/alaaakecik.jpg";   // GANTI: foto Alaa Cantik

function tagAvatar(src, emojiFallback, nama) {
    return '<img src="' + src + '" class="tabungan-avatar" alt="' + nama + '" ' +
        "onerror=\"this.outerHTML='" + emojiFallback + "'\">";
}

function toDate(waktu) {
    if (!waktu) return null;
    if (typeof waktu.toDate === "function") return waktu.toDate();
    if (waktu instanceof Date) return waktu;
    return new Date(waktu);
}

// ---------- SIMPAN TABUNGAN ----------
if (formTabungan) {
    formTabungan.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nama = document.getElementById("tabungan-nama").value;
        const nominal = parseFloat(document.getElementById("tabungan-nominal").value);
        const catatan = document.getElementById("tabungan-catatan").value.trim();

        if (!configTerisi) {
            statusTabungan.textContent =
                "⚠️ Firebase belum dikonfigurasi. Isi firebaseConfig di firebase.js dulu ya!";
            statusTabungan.style.color = "#e53e3e";
            return;
        }

        if (!nama || !nominal || nominal <= 0) {
            statusTabungan.textContent = "⚠️ Isi nama dan nominal yang benar ya!";
            statusTabungan.style.color = "#e53e3e";
            return;
        }

        statusTabungan.textContent = "⏳ Menyimpan tabungan...";
        statusTabungan.style.color = "var(--biru-gelap)";

        try {
            await addDoc(collection(db, "tabungan"), {
                nama: nama,
                nominal: nominal,
                catatan: catatan,
                tanggal: serverTimestamp()
            });

            statusTabungan.textContent = "✅ Berhasil disimpan! Makin deket ke tujuan kita 💙";
            statusTabungan.style.color = "#2ecc71";

            formTabungan.reset();
            await muatTabungan();
        } catch (err) {
            console.error("Gagal menyimpan tabungan:", err);
            statusTabungan.textContent = "❌ Gagal menyimpan. Coba lagi ya.";
            statusTabungan.style.color = "#e53e3e";
        }
    });
}

// ---------- MUAT SEMUA TABUNGAN ----------
async function muatTabungan() {
    if (!configTerisi) {
        renderStatsTabungan([]);
        accordionEl.innerHTML =
            '<p class="tabungan-kosong">⚠️ Firebase belum dikonfigurasi.</p>';
        ringkasanEl.innerHTML = "";
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "tabungan"));
        daftarTabungan = [];

        snapshot.forEach(function (docData) {
            daftarTabungan.push({ ...docData.data(), id: docData.id });
        });

        renderStatsTabungan(daftarTabungan);
        renderAccordion(daftarTabungan);
        renderRingkasan(daftarTabungan);
    } catch (err) {
        console.error("Gagal memuat tabungan:", err);
        accordionEl.innerHTML =
            '<p class="tabungan-kosong">Gagal memuat data dari server.</p>';
    }
}

// ---------- STATISTIK ----------
function renderStatsTabungan(items) {
    const total = items.reduce(function (acc, x) { return acc + (Number(x.nominal) || 0); }, 0);
    const totalBaim = items
        .filter(function (x) { return x.nama === "Baim"; })
        .reduce(function (acc, x) { return acc + (Number(x.nominal) || 0); }, 0);
    const totalDia = items
        .filter(function (x) { return x.nama === "Dia"; })
        .reduce(function (acc, x) { return acc + (Number(x.nominal) || 0); }, 0);

    // Total bulan ini
    const sekarang = new Date();
    const bulanIni = items.filter(function (x) {
        const d = toDate(x.tanggal);
        return d &&
            d.getMonth() === sekarang.getMonth() &&
            d.getFullYear() === sekarang.getFullYear();
    }).reduce(function (acc, x) { return acc + (Number(x.nominal) || 0); }, 0);

    // Jumlah hari menabung (hari unik yang ada tabungan)
    const setHari = new Set();
    items.forEach(function (x) {
        const d = toDate(x.tanggal);
        if (d) setHari.add(d.toDateString());
    });

    statsTabunganEl.innerHTML =
        kartuStatTabungan("💰", "Rp" + formatRupiah(total), "Total tabungan bersama") +
        kartuStatTabungan(tagAvatar(AVATAR_BAIM, "👦", "Baimm Ganteng"), "Rp" + formatRupiah(totalBaim), "Total Baimm Ganteng") +
        kartuStatTabungan(tagAvatar(AVATAR_DIA, "👧", "Alaa Cantik"), "Rp" + formatRupiah(totalDia), "Total Alaa Cantik") +
        kartuStatTabungan("📅", "Rp" + formatRupiah(bulanIni), "Total bulan ini") +
        kartuStatTabungan("🔥", setHari.size + " hari", "Jumlah hari menabung");
}

function kartuStatTabungan(emoji, angka, label) {
    return (
        '<div class="tabungan-stat">' +
        '<span class="tabungan-stat-emoji">' + emoji + "</span>" +
        '<span class="tabungan-stat-nomor">' + angka + "</span>" +
        '<span class="tabungan-stat-label">' + label + "</span>" +
        "</div>"
    );
}

function formatRupiah(angka) {
    return Number(angka || 0).toLocaleString("id-ID");
}

// ---------- PENGELOMPOKAN MINGGU ----------
function getMonday(date) {
    const d = new Date(date);
    const hari = d.getDay(); // 0 = Minggu
    const selisih = hari === 0 ? -6 : 1 - hari; // Senin = 1
    d.setDate(d.getDate() + selisih);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Kelompokkan tabungan jadi minggu-minggu (Senin-Jumat) + bonus weekend
function kelompokkanMinggu(items) {
    const mingguMap = new Map(); // key: string tanggal Senin

    items.forEach(function (item) {
        const d = toDate(item.tanggal);
        if (!d) return;

        const hari = d.getDay();
        const isWeekend = hari === 0 || hari === 6;

        if (isWeekend) {
            // Masuk ke kategori Bonus Weekend (dikelompokkan ke minggu dimulai hari Selasa lalu? gunakan Senin terdekat)
            const senin = getMonday(d);
            const key = senin.toDateString();
            if (!mingguMap.has(key)) {
                mingguMap.set(key, { senin: senin, hari: new Map(), weekend: [] });
            }
            mingguMap.get(key).weekend.push(item);
        } else {
            const senin = getMonday(d);
            const key = senin.toDateString();
            if (!mingguMap.has(key)) {
                mingguMap.set(key, { senin: senin, hari: new Map(), weekend: [] });
            }
            const info = mingguMap.get(key);
            const dayKey = d.toDateString();
            if (!info.hari.has(dayKey)) info.hari.set(dayKey, []);
            info.hari.get(dayKey).push(item);
        }
    });

    // Urutkan minggu dari paling baru
    return Array.from(mingguMap.values()).sort(function (a, b) {
        return b.senin - a.senin;
    });
}

// ---------- RENDER ACCORDION ----------
function renderAccordion(items) {
    if (items.length === 0) {
        accordionEl.innerHTML =
            '<p class="tabungan-kosong">💙 Belum ada tabungan. Ayo mulai nabung bareng!</p>';
        return;
    }

    const mingguList = kelompokkanMinggu(items);
    accordionEl.innerHTML = "";

    mingguList.forEach(function (minggu, idx) {
        const item = document.createElement("div");
        item.className = "tabungan-item";
        item.style.animationDelay = idx * 0.05 + "s";

        // Hitung total minggu (Senin-Jumat)
        let totalMinggu = 0;
        let totalBaim = 0;
        let totalDia = 0;
        const dafHari = [];
        minggu.hari.forEach(function (list, dayKey) {
            const d = new Date(dayKey);
            let totalHari = 0;
            list.forEach(function (t) {
                totalHari += Number(t.nominal) || 0;
                if (t.nama === "Baim") totalBaim += Number(t.nominal) || 0;
                else totalDia += Number(t.nominal) || 0;
            });
            totalMinggu += totalHari;
            dafHari.push({ tanggal: d, items: list, total: totalHari });
        });

        // Badge
        let badges = "";
        const badgeList = [];
        if (minggu.hari.size === 5) badgeList.push("🔥"); // Minggu Terrajin
        if (totalMinggu > 100000) badgeList.push("💎"); // Minggu Sultan
        if (minggu.weekend.length > 0) badgeList.push("🚀"); // Bonus Weekend
        badges = badgeList.join(" ");

        // Judul rentang minggu
        const akhir = new Date(minggu.senin);
        akhir.setDate(akhir.getDate() + 4); // Jumat
        const judul = "Minggu " + (idx + 1) + " (" +
            formatTanggalSingkat(minggu.senin) + " – " +
            formatTanggalSingkat(akhir) + ")";

        // Isi body
        let body = "";
        dafHari.sort(function (a, b) { return a.tanggal - b.tanggal; });
        dafHari.forEach(function (h) {
            body += renderHari(h.tanggal, h.items, h.total);
        });

        // Bonus weekend
        if (minggu.weekend.length > 0) {
            body += renderBonusWeekend(minggu.weekend);
        }

        item.innerHTML =
            '<button class="tabungan-head" onclick="toggleTabungan(this)">' +
            '<span><span class="tabungan-arrow">▶</span> ' + judul +
            (badges ? ' <span class="tabungan-badge">' + badges + "</span>" : "") +
            "</span>" +
            '<span class="tabungan-head-total">Rp' + formatRupiah(totalMinggu) + "</span>" +
            "</button>" +
            '<div class="tabungan-body">' + body + "</div>";

        accordionEl.appendChild(item);
    });
}

function renderHari(tanggal, items, totalHari) {
    let baim = 0, dia = 0;
    let catatans = [];
    items.forEach(function (t) {
        if (t.nama === "Baim") baim += Number(t.nominal) || 0;
        else dia += Number(t.nominal) || 0;
        if (t.catatan) catatans.push(t.catatan);
    });

    const catatanHtml = catatans.length
        ? '<div class="tabungan-day-catatan">📝 ' + catatans.map(escapeHtml).join(" • ") + "</div>"
        : "";

    const namaHari = NAMA_HARI[tanggal.getDay()];
    const tanggalStr = tanggal.getDate() + " " + NAMA_BULAN[tanggal.getMonth()] + " " + tanggal.getFullYear();

    return (
        '<div class="tabungan-day">' +
        '<div class="tabungan-day-title">' + namaHari + ", " + tanggalStr + "</div>" +
        '<div class="tabungan-day-row">' + tagAvatar(AVATAR_BAIM, "👦", "Baimm Ganteng") + ' Baimm Ganteng: <b>Rp' + formatRupiah(baim) + "</b></div>" +
        '<div class="tabungan-day-row">' + tagAvatar(AVATAR_DIA, "👧", "Alaa Cantik") + ' Alaa Cantik: <b>Rp' + formatRupiah(dia) + "</b></div>" +
        '<div class="tabungan-day-row tabungan-day-total">💰 Total: Rp' + formatRupiah(totalHari) + "</div>" +
        catatanHtml +
        "</div>"
    );
}

function renderBonusWeekend(weekend) {
    let body = '<div class="tabungan-bonus-title">🎉 Bonus Weekend</div>';
    let total = 0;
    weekend.forEach(function (t) {
        total += Number(t.nominal) || 0;
        const d = toDate(t.tanggal);
        const namaHari = NAMA_HARI[d.getDay()];
        const tanggalStr = d.getDate() + " " + NAMA_BULAN[d.getMonth()] + " " + d.getFullYear();
        const isBaim = t.nama === "Baim";
        const label = isBaim ? tagAvatar(AVATAR_BAIM, "👦", "Baimm Ganteng") : tagAvatar(AVATAR_DIA, "👧", "Alaa Cantik");
        const namaTampil = isBaim ? "Baimm Ganteng" : "Alaa Cantik";
        body +=
            '<div class="tabungan-day-row">' + label + " " + namaTampil + ': <b>Rp' +
            formatRupiah(t.nominal) +
            '</b> <span style="color:#9db8cc">(' +
            namaHari + ', ' + tanggalStr +
            ')</span></div>';
    });
    body += '<div class="tabungan-day-row tabungan-day-total">💰 Total Bonus: Rp' + formatRupiah(total) + "</div>";
    return body;
}

function formatTanggalSingkat(date) {
    const d = new Date(date);
    return d.getDate() + " " + NAMA_BULAN[d.getMonth()] + " " + d.getFullYear();
}

// ---------- TOGGLE ACCORDION ----------
function toggleTabungan(btn) {
    const item = btn.closest(".tabungan-item");
    item.classList.toggle("open");
}

// ---------- RINGKASAN MINGGU INI ----------
function renderRingkasan(items) {
    const sekarang = new Date();
    const seninIni = getMonday(sekarang);

    let totalBaim = 0, totalDia = 0, total = 0;

    items.forEach(function (x) {
        const d = toDate(x.tanggal);
        if (!d) return;
        const hari = d.getDay();
        if (hari === 0 || hari === 6) return; // skip weekend

        const seninItem = getMonday(d);
        if (seninItem.getTime() !== seninIni.getTime()) return;

        const nominal = Number(x.nominal) || 0;
        total += nominal;
        if (x.nama === "Baim") totalBaim += nominal;
        else totalDia += nominal;
    });

    if (total === 0) {
        ringkasanEl.innerHTML = "";
        return;
    }

    ringkasanEl.innerHTML =
        '<div class="tabungan-ringkasan-card">' +
        "<h4>📊 Ringkasan minggu ini</h4>" +
        '<div class="tabungan-ringkasan-row">' + tagAvatar(AVATAR_BAIM, "👦", "Baimm Ganteng") + ' Baimm Ganteng: <b>Rp' + formatRupiah(totalBaim) + "</b></div>" +
        '<div class="tabungan-ringkasan-row">' + tagAvatar(AVATAR_DIA, "👧", "Alaa Cantik") + ' Alaa Cantik: <b>Rp' + formatRupiah(totalDia) + "</b></div>" +
        '<div class="tabungan-ringkasan-row">💰 Total bersama: <b>Rp' + formatRupiah(total) + "</b></div>" +
        "</div>";
}

// Panggil saat halaman dimuat
muatTabungan();
window.toggleTabungan = toggleTabungan;

