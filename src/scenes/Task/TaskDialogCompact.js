import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import LocationDetailAndSelector from "./components/LocationDetailAndSelector";
import StatusBar from "./components/StatusBar";
import Dialog from "@material-ui/core/Dialog";
import {useHistory} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {decodeUUID, determineTaskType} from "../../utilities";
import FormSkeleton from "../../SharedLoadingSkeletons/FormSkeleton";
import {getTaskRequest} from "../../redux/activeTask/ActiveTaskActions"
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
    addNewDropoffLocationAndSetTaskRequest,
    addNewPickupLocationAndSetTaskRequest,
    setTaskDropoffDestinationRequest,
    setTaskPickupDestinationRequest, updateDropoffLocationAndUpdateTaskRequest,
    updatePickupLocationAndUpdateTaskRequest,
} from "../../redux/taskDestinations/TaskDestinationsActions";
import TaskDetailsPanel from "./components/TaskDetailsPanel";
import CommentsSection from "../Comments/CommentsSection";
import {PaddedPaper, showHide} from "../../styles/common";
import TaskModalTimePicker from "./components/TaskModalTimePicker";
import LabelItemPair from "../../components/LabelItemPair";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import TimePicker from "./components/TimePicker";
import {updateTaskDropoffTimeRequest, updateTaskPickupTimeRequest} from "../../redux/tasks/TasksActions";
import {createPostingSelector} from "../../redux/selectors";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles({
    root: {
        padding: "20px",
    },
    statusBar: {
        paddingBottom: 8
    }
})

