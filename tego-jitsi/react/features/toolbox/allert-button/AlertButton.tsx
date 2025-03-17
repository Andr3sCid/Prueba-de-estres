
import { IconAlertButton } from '../../base/icons/svg';
import AbstractButton, { IProps as AbstractButtonProps } from '../../base/toolbox/components/AbstractButton';

type IProps = AbstractButtonProps;

/**
 * Button for take capture of the current video.
 */
class AlertButton extends AbstractButton<IProps> {
    icon = IconAlertButton;
    label = '¿Alerta?';
    tooltip = 'Alerta';

    /**
     * Handles button click event.
     *
     * @private
     * @returns {void}
     * */
    _handleClick(): void {
        alert('Demostración');
    }
}

export default AlertButton;
