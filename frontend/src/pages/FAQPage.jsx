import { useState } from 'react';
import { ChevronDown, HelpCircle, Clock, CreditCard, MapPin, Phone, Mail, Calendar, Star, Sparkles } from 'lucide-react';
import AnimatedStars from '../components/AnimatedStars';

const faqItems = [
  {
    id: 1,
    question: 'Какую косметику вы используете?',
    answer: 'Моя косметика на 80% состоит из люксового сегмента: "Dior", "Gucci", "Tom Ford" и т.д., а также на 20% из профессионального и бюджетного сегмента: "A.Voevodina", "Shik", "Arive" и т.д. Все средства гипоаллергенны и подходят для разных типов кожи.',
  },
  {
    id: 2,
    question: 'Делаете ли вы пробный макияж?',
    answer: 'Да, пробный образ делаю по желанию клиента. Чаще всего нужен он перед свадьбой, чтобы Вы были уверенны в своем образе в день торжества на 100%, а также для знакомства с мастером.',
  },
  {
    id: 3,
    question: 'Что входит в стоимость макияжа?',
    answer: 'Консультация, подбор тона, коррекция лица, макияж глаз, бровей, губ, а также рекомендации по уходу и сохранению макияжа.',
  },
  {
    id: 4,
    question: 'Как подготовиться к визиту?',
    answer: 'Рекомендую прийти с чистой увлажнённой кожей без тонального крема. Если есть аллергия или особенности кожи — сообщите заранее. Волосы обязательно хорошо промыть шампунем и просушить феном в день встречи.',
  },
  {
    id: 5,
    question: 'Можно ли отменить или перенести запись?',
    answer: 'Да, отмена или перенос возможны не позднее чем за 3 суток до начала записи. В противном случае предоплата остается за мной.',
  },
  {
    id: 6,
    question: 'Сколько стоит выезд?',
    answer: 'Выезд в пределах Санкт-Петербурга — от 2000 ₽. Также возможен выезд за пределы Санкт-Петербурга, стоимость обговаривается отдельно.',
  },
  {
    id: 7,
    question: 'Какой срок действия подарочного сертификата?',
    answer: 'Срок действия подарочного сертификата — 6 месяцев с момента покупки. Вы можете продлить его, связавшись со мной заранее.',
  },
  {
    id: 8,
    question: 'Нужно ли иметь свою косметику?',
    answer: 'Нет, Вы можете прийти с чистой кожей лица.',
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Часто задаваемые вопросы</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Ответы на самые популярные вопросы обо мне и моих услугах</p>
        </div>

        <div className="space-y-4 mb-12">
          {faqItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-[#2c2c2c]">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openItems.includes(item.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openItems.includes(item.id) ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-0 text-gray-500 border-t border-gray-100 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#4a7c59]/5 to-[#8bbd9b]/5 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4a7c59]/10 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-[#4a7c59]" />
          </div>
          <h3 className="text-xl font-serif text-[#2c2c2c] mb-4">Остались вопросы?</h3>
          <p className="text-gray-500 mb-6">Свяжитесь со мной любым удобным способом, и я с радостью помогу</p>
          <div className="flex flex-wrap justify-center gap-6">
          </div>
        </div>
      </div>
    </div>
  );
}