// export function getCookie(name: string): string | null {
//   const nameLenPlus = name.length + 1;
//   return (
//     window.document.cookie
//       .split(";")
//       .map((c) => c.trim())
//       .filter((cookie) => {
//         return cookie.substring(0, nameLenPlus) === `${name}=`;
//       })
//       .map((cookie) => {
//         return decodeURIComponent(cookie.substring(nameLenPlus));
//       })[0] || null
//   );
// }
export function setCookie(name: string, val: string, date: string) {
  const _date = new Date(date);
  const value = val;

  // Set it expire in 7 days

  // Set it
  document.cookie =
    name + '=' + value + '; expires=' + _date.toUTCString() + '; path=/';
}

export function getCookie(name: string): string {
  const value = '; ' + document.cookie;
  const parts: Array<string> = value.split('; ' + name + '=');

  if (parts.length == 2) {
    const ppop = parts.pop();
    if (ppop) {
      return ppop.split(';').shift() || '';
    }
  }
  return '';
}

export function deleteCookie(name: string) {
  const date = new Date();

  // Set it expire in -1 days
  date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);

  // Set it
  document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
}
