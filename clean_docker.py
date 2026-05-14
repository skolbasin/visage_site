"""
Кросс-платформенный скрипт для очистки Docker
Работает на Windows, Linux, macOS
"""

import subprocess
import platform


def run_command(cmd, description):
    """Выполняет команду и выводит результат"""
    print(f"\n📦 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout if result.stdout else "✅ Готово")
            return True
        else:
            print(f"❌ Ошибка: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False


def main():
    print("=" * 50)
    print("🧹 ОЧИСТКА DOCKER")
    print("=" * 50)
    print(f"ОС: {platform.system()} {platform.release()}")

    commands = [
        ("docker container prune -f", "Удаление остановленных контейнеров"),
        ("docker image prune -a -f", "Удаление неиспользуемых образов"),
        ("docker volume prune -f", "Удаление неиспользуемых томов"),
        ("docker network prune -f", "Удаление неиспользуемых сетей"),
        ("docker builder prune -f", "Очистка кэша сборки"),
    ]

    for cmd, desc in commands:
        run_command(cmd, desc)

    print("\n" + "=" * 50)
    print("📊 ИТОГОВОЕ ИСПОЛЬЗОВАНИЕ ДИСКА:")
    print("=" * 50)
    run_command("docker system df", "Статистика Docker")

    print("\n✅ Очистка завершена!")


if __name__ == "__main__":
    main()
