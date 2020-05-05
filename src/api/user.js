import {post} from 'axios'

const {VUE_APP_API_ENDPOINT:endpoint} = process.env;

export function authenticateWithCredentials({ login:email, password }) {
  return post(`${endpoint}/v1/login`, { email, password })
    .then(({ data }) => ({
      token: data.agencebio,
      decodedToken: parseJwt(data.agencebio),
      cartobioToken: data.cartobio
    }))
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
