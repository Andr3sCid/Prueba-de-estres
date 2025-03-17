import { IReduxState } from '../../../app/types';
import { constructOptions } from '../../connection/actions.any';
import { JITSI_CONNECTION_URL_KEY } from '../../connection/constants';
import JitsiMeetJS from '../../lib-jitsi-meet';
import { getLocalParticipant } from '../../participants/functions';
import { getConferenceOptions, sendLocalParticipant } from '../functions';
import { IJitsiConference } from '../reducer';

import { IVideoSource, IVirtualParticipant } from './types';

/**
 * Obtiene el ID del dispositivo de cámara del participante local.
 *
 * @async
 * @function
 * @returns {Promise<string>} Una promesa que resuelve al ID del dispositivo de cámara del participante local.
 */
async function getLocalMediaId(): Promise<string> {
    const localParticipant = getLocalParticipant(APP.store.getState());

    if (!localParticipant) {
        return '';
    }

    return localParticipant.cameraDeviceId ?? '';
}

/**
 * Agrega las diferentes fuentes de video cómo participantes en la videoconferencia.
 *
 * @returns { void }
 */
export async function addCaramaAsVirtualParticipant(): Promise<void> {
    const devices = await getVideoSources();
    const localUserVideoId = await getLocalMediaId();

    const foundedVideoDevices = devices?.filter(device => device.deviceId !== localUserVideoId) ?? [];

    if (foundedVideoDevices.length > 0) {
        for (const device of foundedVideoDevices) {
            console.log('Cantidad de dispositivos encontrados:', foundedVideoDevices);

            await addVirtualParticipantToConference(APP.store.getState(), device.deviceId);
        }
    }
}

/**
 * Agrega un participante virtual a la videoconferencia.
 *
 * @param { IReduxState } state - Estados de Redux.
 * @param { string } deviceId - ID de la cámara a agregar como participante virtual
 * ID de la cámara usada por el participante local para evitar cámaras sublicadas.
 *
 * @returns { void }
 */
async function addVirtualParticipantToConference(state: IReduxState, deviceId: string) {
    const { options, locationURL } = getConferenceData(state);
    const { jwt } = state['features/base/jwt'];

    const connection = new JitsiMeetJS.JitsiConnection(options.appId, jwt, options);

    connection[JITSI_CONNECTION_URL_KEY] = locationURL;

    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, async () => {

        const roomName = APP.conference.roomName;
        const conferenceOptions = getConferenceOptions(state);

        const virtualRoom: IJitsiConference = connection.initJitsiConference(roomName, conferenceOptions);

        const virtualParticipant: IVirtualParticipant = createVirtualParticipant(connection);

        configureVirtualRoomEvents(virtualRoom, virtualParticipant);

        addLocalTracksToVirtualRoom(virtualRoom, deviceId);

        sendLocalParticipant(state, virtualRoom);

        virtualRoom.setDisplayName(virtualParticipant.displayName);
        virtualRoom.join();
    });

    connection.connect();

}

/**
 * Genera los datos de un participante virtual.
 *
 * @function
 * @returns {{ participantId: string, participantName: string, role: string }}
 * Un objeto con el ID, nombre y rol del participante virtual.
 */
function getVirtualParticipantData(): { participantId: string; participantName: string; role: string; } {
    const participantId = `virtualParticipant-${Date.now()}`;

    return {
        participantId,
        participantName: `Cámara Virtual ${participantId}`,
        role: 'moderator'
    };
}

// eslint-disable-next-line valid-jsdoc
/**
 * Obtiene los datos de la conferencia basados en el estado de la aplicación.
 *
 * @function
 * @param {IReduxState} state - El estado global de la aplicación Redux.
 * @returns {{ options: IOptions, locationURL: URL | undefined }}
 * Un objeto con las opciones de la conferencia y la URL de ubicación.
 */
function getConferenceData(state: IReduxState) {
    const { locationURL } = state['features/base/connection'];

    return {
        options: constructOptions(state),
        locationURL
    };
}


/**
 *  Crea el usuairo virutal a agregar en la videoconferencia.
 *
 * @param { IJitsiConference } conference -
 * Objeto con la videoconferencia acual al que se le agrega el usuario virtrual.
 * @returns { IVirtualParticipant } Participante virtual a agregar a la videoconferencia.
 */
function createVirtualParticipant(conference: IJitsiConference): IVirtualParticipant {
    const { participantId, participantName } = getVirtualParticipantData();

    const virtualParticipant: IVirtualParticipant = {
        id: participantId,
        displayName: participantName,
        role: 'moderator',
        conference,
        sources: new Map<string, Map<string, IVideoSource>>()
    };

    virtualParticipant.sources.set('video', new Map([ [
        'camera', {
            muted: false,
            videoType: 'camera'
        }
    ] ]));

    return virtualParticipant;
}

/**
 * Configura los eventos para la sala virtual.
 *
 * @param { virtualRoom } virtualRoom - La sala virtual a la cual se conectará.
 * @param { virtualParticipant } virtualParticipant - Participante virtual el cual se unirá.
 * @returns { void }
 */
function configureVirtualRoomEvents(
        virtualRoom: IJitsiConference,
        virtualParticipant: IVirtualParticipant
): void {
    virtualRoom.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
        console.log('Participante virtual se ha unido a la conferencia');

        // APP.store.dispatch(participantJoined(virtualParticipant));
    });

    virtualRoom.on(JitsiMeetJS.events.conference.USER_JOINED, (id: string) => {
        console.log(`Participante detectado con ID: ${id}`);
    });
}

/**
 * Agrega los tracks locales al participante virtual.
 *
 * @param { IJitsiConference } virtualRoom - Sala virtual a al cual agregar el track.
 * @param { string } deviceId - Cámara virtual a agregar a la sala.
 *
 * @returns { void }
 */
function addLocalTracksToVirtualRoom(virtualRoom: IJitsiConference, deviceId: string): void {

    JitsiMeetJS.createLocalTracks({ devices: [ 'video' ],
        cameraDeviceId: deviceId })
        .then((tracks: unknown[]) => {
            if (tracks) {
                tracks.forEach(track => virtualRoom.addTrack(track));
            }
        })
        .catch((error: Error) => {
            console.error('Error al crear los tracks locales para el participante virtual:', error);
        });
}

/**
 * Obtiene una lista de dispositivos de entrada de video disponibles en el sistema.
 *
 * @returns {Promise<MediaDeviceInfo[]>} - Una promesa que resuelve con la lista de dispositivos de video.
 */
async function getVideoSources() {
    try {
        if (!navigator.mediaDevices?.enumerateDevices) {
            throw new Error('La API de dispositivos multimedia no es compatible con este navegador.');
        }

        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoSources = devices.filter(device => device.kind === 'videoinput');

        console.log('Dispositivos de video detectados:', videoSources);

        return videoSources;
    } catch (error) {
        console.error('Error al obtener las fuentes de video:', error);
        throw error;
    }
}
