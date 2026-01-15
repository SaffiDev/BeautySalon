document.addEventListener('DOMContentLoaded', () => {
  console.log("Скрипт app.js загружен и DOM готов");

  const burger = document.querySelector('.nav__burger');
  const navList = document.querySelector('.nav__list');
  const modal = document.getElementById('bookingModal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.querySelector('.modal__close');
  const form = document.getElementById('bookingForm');
  const masterSelect = document.getElementById('masterSelect');
  const dateSelect = document.getElementById('bookingDate');
  const timeSelect = document.getElementById('bookingTimeSelect');

  if (dateSelect && timeSelect) {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const option = document.createElement('option');
      option.value = date.toISOString().split('T')[0];
      option.textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
      dateSelect.appendChild(option);
    }

    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    hours.forEach(h => {
      const option = document.createElement('option');
      option.value = h;
      option.textContent = h;
      timeSelect.appendChild(option);
    });
    console.log("Даты и время заполнены");
  }

  async function loadMasters() {
    if (!masterSelect) {
      console.warn("Элемент masterSelect не найден");
      return;
    }

    try {
      console.log("Пытаюсь загрузить мастеров...");
      const response = await fetch('http://localhost:5000/api/masters');
      console.log("Ответ от /api/masters:", response.status);

      if (!response.ok) {
        throw new Error(`Сервер вернул ${response.status}`);
      }

      const masters = await response.json();
      console.log("Полученные мастера:", masters);

      masterSelect.innerHTML = '<option value="" disabled selected>Выберите мастера</option>';

      if (Array.isArray(masters) && masters.length > 0) {
        masters.forEach(m => {
          const option = document.createElement('option');
          option.value = m.name;
          option.textContent = `${m.name} (${m.specialization || 'Без специализации'})`;
          masterSelect.appendChild(option);
        });
        console.log(`Добавлено ${masters.length} мастеров в селект`);
      } else {
        console.warn("Мастеров нет или данные не массив");
        masterSelect.innerHTML += '<option value="">Нет доступных мастеров</option>';
      }
    } catch (err) {
      console.error('Ошибка загрузки мастеров:', err);
      masterSelect.innerHTML = '<option value="">Любой свободный мастер (ошибка загрузки)</option>';
    }
  }

  loadMasters();

  if (burger) {
    burger.onclick = () => {
      burger.classList.toggle('active');
      navList.classList.toggle('active');
    };
  }

  if (openBtn) {
    openBtn.onclick = (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.classList.add('modal-open');
      console.log("Модалка открыта");
    };
  }

  const closeModal = () => {
    modal.classList.remove('active'); // Исправлено на 'active'
    document.body.classList.remove('modal-open');
    console.log("Модалка закрыта");
  };

  if (closeBtn) closeBtn.onclick = closeModal;


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  if (closeBtn) closeBtn.onclick = closeModal;


  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  if (closeBtn) closeBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const selectedDate = formData.get('bookingDate');
      const selectedTime = formData.get('bookingTimeSelect');
      const isoDateTime = `${selectedDate}T${selectedTime}`;

      const fullMessage = `САЙТ: ${formData.get('userName') || 'Не указано'}, ${formData.get('userPhone') || 'Не указано'}, Мастер: ${formData.get('userMaster') || 'Не выбран'}, Услуга: ${formData.get('userService') || 'Не выбрана'}, Время: ${isoDateTime || 'Не указано'}, Коммент: ${formData.get('userComment') || 'Нет'}`;

      try {
        console.log("Отправляю форму, данные:", fullMessage);

        const response = await fetch('http://localhost:5000/api/web-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: fullMessage })
        });

        console.log("Ответ от /api/web-booking:", response.status);

        if (response.ok) {
          alert('✅ Запись прошла успешно!');
          form.reset();
          closeModal();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Ошибка от сервера:", errorData);
          alert(`⚠️ Ошибка: ${errorData.error || 'Сервер не принял заявку'}`);
        }
      } catch (err) {
        console.error('Ошибка при отправке формы:', err);
        alert('⚠️ Проблема с соединением. Проверьте интернет или перезапустите туннель.');
      }
    };
  }

  console.log("Инициализация app.js завершена");
});
