import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  let token = getToken("jwtToken");
  console.log("token : " + token);
  let auth = { token: true };
  return auth.token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;

function getToken(tokenName: string): string | null {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(tokenName + "=")) {
      return cookie.substring(tokenName.length + 1);
    }
  }
  return null;
}

// function isTokenValid(token: string, secrect: string): boolean {
//     try {
//         jwt.verify(token, secrect);
//         return true;
//     } catch (err) {
//         return false;
//     }
// }
