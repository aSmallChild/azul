export default function emitter(obj) {
    const listeners = new Map();
    obj.emit = (eventName, eventData) => {
        callListeners(listeners.get(eventName), eventName, eventData);
        // callListeners(listeners.get('*'), eventName, { eventName, eventData });
    };
    obj.on = (eventName, handler) => {
        if (listeners.get(eventName)?.push(handler)) {
            return;
        }
        listeners.set(eventName, [handler]);
    };
    return obj;
}

function callListeners(listeners, eventName, eventData) {
    listeners?.forEach(callback => {
        try {
            callback(eventData);
        }
        catch (e) {
            console.error('Event callback error', eventName, e, callback, eventData);
        }
    });
}
