import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COOKIE_CONSENT_KEY, legalInfo } from '../config/legal';

function isValidMetrikaId(id) {
  return Boolean(id && /^\d+$/.test(String(id)));
}

export function initYandexMetrika() {
  const id = legalInfo.yandexMetrikaId;
  if (!isValidMetrikaId(id) || typeof window === 'undefined') return;
  if (window.__visageMetrikaInitialized) return;

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  window.ym(Number(id), 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  });
  window.__visageMetrikaInitialized = true;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === 'accepted') {
      initYandexMetrika();
      setVisible(false);
      return;
    }
    if (stored === 'declined') {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    initYandexMetrika();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-lg rounded-2xl p-4 md:p-5 pointer-events-auto">
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Мы используем файлы cookie и Яндекс.Метрику для улучшения сайта. Продолжая пользоваться сайтом,
          вы можете согласиться с аналитикой или отказаться. Подробнее — в{' '}
          <Link to={legalInfo.privacyPath} className="text-[#4a7c59] underline hover:text-[#2d5a3b]">
            политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={decline}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 text-sm rounded-xl bg-[#4a7c59] text-white hover:bg-[#2d5a3b] transition"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
