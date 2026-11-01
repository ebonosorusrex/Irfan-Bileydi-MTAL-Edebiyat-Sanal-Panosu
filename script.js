const bgMusic = document.getElementById('bg-music');
const transitionSound = document.getElementById('transition-sound');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const welcomeOverlay = document.getElementById('welcome-overlay');
const enterBtn = document.getElementById('enter-btn');

bgMusic.volume = 0.3;
transitionSound.volume = 0.5;

let isAnmaGunu = false;

enterBtn.addEventListener('click', () => {
    welcomeOverlay.classList.add('hidden');
    if (!isAnmaGunu) {
        bgMusic.play().catch(() => {});
        musicToggleBtn.innerText = '🔇 Müziği Durdur';
    }
});

musicToggleBtn.addEventListener('click', () => {
    if (isAnmaGunu) return;
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggleBtn.innerText = '🔇 Müziği Durdur';
    } else {
        bgMusic.pause();
        musicToggleBtn.innerText = '🎵 Müzik Başlat';
    }
});

function switchPage(pageId) {
    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(pageId);

    if (currentPage && currentPage.id === pageId) return;
    if (currentPage) currentPage.classList.remove('active');

    transitionSound.currentTime = 0;
    transitionSound.play().catch(() => {});
    targetPage.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getBugununTarihi() {
    const now = new Date();
    const yil = now.getFullYear();
    const ay = String(now.getMonth() + 1).padStart(2, '0');
    const gun = String(now.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
}

async function loadDailyContent() {
    try {
        const response = await fetch('edebi.json');
        const data = await response.json();

        const bugunStr = getBugununTarihi();
        const dayOfYear = getDayOfYear();
        let bugununEtkinligi = null;

        if (data.ozel_gunler && data.ozel_gunler[bugunStr]) {
            bugununEtkinligi = data.ozel_gunler[bugunStr];
            temayiUygula(bugununEtkinligi.tur);
        } else {
            temayiUygula("Normal");
        }

        if (bugununEtkinligi && bugununEtkinligi.ozel_metinler) {
            const ot = bugununEtkinligi.ozel_metinler;
            
            document.getElementById('deyim-metin').innerText = `"${ot.deyim.metin}"`;
            document.getElementById('deyim-anlam').innerText = ot.deyim.anlam;

            document.getElementById('atasozu-metin').innerText = `"${ot.atasozu.metin}"`;
            document.getElementById('atasozu-anlam').innerText = ot.atasozu.anlam;

            document.getElementById('ozdeyis-metin').innerText = `"${ot.ozdeyis.metin}"`;
            document.getElementById('ozdeyis-yazar').innerText = `— ${ot.ozdeyis.yazar}`;
        } else {
            if (data.atasozleri && data.atasozleri.length > 0) {
                const item = data.atasozleri[dayOfYear % data.atasozleri.length];
                document.getElementById('atasozu-metin').innerText = `"${item.metin}"`;
                document.getElementById('atasozu-anlam').innerText = item.anlam;
            }

            if (data.deyimler && data.deyimler.length > 0) {
                const item = data.deyimler[dayOfYear % data.deyimler.length];
                document.getElementById('deyim-metin').innerText = `"${item.metin}"`;
                document.getElementById('deyim-anlam').innerText = item.anlam;
            }

            if (data.ozdeyisler && data.ozdeyisler.length > 0) {
                const item = data.ozdeyisler[dayOfYear % data.ozdeyisler.length];
                document.getElementById('ozdeyis-metin').innerText = `"${item.metin}"`;
                document.getElementById('ozdeyis-yazar').innerText = item.yazar ? `— ${item.yazar}` : '';
            }
        }

        if (data.turkce_degil_turkce && data.turkce_degil_turkce.length > 0) {
            const item = data.turkce_degil_turkce[dayOfYear % data.turkce_degil_turkce.length];
            document.getElementById('turkce-yabanci').innerText = item.yabanci;
            document.getElementById('turkce-dogru').innerText = item.turkce;
        }

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
    }
}

function temayiUygula(tur) {
    const body = document.body;
    
    body.classList.remove('tema-milli', 'tema-anma', 'tema-dini', 'tema-ozel');

    if (tur === "Anma Günü") {
        isAnmaGunu = true;
        body.classList.add('tema-anma'); // Anma arkaplanı aktifleşir
        musicToggleBtn.style.display = 'none'; // Müzik butonu gizlenir
        bgMusic.pause();
    } else {
        isAnmaGunu = false;
        musicToggleBtn.style.display = 'block';
    }

    if (tur === "Millî Bayram") {
        body.classList.add('tema-milli'); // Resmî bayram arkaplanı aktifleşir
    } else if (tur === "Dini Bayram") {
        body.classList.add('tema-dini');
    } else if (tur !== "Normal" && tur !== "Anma Günü") {
        body.classList.add('tema-ozel');
    }
}

window.addEventListener('DOMContentLoaded', loadDailyContent);