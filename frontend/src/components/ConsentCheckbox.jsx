import { Link } from 'react-router-dom';
import { legalInfo } from '../config/legal';

export default function ConsentCheckbox({ checked, onChange, id = 'consent' }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4a7c59] focus:ring-[#4a7c59] accent-[#4a7c59] flex-shrink-0"
      />
      <span>
        Я соглашаюсь с{' '}
        <Link to={legalInfo.privacyPath} target="_blank" className="text-[#4a7c59] underline hover:text-[#2d5a3b]">
          политикой обработки персональных данных
        </Link>{' '}
        и{' '}
        <Link to={legalInfo.offerPath} target="_blank" className="text-[#4a7c59] underline hover:text-[#2d5a3b]">
          публичной офертой
        </Link>
        . Данные нужны для связи по заявке и оказания услуг.
      </span>
    </label>
  );
}
