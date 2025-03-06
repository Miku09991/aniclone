import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
const Footer = () => {
  return <footer className="bg-[#121212] border-t border-[#2a2a2a] py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">AniClone</h3>
            <p className="text-gray-400 text-sm">
              Аниме-портал с огромной коллекцией аниме. Смотрите аниме онлайн в хорошем качестве совершенно бесплатно.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-red-500 transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/releases" className="text-gray-300 hover:text-red-500 transition-colors">
                  Релизы
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-gray-300 hover:text-red-500 transition-colors">
                  Расписание
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-300 hover:text-red-500 transition-colors">
                  Избранное
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-red-500 transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-red-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-gray-300 hover:text-red-500 transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-red-500 transition-colors">
                  Правила
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Подписка</h4>
            <p className="text-gray-400 text-sm mb-3">
              Подпишитесь на нашу рассылку, чтобы получать уведомления о новых релизах
            </p>
            <div className="flex">
              <Input type="email" placeholder="Ваш Email" className="bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-r-none focus-visible:ring-red-500" />
              <Button className="bg-red-500 hover:bg-red-600 rounded-l-none">
                Подписаться
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-6 bg-[#2a2a2a]" />
        <div className="text-center text-gray-400 text-sm">
          <p>© 2025 AniClone. Все права защищены.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;