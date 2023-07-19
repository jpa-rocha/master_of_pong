import { Outlet, Navigate } from "react-router-dom";
import jwt, {VerifyErrors} from 'jsonwebtoken';

const PrivateRoutes = () => {
  let token: string = getToken("jwtToken");
  const secret = "alsosecret";
  let auth = { token: false };
  
  console.log("token : " + token);

  try {
    // jwt.verify(token, secret);
    auth.token = true;
  } catch (error) {
    if (error instanceof Error) {
      console.log('Invalid Token');
    } else  {
      console.log('Something went wrong');
    }
  }

  return auth ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;

function getToken(tokenName: string): string {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(tokenName + "=")) {
      return cookie.substring(tokenName.length + 1);
    }
  }
  return "";
}

// function isTokenValid(token: string, secrect: string): boolean {
//     try {
//         jwt.verify(token, secrect);
//         return true;
//     } catch (err) {
//         return false;
//     }
// }
