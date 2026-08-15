import { Link } from 'react-router-dom';
import { legalInfo } from '../config/legal';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6 prose prose-gray">
        <h1 className="font-serif text-3xl md:text-4xl text-[#2c2c2c] mb-2">Политика обработки персональных данных</h1>
        <p className="text-gray-500 text-sm mb-8">
          Дата публикации: 15 августа 2026 г. Сайт: {legalInfo.siteUrl}
        </p>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">1. Оператор</h2>
          <p>
            Оператор персональных данных: {legalInfo.fullName}, статус — {legalInfo.status},
            ИНН {legalInfo.inn}, город {legalInfo.city}.
            Контакт для обращений по персональным данным:{' '}
            <a href={`mailto:${legalInfo.email}`} className="text-[#4a7c59] underline">
              {legalInfo.email}
            </a>
            .
          </p>
          <p>
            Сайт бренда «{legalInfo.brandName}» ({legalInfo.siteUrl}) принадлежит указанному оператору.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">2. Какие данные обрабатываются</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>имя, телефон, адрес электронной почты;</li>
            <li>данные заявок на запись, вопросы и оформление сертификатов;</li>
            <li>технические данные (IP, cookie, сведения о браузере) при согласии на аналитику.</li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">3. Цели обработки</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>связь с клиентом и оказание услуг визажиста-стилиста;</li>
            <li>оформление и учёт подарочных сертификатов;</li>
            <li>ответы на обращения;</li>
            <li>улучшение работы сайта (Яндекс.Метрика) — только при отдельном согласии через cookie-баннер.</li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">4. Правовые основания</h2>
          <p>
            Обработка осуществляется на основании согласия субъекта персональных данных (ст. 6, 9 Федерального закона
            № 152-ФЗ «О персональных данных»), а также для исполнения договора (публичной оферты) на оказание услуг.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">5. Хранение и передача</h2>
          <p>
            Данные хранятся на серверах, используемых для работы сайта, в течение срока, необходимого для целей
            обработки, либо до отзыва согласия, если иное не требуется законом. Данные могут передаваться сервисам
            доставки почты и мессенджерам для уведомлений оператора. Трансграничная передача через Google Analytics
            на сайте не используется.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">6. Права субъекта</h2>
          <p>
            Вы вправе запросить доступ к своим данным, их уточнение, блокирование или удаление, а также отозвать
            согласие, направив письмо на {legalInfo.email}.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">7. Cookie и аналитика</h2>
          <p>
            Необходимые cookie могут использоваться для работы сайта. Аналитические cookie Яндекс.Метрики
            подключаются только после вашего согласия в баннере. Отказ не мешает пользоваться основными функциями сайта.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-[#2c2c2c]">8. Фотографии</h2>
          <p>
            Фотографии работ и материалы «до/после» публикуются при наличии согласия изображённых лиц на использование
            изображения в портфолио и на сайте.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-10">
          См. также:{' '}
          <Link to={legalInfo.offerPath} className="text-[#4a7c59] underline">
            публичная оферта
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
