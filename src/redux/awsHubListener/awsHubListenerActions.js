export const initialiseAwsDataStoreListenerAction =
    "INITIALISE_AWS_DATASTORE_LISTENER";
export const setNetworkStatusAction = "AWS_DATASTORE_SET_NETWORK_STATUS";
export const setReadyStatusAction = "AWS_DATASTORE_SET_READY_STATUS";

export function initialiseAwsDataStoreListener() {
    return { type: initialiseAwsDataStoreListenerAction };
}

export function setNetworkStatus(data) {
    return { type: setNetworkStatusAction, data };
}

export function setReadyStatus(data) {
    return { type: setReadyStatusAction, data };
}
