document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Система запущена.");

  const API_URL = 'http://155.212.218.98:5000';

  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BASE_URL = IS_LOCAL ? 'http://localhost:5000' : API_URL;

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
    dateSelect.innerHTML = '<option value="" disabled selected>Дата визита</option>';

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateValue = `${y}-${m}-${day}`;

      const option = document.createElement('option');
      option.value = dateValue;
      option.textContent = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
      dateSelect.appendChild(option);
    }

    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    timeSelect.innerHTML = '<option value="" disabled selected>Время</option>';
    hours.forEach(h => {
      const option = document.createElement('option');
      option.value = h;
      option.textContent = h;
      timeSelect.appendChild(option);
    });
  }

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  if (openBtn) openBtn.onclick = (e) => {
    e.preventDefault();
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (modal) modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (burger) {
    burger.onclick = () => {
      burger.classList.toggle('active');
      navList.classList.toggle('active');
      document.body.classList.toggle('modal-open');
    };
  }

  const navLinks = document.querySelectorAll('.nav__link');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navList.classList.contains('active')) {
        burger.classList.remove('active');
        navList.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  });

  async function loadMasters() {
    if (!masterSelect) return;

    try {
      console.log(`🔍 Загружаем мастеров с ${BASE_URL}/api/masters`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 сек таймаут

      const res = await fetch(`${BASE_URL}/api/masters`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const masters = await res.json();

      if (!Array.isArray(masters) || masters.length === 0) {
        throw new Error('Нет доступных мастеров');
      }

      masterSelect.innerHTML = '<option value="" disabled selected>Выберите мастера</option>';
      masters.forEach(m => {
        const option = document.createElement('option');
        option.value = m.name;
        option.textContent = `${m.name} (${m.specialization || 'Профи'})`;
        masterSelect.appendChild(option);
      });

      console.log(`✅ Загружено ${masters.length} мастеров`);

    } catch (err) {
      console.error('❌ Ошибка загрузки мастеров:', err);

      if (err.name === 'AbortError') {
        masterSelect.innerHTML = '<option value="">⏱️ Сервер не отвечает (таймаут)</option>';
      } else if (err.message.includes('Failed to fetch')) {
        masterSelect.innerHTML = '<option value="">🌐 Проблема с сетью или CORS</option>';
      } else {
        masterSelect.innerHTML = '<option value="">⚠️ Ошибка загрузки мастеров</option>';
      }

      const fallbackOption = document.createElement('option');
      fallbackOption.value = 'любой';
      fallbackOption.textContent = 'Любой доступный мастер';
      masterSelect.appendChild(fallbackOption);
    }
  }

  loadMasters();

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
      }

      try {
        const formData = new FormData(form);

        const userName = formData.get('userName')?.trim();
        const userPhone = formData.get('userPhone')?.trim();
        const service = formData.get('userService')?.trim();
        const master = formData.get('userMaster')?.trim() || 'любой';
        const date = formData.get('bookingDate');
        const time = formData.get('bookingTimeSelect');
        const comment = formData.get('userComment')?.trim();

        // Валидация на фронтенде
        if (!userName || userName.length < 2) {
          throw new Error('Введите корректное имя');
        }

        if (!userPhone || !/^[\+]?[7-8][\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(userPhone)) {
          throw new Error('Введите корректный телефон');
        }

        if (!date || !time) {
          throw new Error('Выберите дату и время');
        }

        let bookingText = `Запись от ${userName}, телефон ${userPhone}, услуга ${service}, мастер ${master}, время ${date} ${time}`;

        if (comment && comment.length > 0) {
          bookingText += `, комментарий: ${comment}`;
        }

        const payload = { text: bookingText };

        console.log("📤 ОТПРАВКА:", payload);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 сек для отправки

        const response = await fetch(`${BASE_URL}/api/web-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          console.log('✅ Успех:', result);
          alert('✅ Запись успешно создана! Мы скоро свяжемся с вами.');
          form.reset();
          closeModal();
        } else {
          console.error("❌ Ошибка сервера:", result);
          const errorMsg = result.error || result.message || 'Неизвестная ошибка';
          alert(`⚠️ ${errorMsg}`);
        }

      } catch (err) {
        console.error("❌ Ошибка:", err);

        if (err.name === 'AbortError') {
          alert('⏱️ Превышено время ожидания. Попробуйте позже.');
        } else if (err.message.includes('Failed to fetch')) {
          alert('🌐 Не удается связаться с сервером.\n\nВозможные причины:\n- Сервер не запущен\n- Проблемы с CORS\n- Нестабильный Serveo туннель');
        } else {
          alert(`⚠️ ${err.message}`);
        }

      } finally {

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'ОТПРАВИТЬ ДАННЫЕ';
        }
      }
    };
  }


  console.log('🔧 Диагностика:');
  console.log(`- Хост: ${window.location.hostname}`);
  console.log(`- Протокол: ${window.location.protocol}`);
  console.log(`- API URL: ${BASE_URL}`);
  console.log(`- Локальный режим: ${IS_LOCAL}`);
});
