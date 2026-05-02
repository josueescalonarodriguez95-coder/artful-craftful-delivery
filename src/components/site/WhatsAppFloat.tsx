import { useLang } from "./LangContext";

export const WhatsAppFloat = () => {
  const { lang } = useLang();
  const phone = "17864262444";
  const message =
    lang === "es"
      ? "Hola, me gustaría más información sobre sus servicios."
      : "Hi, I'd like more information about your services.";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={lang === "es" ? "Chatear por WhatsApp" : "Chat on WhatsApp"}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.345 0 2.15-.515 2.478-1.39.115-.302.115-.56.058-.717-.13-.244-.488-.387-.832-.53zM16.466 24.85c-1.59 0-3.135-.5-4.482-1.347l-3.118.832.815-3.118c-.917-1.39-1.46-3.06-1.46-4.806 0-4.806 3.93-8.736 8.736-8.736s8.736 3.93 8.736 8.736-3.93 8.736-8.736 8.736zm0-19.064c-5.694 0-10.327 4.633-10.327 10.327 0 1.806.473 3.567 1.347 5.13L6 27l5.92-1.547a10.297 10.297 0 0 0 4.547 1.06c5.694 0 10.327-4.633 10.327-10.327S22.16 5.785 16.466 5.785z" />
      </svg>
    </a>
  );
};
