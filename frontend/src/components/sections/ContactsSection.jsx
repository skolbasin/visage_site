export default function ContactsSection() {
  return (
    <section id="contacts" className="py-12 md:py-16 bg-[#faf8f6] text-center w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
            <span className="relative pb-3 inline-block">
              Контакты
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
            </span>
          </h2>
        </div>
        <p className="text-gray-600 mt-6">📍 Санкт-Петербург ✉️ romancha.96@list.ru</p>
        <div className="mt-6 flex justify-center gap-6">
          <a href="https://instagram.com" className="text-[#4a7c59] hover:text-[#2d5a3b] transition transform hover:scale-110 duration-300">Instagram</a>
          <a href="https://t.me" className="text-[#4a7c59] hover:text-[#2d5a3b] transition transform hover:scale-110 duration-300">Telegram</a>
        </div>
      </div>
    </section>
  );
}