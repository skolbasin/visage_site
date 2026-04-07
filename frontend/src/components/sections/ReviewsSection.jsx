const reviewImages = [
  '/IMG_8861.png',
  '/IMG_8864.png',
  '/IMG_8865.png',
  '/IMG_8859.png',
  '/IMG_8857.png',
  '/IMG_20260406_230815_751.png',
  '/IMG_8866.png',
];

export default function ReviewsSection() {
  return (
    <section className="py-16 md:py-20 bg-[#faf8f6] text-center w-full relative overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-3 inline-block">
                  Отзывы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full"></span>
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-center">Что говорят мои клиенты</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {reviewImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <img src={img} alt={`Отзыв ${idx + 1}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {reviewImages.slice(4, 7).map((img, idx) => (
              <div key={idx + 4} className="w-1/3 max-w-xs group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <img src={img} alt={`Отзыв ${idx + 5}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">*Более 50+ отзывов в Instagram и Telegram</p>
        </div>
      </div>
    </section>
  );
}