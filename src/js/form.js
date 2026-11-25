/* Форма заявки.
   Підключення до обробника поточного сайту: вкажіть URL у data-endpoint форми
   (POST, multipart/form-data, поля: name, phone, consent).
   Без endpoint форма працює в демо-режимі: показує успіх без відправки.
   Форм на сторінці кілька: головна + два попапи — логіка однакова. */

// Ціль Яндекс Метрики з поточного сайту (спрацює, якщо лічильник ym підключено)
const METRIKA_ID = 112185762;
const METRIKA_GOAL = 'form_submit';

/** 10 цифр номера без коду країни */
function nationalDigits(value, prev) {
  let d = value.replace(/\D/g, '');
  if (value.trim().startsWith('+7')) d = d.slice(1);
  else if (d.length && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
  // звичка набирати «8 900…»: перша введена 8/7 — це префікс, а не код
  if (!prev && d.length === 1 && (d === '8' || d === '7')) d = '';
  if (!prev && d.length === 11 && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
  return d.slice(0, 10);
}

function formatPhone(d) {
  if (!d) return '+7 (';
  let out = '+7';
  if (d.length) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

const phoneDigits = (v) => v.replace(/\D/g, '').replace(/^[78]/, '');

export function initForm() {
  document.querySelectorAll('[data-form]').forEach(setupForm);
}

function setupForm(form) {
  const name = form.elements.name;
  const phone = form.elements.phone;
  const consent = form.elements.consent;
  const submit = form.querySelector('[type="submit"]');
  const success = form.querySelector('.form__success');

  let national = '';
  phone.addEventListener('input', (e) => {
    // стирання до коду країни — очищаємо поле повністю
    if (e.inputType && e.inputType.startsWith('delete') && phone.value.replace(/\D/g, '').length <= 1) {
      national = '';
      phone.value = '';
      return;
    }
    const atEnd = phone.selectionStart === phone.value.length;
    national = nationalDigits(phone.value, national);
    phone.value = formatPhone(national);
    if (atEnd) phone.setSelectionRange(phone.value.length, phone.value.length);
  });
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+7 ('; });
  phone.addEventListener('blur', () => { if (phoneDigits(phone.value).length === 0) phone.value = ''; });

  const setError = (input, msg) => {
    const field = input.closest('.form__field, .form__consent');
    field.classList.toggle('has-error', Boolean(msg));
    if (msg) field.classList.remove('is-valid');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const out = field.querySelector('.form__error');
    if (out) out.textContent = msg || '';
  };

  const validate = () => {
    const errors = [];
    if (name.value.trim().length < 2) errors.push([name, 'Введите имя']);
    else setError(name, '');
    if (phoneDigits(phone.value).length !== 10) errors.push([phone, 'Введите номер телефона полностью']);
    else setError(phone, '');
    if (!consent.checked) errors.push([consent, ' ']);
    else setError(consent, '');
    errors.forEach(([el, msg]) => setError(el, msg));
    return errors;
  };

  const isOk = (el) => (el === name ? name.value.trim().length >= 2 : phoneDigits(phone.value).length === 10);
  [name, phone].forEach((el) => el.addEventListener('input', () => {
    const field = el.closest('.form__field');
    field.classList.toggle('is-valid', isOk(el));
    if (field.classList.contains('has-error')) validate();
  }));
  consent.addEventListener('change', () => setError(consent, consent.checked ? '' : ' '));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) { errors[0][0].focus(); return; }

    submit.classList.add('is-loading');
    submit.disabled = true;
    try {
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 900)); // демо-режим
      }
      success.hidden = false;
      form.reset();
      national = '';
      consent.checked = true;
      form.querySelectorAll('.is-valid').forEach((f) => f.classList.remove('is-valid'));
      document.documentElement.dataset.leadSent = '1';
      if (typeof window.ym === 'function') window.ym(METRIKA_ID, 'reachGoal', METRIKA_GOAL);
      form.dispatchEvent(new CustomEvent('lead:sent', { bubbles: true }));
    } catch (err) {
      console.error(err);
      setError(phone, 'Не удалось отправить заявку. Позвоните нам: +8 (906) 186-4-185');
    } finally {
      submit.classList.remove('is-loading');
      submit.disabled = false;
    }
  });
}
