document.addEventListener('DOMContentLoaded', () => {

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

      const date = new Date();

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

  }
  async function loadMasters() {

    if (!masterSelect) return;

    try {

      const response = await fetch('http://localhost:5000/api/masters');

      if (!response.ok) throw new Error();

      const masters = await response.json();


      masterSelect.innerHTML = '<option value="" disabled selected>Выберите мастера</option>';

      masters.forEach(m => {

        const option = document.createElement('option');

        option.value = m.name;

        option.textContent = `${m.name} (${m.specialization})`;

        masterSelect.appendChild(option);

      });

    } catch (err) {

      masterSelect.innerHTML = '<option value="">Любой свободный мастер</option>';

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

      modal.style.display = "block";

      document.body.style.overflow = "hidden";

    };

  }


  const closeModal = () => {

    modal.style.display = "none";

    document.body.style.overflow = "auto";

  };


  if (closeBtn) closeBtn.onclick = closeModal;


  if (form) {

    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const selectedDate = formData.get('bookingDate');
      const selectedTime = formData.get('bookingTimeSelect');

      const isoDateTime = `${selectedDate}T${selectedTime}`;

      const fullMessage = `САЙТ: ${formData.get('userName')}, ${formData.get('userPhone')}, Мастер: ${formData.get('userMaster')}, Услуга: ${formData.get('userService')}, Время: ${isoDateTime}, Коммент: ${formData.get('userComment')}`;

      try {
        const response = await fetch('http://localhost:5000/api/web-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullMessage }) // Отправляем объект с полем text
        });

        if (response.ok) {
          alert('✅ Запись прошла!');
          form.reset();
          closeModal();
        } else {
          console.error('Ошибка сервера:', response.status);
          alert('⚠️ Ошибка 400: Серверу не нравится формат данных');
        }
      } catch (err) {
        alert('⚠️ Ошибка: Rider не отвечает');
      }
    };

  }

  const cancelBooking = async () => {
    const phone = prompt("Введите ваш телефон для отмены записи:");
    if (!phone) return;

    try {
      const response = await fetch('http://localhost:5000/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone })
      });

      if (response.ok) {
        alert('❌ Запись отменена.');
      } else {
        alert('⚠️ Запись не найдена.');
      }
    } catch (err) {
      alert('⚠️ Ошибка соединения.');
    }
  };
});
