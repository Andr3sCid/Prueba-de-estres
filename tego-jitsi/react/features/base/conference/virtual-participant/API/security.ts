import jwtDecode from 'jwt-decode';

import { getRoomName } from '../../functions';
import { IAccessTokenRequest } from '../interfaces/IAccessTokenRequest';

const api = process.env.API_TEGO;

const urlAPI = 'http://localhost:4000/';

/**
 * Solicita a la API de TEGO FRO una validación de la llave de acceso obtenida.
 *
 * @param { string } token - Token de acceso a la API.
 * @param { string } roomName - Código de acceso a la videoconferencia.
 *
 * @returns { boolean }
 */
export async function validateSecureCode(token: string, roomName: string) {
    const decodeToken: IAccessTokenRequest = decodeJWT(token) as IAccessTokenRequest ?? {
        accessCode: '',
        appToken: ''
    };

    const response = await fetch(`${urlAPI}synchronous-communication/verify-code`, {
        method: 'POST',
        headers: {
            'x-access-token': decodeToken.appToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            conferenceCode: decodeToken.accessCode,
            conferenceId: roomName.replace('%20', ' ')
        })
    });

    if (response.status === 200) {
        return true;
    }

    return false;
}

/**
 * Construye el header con los campos necesarios para las peticiones a la API de TEGO FRO.
 *
 * @param { string } token - TOken de acceso para realizar la petición.
 * @returns { { 'x-access-token': string, 'Content-Type': string} } - Header de la petición a la API de TEGO FRO.
 */
function buildHeader(token: string) {
    return {
        'x-access-token': token,
        'Content-Type': 'application/json'
    };
}

function decodeJWT(token: string) {
    const decode = jwtDecode(token);

    return decode;
}
