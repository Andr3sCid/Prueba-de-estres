import html2canvas from 'html2canvas';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
     * Captura la imagen de la fuente de video principal.
     *
     * @returns {void}
     */
export async function onScreenShoot() {
    try {
        const element = document.getElementById('largeVideo');
        console.log('Elemento: ', element);
        if (!element) {

            Toastify({
                text: 'No hay ninguna cámara seleccionada como principal.',
                duration: 3000,
                close: false,
                gravity: 'top',
                position: 'right',
                backgroundColor: '#F44336',
                stopOnFocus: true
            }).showToast();
            return;
        }

        const canvas = await html2canvas(element as HTMLElement);

        // Usamos toBlob en lugar de toDataURL
        canvas.toBlob(async blob => {
            if (!blob) {
                Toastify({
                    text: 'No hay ninguna cámara seleccionada como principal.',
                    duration: 3000,
                    close: false,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '#F44336',
                    stopOnFocus: true
                }).showToast();

                return;
            }
            flashEffect();
            await addImageToClipBoard(blob);

            Toastify({
                text: '¡Captura realizada con éxito!',
                duration: 3000,
                close: false,
                gravity: 'top',
                position: 'right',
                backgroundColor: '#4CAF50',
                stopOnFocus: true
            }).showToast();
        }, 'image/png'); // Tipo MIME opcional

    } catch (error) {
        console.error('Error al capturar el elemento:', error);
        Toastify({
            text: 'Error al realizar la captura.',
            duration: 3000,
            close: false,
            gravity: 'top',
            position: 'right',
            backgroundColor: '#F44336',
            stopOnFocus: true
        }).showToast();
    }
}


/**
     * Copia una imagen al portapapeles.
     *
     * @param {Blob} image - Imagen a copiar al portapapeles.
     * @returns {Promise<void>} - Promesa que se resuelve cuando la imagen se copia.
     */
async function addImageToClipBoard(image: Blob) {
    const item = new ClipboardItem({ 'image/png': image });

    await navigator.clipboard.write([ item ]);
}

/**
 *  Agrega el efecto de flash al elemento que contiene la imagen objetiva.
 *
 * @param { HTMLElement } target - Objetivo para  agregar el efecto de flash.
 * @returns {void}
 */
function flashEffect(): void {
    const target = document.getElementById('largeVideoWrapper');

    if (!target) {
        console.error(`Elemento con id "${target}" no encontrado`);

        return;
    }

    const overlay: HTMLDivElement = createEffectDiv();

    target.appendChild(overlay);

    overlay.style.opacity = '1';

    setTimeout(() => {
        overlay.style.opacity = '0';
    }, 100);

    console.log('Por lo menos si pasa');

}

/**
 * Crea el elemento para agregar el efecto de captura de imagen.
 *
 * @returns {HTMLDivElement} Div que contiene el div con el efecto en cuestión.
 */
function createEffectDiv(): HTMLDivElement {
    const divAffected = document.createElement('div');

    addFlashEffect(divAffected);

    return divAffected;
}

/**
 * Agrega el efecto de flash a un div.
 *
 * @param {HTMLDivElement} divAffected - Div al que se le agregará el efecto.
 * @returns {void}
*/
function addFlashEffect(divAffected: HTMLDivElement) {
    divAffected.className = 'flash-overlay';
    divAffected.style.position = 'absolute';
    divAffected.style.top = '0';
    divAffected.style.left = '0';
    divAffected.style.width = '100%';
    divAffected.style.height = '100%';
    divAffected.style.background = 'white';
    divAffected.style.opacity = '0';
    divAffected.style.pointerEvents = 'none';
    divAffected.style.transition = 'opacity 0.3s ease-in-out';
    divAffected.style.zIndex = '10';

}
