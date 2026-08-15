/** Единый каталог услуг и цен для витрины и записи */
export const bookingServices = [
  { id: 1, name: 'Макияж в студии', price: '5000 ₽', priceFrom: false, duration: '2 часа' },
  { id: 2, name: 'Прическа в студии', price: '4000 ₽', priceFrom: false, duration: '1.5 часа' },
  { id: 3, name: 'Полный образ (макияж + прическа) в студии', price: '8000 ₽', priceFrom: false, duration: '3 часа' },
  { id: 4, name: 'Макияж с выездом', price: '7000 ₽', priceFrom: false, duration: '2 часа' },
  { id: 5, name: 'Прическа с выездом', price: '6000 ₽', priceFrom: false, duration: '1.5 часа' },
  { id: 6, name: 'Полный образ с выездом', price: '11000 ₽', priceFrom: false, duration: '3 часа' },
  { id: 7, name: 'Обучение макияжу (1 урок)', price: '9000 ₽', priceFrom: false, duration: '3 часа' },
  { id: 8, name: 'Обучение макияжу (2 урока)', price: '15000 ₽', priceFrom: false, duration: '6 часов' },
];

export const showcaseServices = [
  {
    id: 1,
    title: 'Макияж/прическа<br />в студии',
    description: 'Стойкий макияж/прическа для любого события',
    price: 'от 5000 ₽',
    icon: 'Sparkles',
    features: ['Профессиональная косметика', 'Индивидуальный подход', 'Стойкость до 12 часов'],
    popular: false,
  },
  {
    id: 2,
    title: 'Макияж/прическа<br />с выездом',
    description: 'Макияж или прическа с выездом к вам домой или отель. Экономит ваше время и создаёт комфортную атмосферу.',
    price: 'от 7000 ₽',
    icon: 'MapPin',
    features: ['Выезд в пределах СПб', 'Удобство и комфорт', 'Стойкость до 12 часов'],
    popular: true,
  },
  {
    id: 3,
    title: 'Полный образ<br />в студии',
    description: 'Полный образ (макияж и прическа) в студии для особых мероприятий',
    price: 'от 8000 ₽',
    icon: 'Calendar',
    features: ['Макияж + прическа', 'Профессиональная косметика', 'Стойкость до 12 часов'],
    popular: false,
  },
  {
    id: 4,
    title: 'Полный образ<br />с выездом',
    description: 'Полный образ (макияж и прическа) с выездом к вам. Идеально для свадеб, выпускных и особых событий',
    price: 'от 11000 ₽',
    icon: 'Star',
    features: ['Макияж + прическа', 'Выезд в пределах СПб', 'Индивидуальный подход'],
    popular: false,
  },
];

export const certificateServicesList = bookingServices.map((s) => s.name);
