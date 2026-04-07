import { Link } from 'react-router-dom';
import { Heart, Star, Sparkles } from 'lucide-react';

const services = [
  {
    name: 'Макияж/прическа в студии',
    price: 'от 5000 ₽',
    desc: 'Стойкий образ на весь день. Идеально подходит для фотосессий, свиданий и повседневного образа.',
    fullDesc: 'Включено: консультация, подбор тона, макияж глаз, бровей, губ, укладка, фиксация спреем.'
  },
  {
    name: 'Полный образ в студии',
    price: 'от 8000 ₽',
    desc: 'Комплексное преображение для особых мероприятий. Включает макияж, прическу и подбор аксессуаров.',
    fullDesc: 'Включено: всё из предыдущего пакета + сложная укладка, наращивание ресниц (опционально), подвеска или ободок.'
  },
  {
    name: 'Макияж/прическа с выездом',
    price: 'от 7000 ₽',
    desc: 'Выезд к вам домой или в студию. Экономит ваше время и создаёт комфортную атмосферу.',
    fullDesc: 'Включено: услуги макияжа и/или прически на вашей территории. Работаю с любыми условиями.'
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-20 bg-[#faf8f6] w-full relative">
      <div className="px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block bg-white rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-3 inline-block">
                  Услуги
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-center">Выберите идеальный вариант для вашего образа</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <h3 className="text-2xl font-bold text-[#2c2c2c] mb-3 group-hover:text-[#4a7c59] transition-colors">
                {s.name}
              </h3>
              <p className="text-gray-600 text-base mb-3">{s.desc}</p>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.fullDesc}</p>
              <ul className="text-gray-500 text-sm mb-6 space-y-2">
                <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-[#4a7c59]" /> Подбор образа</li>
                <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#4a7c59]" /> Премиум косметика</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#4a7c59]" /> Стойкость весь день</li>
              </ul>
              <p className="text-[#4a7c59] text-2xl font-bold mb-6">{s.price}</p>
              <Link to="/booking" className="block text-center btn-primary">Записаться</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}