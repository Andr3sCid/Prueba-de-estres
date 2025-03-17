import { IToolboxButton } from '../types';

import AlertButton from './AlertButton';

const alertButton: IToolboxButton = {
    key: 'alertButton',
    Content: AlertButton,
    group: 10
};

/**
 * A hook that returns the capture button.
 *
 *  @returns {Object}
 */
export function useAlertButton() {
    return alertButton;
}
