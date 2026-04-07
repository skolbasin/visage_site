export default function StatsSection() {
  return (
    <section className="py-12 md:py-16 bg-white text-center w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-white to-[#faf8f6] rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
            <div className="grid grid-cols-3 gap-8 md:gap-16">
              <div className="group cursor-pointer">
                <p className="text-3xl md:text-4xl text-[#4a7c59] font-bold group-hover:scale-110 transition-transform duration-300">6+</p>
                <p className="text-gray-500 text-sm">лет опыта</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-3xl md:text-4xl text-[#4a7c59] font-bold group-hover:scale-110 transition-transform duration-300">1000+</p>
                <p className="text-gray-500 text-sm">клиентов</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-3xl md:text-4xl text-[#4a7c59] font-bold group-hover:scale-110 transition-transform duration-300">100%</p>
                <p className="text-gray-500 text-sm">довольных</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}