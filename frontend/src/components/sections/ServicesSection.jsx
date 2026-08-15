import { Sparkles, Calendar, MapPin, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showcaseServices } from '../../data/services';

const iconMap = {
  Sparkles,
  MapPin,
  Calendar,
  Star,
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-20 bg-white w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-br from-white to-[#faf8f6] rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
              <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                  <span className="relative pb-3 inline-block">
                    Услуги и цены
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
                  </span>
                </h2>
              </div>
              <p className="text-gray-500 text-center max-w-2xl mx-auto">
                Выберите идеальный образ для любого мероприятия
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseServices.map((service, idx) => {
              const Icon = iconMap[service.icon] || Sparkles;
              return (
              <div
                key={service.id}
                className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl flex flex-col h-full ${
                  service.popular ? 'border-2 border-[#4a7c59] shadow-md' : 'border border-gray-200 shadow-sm'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {service.popular && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-[#4a7c59] text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                      Популярный
                    </div>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div>
                    <div className="w-12 h-12 bg-[#4a7c59]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-[#4a7c59]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#2c2c2c] mb-2">
                      <span dangerouslySetInnerHTML={{ __html: service.title }} />
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-[#4a7c59]">{service.price}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                          <Sparkles size={14} className="text-[#4a7c59] flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/booking"
                      className="inline-flex items-center justify-between w-full px-4 py-2 border border-[#4a7c59] text-[#4a7c59] rounded-lg font-medium hover:bg-[#4a7c59] hover:text-white transition-all duration-300 group-hover:shadow-md"
                    >
                      <span>Записаться</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              * Точная стоимость определяется после консультации и зависит от сложности работы
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
