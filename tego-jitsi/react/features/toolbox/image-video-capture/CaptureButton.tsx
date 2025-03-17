
import { IconCaptureImage } from '../../base/icons/svg';

import AbstractButton, { IProps as AbstractButtonProps } from './../../base/toolbox/components/AbstractButton';
import { onScreenShoot } from './function';


type IProps = AbstractButtonProps;

/**
 * Button for take capture of the current video.
 */
class CaptureButton extends AbstractButton<IProps> {
    icon = IconCaptureImage;
    label = 'Capturar Imagen';
    tooltip = 'Tomar captura de imagen a la cámara';

    /**
     * Handles button click event.
     *
     * @private
     * @returns {void}
     * */
    _handleClick(): void {
        onScreenShoot();
    }
}

export default CaptureButton;
