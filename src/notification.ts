import { Notification, Event } from 'electron';

export interface NotificationOption{
    body: string;
    onClick?: (event: Event) => void;
}

export function showNotification(options: NotificationOption) {
    const n = new Notification({
        title: "CodeReady Containers",
        body: options.body
    })
    if (options.onClick) {
        n.on('click',  options.onClick)
    }
    n.show()
}

