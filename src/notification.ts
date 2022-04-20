import { Notification, Event } from 'electron';

export interface NotificationOption{
    body: string;
    onClick?: (event: Event) => void;
}

export function showNotification(options: NotificationOption) {
    const n = new Notification({
        title: "Red Hat OpenShift Local",
        body: options.body
    })
    if (options.onClick) {
        n.on('click',  options.onClick)
    }
    n.show()
}

