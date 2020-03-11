import {get, post} from 'axios'

const {VUE_APP_NOTIFICATIONS_ENDPOINT:endpoint} = process.env;

export function authenticateWithCredentials({login:email, password:motDePasse}) {
  let params = {
    email,
    motDePasse,
  };

  return post(`${endpoint}/api/auth/login`, params)
    .then(({data}) => ({
      token: data.token,
      decodedToken: parseJwt(data.token),
    }))
}

export function getUserProfileFromToken({userId, token}) {
  return get(`${endpoint}/portail/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(({data}) => data)
}

export function parseJwt (token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""));

  return JSON.parse(jsonPayload);
}