function TaskDialogCompact(props) {
    const mobileView = useSelector(state => state.mobileView);
    const history = useHistory();
    const dispatch = useDispatch();
    const {show, hide} = showHide();
    const task = useSelector(state => state.task.task);
    const savedLocations = useSelector(state => state.availableLocations.locations);
    const [pickupPresetName, setPickupPresetName] = useState("");
    const [dropoffPresetName, setDropoffPresetName] = useState("");
    const classes = useStyles();
    const [taskStatus, setTaskStatus] = useState("No status")

    const pickupPostingSelector = createPostingSelector(["UPDATE_TASK_PICKUP_TIME"]);
    const isPostingPickupTime = useSelector(state => pickupPostingSelector(state));
    const dropoffPostingSelector = createPostingSelector(["UPDATE_TASK_DROPOFF_TIME"]);
    const isPostingDropoffTime = useSelector(state => dropoffPostingSelector(state));

    let taskUUID = null;

    if (props.match) {
        taskUUID = decodeUUID(props.match.params.task_uuid_b62) // everything before the query string
    }

    if (props.match) {
        taskUUID = decodeUUID(props.match.params.task_uuid_b62)
    } else {
        taskUUID = task.uuid;
    }

    function componentDidMount() {
        dispatch(getTaskRequest(taskUUID))
    }

    useEffect(componentDidMount, [props.location.key]);

    function setStatus() {
        const result = Object.keys(determineTaskType({task}))
        if (result) {
            if (result.includes("tasksNew")) {
                setTaskStatus("New")
            } else if (result.includes("tasksActive")) {
                setTaskStatus("Active")
            } else if (result.includes("tasksPickedUp")) {
                setTaskStatus("Picked up")
            } else if (result.includes("tasksDelivered")) {
                setTaskStatus("Delivered")
            }
        }
    }

    useEffect(setStatus, [task])

    function onChangeTimePickedUp(value) {
        if (value || value === null)
            dispatch(updateTaskPickupTimeRequest(task.uuid, {time_picked_up: value}))
    }
    function onChangeTimeDropoff(value) {
        if (value || value === null)
            dispatch(updateTaskDropoffTimeRequest(task.uuid, {time_dropped_off: value}))
    }

    function onChangePickupLocation(value) {
        if (task.pickup_location) {
            dispatch(updatePickupLocationAndUpdateTaskRequest(task.uuid, {address: value}))
        } else {
            dispatch(addNewPickupLocationAndSetTaskRequest(task.uuid, {address: value}))
        }
    }

    function onChangeDropoffLocation(value) {
        if (task.dropoff_location) {
            dispatch(updateDropoffLocationAndUpdateTaskRequest(task.uuid, {address: value}))
        } else {
            dispatch(addNewDropoffLocationAndSetTaskRequest(task.uuid, {address: value}))
        }
    }

    function onSelectPickupFromSaved(location) {
        const locationUUID = location.uuid;
        if (locationUUID && savedLocations) {
            const result = savedLocations[locationUUID];
            if (result) {
                setPickupPresetName(result.name)
            }
        }
        if (locationUUID) {
            dispatch(setTaskPickupDestinationRequest(taskUUID, locationUUID))
        }
    }

    function onSelectDropoffFromSaved(location) {
        const locationUUID = location.uuid;
        if (locationUUID && savedLocations) {
            const result = savedLocations[locationUUID];
            if (result) {
                setDropoffPresetName(result.name)
            }
        }
        if (locationUUID) {
            dispatch(setTaskDropoffDestinationRequest(taskUUID, locationUUID))
        }
    }

    let handleClose = e => {
        e.stopPropagation();
        if (props.location.state)
            history.goBack();
        else
            history.push("/");

    };
    const statusBar = !task ? <></> :
        <StatusBar
            relayNext={task.relay_next ? task.relay_next.uuid : null}
            relayPrevious={task.relay_previous ? task.relay_previous.uuid : null}
            handleClose={handleClose}
            assignedRiders={task.assigned_riders}
            assignedCoordinators={task.assigned_coordinators}
            assignedCoordinatorsDisplayString={task.assigned_coordinators_display_string}
            assignedRidersDisplayString={task.assigned_riders_display_string}
            taskUUID={taskUUID}
            status={taskStatus}
        />

    if (!task) {
        return <Dialog open={true}><FormSkeleton/></Dialog>
    } else {
        return (
            <Dialog
                disableEscapeKeyDown
                fullScreen={mobileView}
                maxWidth={"xl"}
                fullWidth={true}
                open={true}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        backgroundColor: "rgb(240, 240, 240)",
                        boxShadow: 'none',
                    },
                }}
                aria-labelledby="form-dialog-title">
                <Grid container spacing={0} direction={"column"}>
                    <Grid item className={classes.statusBar}>
                {statusBar}
                    </Grid>
                    <Grid item>
                <Divider/>
                    </Grid>
                </Grid>
                <div className={classes.root}>
                    <Grid container direction={"column"} alignItems={"flex-start"} justify={"space-between"}>
                        <Grid item>
                            <Grid container direction={"row"} alignItems={"flex-start"} justify={"space-between"}
                                  spacing={3}>
                                <Grid item>
                                    <Grid container direction={"row"} alignItems={"center"} spacing={1} justify={"flex-start"}>
                                        <Grid item>
                                            <PaddedPaper>
                                                <Grid container direction={"column"} spacing={3}>
                                                    <Grid item>
                                                        <LocationDetailAndSelector
                                                            onSelectPreset={onSelectPickupFromSaved}
                                                            onChange={onChangePickupLocation}
                                                            location={task.pickup_location}
                                                            displayPresets={true}
                                                            label={"Pick up"}/>
                                                    </Grid>
                                                    <LabelItemPair label={"Time picked up"}>
                                                        <TimePicker
                                                            onChange={onChangeTimePickedUp}
                                                            disabled={isPostingPickupTime}
                                                            label={"Mark picked up"}
                                                            time={task.time_picked_up}/>
                                                    </LabelItemPair>
                                                </Grid>
                                            </PaddedPaper>
                                        </Grid>
                                        <Grid item>
                                            <ArrowForwardIcon className={mobileView ? hide : show}/>
                                            <ArrowDownwardIcon className={mobileView ? show : hide}/>
                                        </Grid>
                                        <Grid item>
                                            <PaddedPaper>
                                                <Grid container direction={"column"} spacing={3}>
                                                    <Grid item>
                                                        <LocationDetailAndSelector
                                                            onSelectPreset={onSelectDropoffFromSaved}
                                                            onChange={onChangeDropoffLocation}
                                                            location={task.dropoff_location}
                                                            displayPresets={true}
                                                            label={"Delivery"}/>
                                                    </Grid>
                                                    <LabelItemPair label={"Time delivered"}>
                                                        <TimePicker
                                                            onChange={onChangeTimeDropoff}
                                                            disabled={isPostingDropoffTime}
                                                            label={"Mark dropped off"}
                                                            time={task.time_dropped_off}/>
                                                    </LabelItemPair>
                                                </Grid>
                                            </PaddedPaper>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <PaddedPaper>
                                        <TaskDetailsPanel/>
                                    </PaddedPaper>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <CommentsSection parentUUID={taskUUID}/>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>
        )
    }

}

export default TaskDialogCompact;
