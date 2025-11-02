// src/utils/sendMail.js
import { Resend } from 'resend';

// Ініціалізація Resend з API-ключем із .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Надсилання листів через Resend API
 * @param {Object} options
 * @param {string} options.to - адреса отримувача
 * @param {string} options.subject - тема листа
 * @param {string} options.html - HTML-вміст листа
 */
export const sendMail = async (options) => {
  const from = process.env.RESEND_FROM || 'NoteHub <onboarding@resend.dev>';

  // Відправлення листа
  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  // Повертаємо результат у тому форматі, який використовує контролер
  return { data, error };
};

// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendMail = async (options) => {
//   return resend.emails.send({
//     from: process.env.RESEND_FROM,
//     to: options.to,
//     subject: options.subject,
//     html: options.html,
//   });
// };
