/**
 * Cookie vieja del tema de la agencia (hasta P3-3). Desde la tanda P3-4 el
 * tema es por estilo, en `localStorage` (`malejo-tema-<estilo>`): la cookie
 * solo se lee una vez para migrarla a Tech y se borra. El portfolio usa
 * otra (`theme`), que no se toca.
 */
export const AGENCIA_THEME_COOKIE = "malejo-theme";
