export function getToken(tokenName: string): string {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(tokenName + "=")) {
        return cookie.substring(tokenName.length + 1);
      }
    }
    return "";
  }