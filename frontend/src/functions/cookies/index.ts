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
export function setCookie(name: string, val: string, date?: string) {
  // Set it expire in 7 days

  // Set it
  localStorage.setItem(name, val);
}

export function getCookie(name: string): string {
  return localStorage.getItem(name) || "";
}

export function deleteCookie(name: string) {
  localStorage.removeItem(name);
}
