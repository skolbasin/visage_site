import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Какой косметикой вы работаете?',
      answer: 'Использую только профессиональную косметику премиум-брендов: Chanel, Dior, MAC, Giorgio Armani, Anastasia Beverly Hills и другие. Вся косметика гипоаллергенна и протестирована.'
    },
    {
      question: 'Делаете ли вы пробный макияж?',
      answer: 'Да, пробный макияж обязателен для свадебных образов и рекомендуется для вечерних. Стоимость пробного макияжа — 3000 ₽, она вычитается из стоимости основного при записи.'
    },
    {
      question: 'Что входит в стоимость макияжа?',
      answer: 'Консультация, подбор тона, коррекция лица, макияж глаз, бровей, губ, фиксация спреем, а также рекомендации по уходу и сохранению макияжа.'
    },
    {
      question: 'Как подготовиться к визиту?',
      answer: 'Рекомендую прийти с чистой увлажнённой кожей без тонального крема. Если есть аллергия или особенности кожи — сообщите заранее.'
    },
    {
      question: 'Можно ли отменить или перенести запись?',
      answer: 'Да, отмена или перенос возможны не позднее чем за 24 часа до записи. В противном случае взимается штраф 50% от стоимости услуги.'
    },
    {
      question: 'Работаете ли вы с выездом?',
      answer: 'Да, выезд возможен в пределах Санкт-Петербурга. Стоимость выезда — от 1000 ₽ в зависимости от удалённости.'
    },
    {
      question: 'Есть ли сертификаты на услуги?',
      answer: 'Да, вы можете приобрести подарочный сертификат на любую сумму или конкретную услугу в разделе "Подарочные сертификаты".'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] text-center mb-4">
          Часто задаваемые вопросы
        </h1>
        <p className="text-gray-500 text-center mb-12">
          Ответы на самые популярные вопросы клиентов
        </p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition"
              >
                <span className="font-medium text-[#2c2c2c]">{faq.question}</span>
                {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openIndex === idx && (
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Если остались вопросы */}
        <div className="mt-12 text-center p-6 bg-[#faf8f6] rounded-2xl">
          <p className="text-gray-600 mb-3">Не нашли ответ на свой вопрос?</p>
          <p className="text-gray-400 text-sm mt-4">
  Напишите в{' '}
  <a
    href="https://t.me/anastasia_romancha"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#4a7c59] hover:text-[#2d5a3b] underline decoration-transparent hover:decoration-[#4a7c59] transition"
  >
    Telegram
  </a>
  {' или '}
  <a
    href="https://instagram.com/anastasia.romancha"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#4a7c59] hover:text-[#2d5a3b] underline decoration-transparent hover:decoration-[#4a7c59] transition"
  >
    Instagram
  </a>
</p>
        </div>
      </div>
    </div>
  );
}