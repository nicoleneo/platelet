import {
    ADD_TASK_ASSIGNED_RIDER_SUCCESS, GET_TASK_ASSIGNED_RIDERS_SUCCESS,
    REMOVE_TASK_ASSIGNED_RIDER_SUCCESS
} from "./TaskAssigneesActions";
import _ from "lodash"

const initialTaskAssigneesState = {assignees: [], error: null};

export function taskAssignees(state = initialTaskAssigneesState, action) {
    switch (action.type) {
        case ADD_TASK_ASSIGNED_RIDER_SUCCESS:
            return {assignees: {...state.assignees, [action.data.payload.rider.uuid]: action.data.payload.rider},
            error: null};
        case REMOVE_TASK_ASSIGNED_RIDER_SUCCESS:
            return {assignees: _.omit(state.assignees, action.data.payload.user_uuid), error: null}
        case GET_TASK_ASSIGNED_RIDERS_SUCCESS:
            return {assignees: action.data, error: null}
        default:
            return state;
    }
}
