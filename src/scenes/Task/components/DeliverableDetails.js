import React, { useEffect, useRef, useState } from "react";
import DeliverableGridSelect from "../../Deliverables/DeliverableGridSelect";
import PropTypes from "prop-types";
import { Divider, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { dialogCardStyles } from "../styles/DialogCompactStyles";
import { EditModeToggleButton } from "../../../components/EditModeToggleButton";
import { DataStore } from "aws-amplify";
import * as models from "../../../models";
import { convertListDataToObject } from "../../../utilities";
import { displayErrorNotification } from "../../../redux/notifications/NotificationsActions";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { makeStyles } from "@mui/styles";
import { dataStoreReadyStatusSelector } from "../../../redux/Selectors";
import GetError from "../../../ErrorComponents/GetError";
import { deliverableUnits } from "../../../apiConsts";

const useStyles = makeStyles({
    button: { height: 30 },
});

function DeliverableDetails(props) {
    const cardClasses = dialogCardStyles();
    const [collapsed, setCollapsed] = useState(true);
    const [state, setState] = useState({});
    const [isPosting, setIsPosting] = useState(false);
    const deliverablesObserver = useRef({ unsubscribe: () => {} });
    const [isFetching, setIsFetching] = useState(true);
    const [errorState, setErrorState] = useState(false);
    const dispatch = useDispatch();
    const dataStoreReadyStatus = useSelector(dataStoreReadyStatusSelector);
    const updateDeliverableRef = useRef(null);
    const errorMessage = "Sorry, an error occurred";

    async function getDeliverables() {
        setIsFetching(true);
        if (!dataStoreReadyStatus) {
            return;
        }
        try {
            const deliverables = (
                await DataStore.query(models.Deliverable)
            ).filter((d) => d.task && d.task.id === props.taskId);
            setState(convertListDataToObject(deliverables));

            if (deliverables) {
                deliverablesObserver.current.unsubscribe();
                deliverablesObserver.current = DataStore.observe(
                    models.Deliverable,
                    (t) => t.taskDeliverablesId("eq", props.taskId)
                ).subscribe((observeResult) => {
                    const deliverable = observeResult.element;
                    if (observeResult.opType === "INSERT") {
                        setState((prevState) => ({
                            ...prevState,
                            [deliverable.id]: deliverable,
                        }));
                    } else if (observeResult.opType === "UPDATE") {
                        setState((prevState) => ({
                            ...prevState,
                            [deliverable.id]: {
                                ...prevState[deliverable.id],
                                ...deliverable,
                            },
                        }));
                    }
                    if (observeResult.opType === "DELETE") {
                        setState((prevState) =>
                            _.omit(prevState, deliverable.id)
                        );
                    }
                });
                setIsFetching(false);
            }
        } catch (error) {
            console.error(error);
            setErrorState(true);
        }
    }
    useEffect(() => {
        getDeliverables();
    }, [props.taskId, dataStoreReadyStatus]);

    // stop observer when component unmounts
    useEffect(() => () => deliverablesObserver.current.unsubscribe(), []);

    async function updateDeliverable(value) {
        // receive DeliverableType from selector component
        // check if one of this DeliverableType has already been saved
        try {
            const existing = Object.values(state).find(
                (d) => d.deliverableType && d.deliverableType.id === value.id
            );
            if (existing) {
                const existingDeliverable = await DataStore.query(
                    models.Deliverable,
                    existing.id
                );
                if (existingDeliverable) {
                    const updateDeliverable = await DataStore.save(
                        models.Deliverable.copyOf(
                            existingDeliverable,
                            (updated) => {
                                for (const [key, v] of Object.entries(value)) {
                                    updated[key] = v;
                                }
                            }
                        )
                    );
                    setState((prevState) => ({
                        ...prevState,
                        [existing.id]: updateDeliverable,
                    }));
                }
            } else {
                setIsPosting(true);
                const { id, ...rest } = value;
                const deliverableType = await DataStore.query(
                    models.DeliverableType,
                    id
                );
                if (!deliverableType)
                    throw new Error("Deliverable type does not exist");
                const existingTask = await DataStore.query(
                    models.Task,
                    props.taskId
                );
                if (!existingTask) throw new Error("Task does not exist");
                const newDeliverable = await DataStore.save(
                    new models.Deliverable({
                        task: existingTask,
                        deliverableType,
                        ...rest,
                    })
                );
                // add it to the tracking reference
                setState((prevState) => ({
                    ...prevState,
                    [newDeliverable.id]: newDeliverable,
                }));
            }
            setIsPosting(false);
        } catch (error) {
            console.log(error);
            dispatch(displayErrorNotification(errorMessage));
            setIsPosting(false);
        }
    }
    // if this isn't a ref then state is old while using debounce
    updateDeliverableRef.current = updateDeliverable;

    async function deleteDeliverable(deliverableTypeId) {
        // receive DeliverableTypeId only from selector component
        // check if one of this DeliverableType has already been saved so we can delete it
        setIsPosting(true);
        const existing = Object.values(state).find(
            (d) => d.deliverableType.id === deliverableTypeId
        );
        try {
            if (existing) {
                const existingDeliverable = await DataStore.query(
                    models.Deliverable,
                    existing.id
                );
                if (existingDeliverable)
                    await DataStore.delete(existingDeliverable);
                // remove it from the tracking reference
                setState((prevState) => _.omit(prevState, existing.id));
            }
            setIsPosting(false);
        } catch (error) {
            setIsPosting(false);
            dispatch(displayErrorNotification(errorMessage));
        }
    }

    const contents = collapsed ? (
        state && Object.values(state).length === 0 ? (
            <Typography>No items.</Typography>
        ) : (
            Object.values(state)
                .sort(
                    (a, b) => parseInt(a.orderInGrid) - parseInt(b.orderInGrid)
                )
                .map((deliverable) => {
                    let countString = "";
                    if (deliverable.unit === deliverableUnits.none) {
                        countString = `x ${deliverable.count}`;
                    } else {
                        countString = `${deliverable.count} x ${deliverable.unit}`;
                    }
                    return (
                        <Stack
                            key={deliverable.id}
                            direction={"row"}
                            justifyContent={"space-between"}
                        >
                            <Typography>
                                {deliverable &&
                                deliverable.deliverableType &&
                                deliverable.deliverableType.label
                                    ? deliverable.deliverableType.label
                                    : "Unknown"}
                            </Typography>
                            <Typography>{countString}</Typography>
                        </Stack>
                    );
                })
        )
    ) : (
        <DeliverableGridSelect
            deliverables={Object.values(state)}
            disabled={isPosting}
            taskUUID={props.taskId}
            onChange={(value) => {
                //this has to be inline or else state is old}
                updateDeliverableRef.current(value);
            }}
            onDelete={deleteDeliverable}
        />
    );

    const classes = useStyles();
    if (errorState) {
        return <GetError />;
    } else {
        return (
            <Paper className={cardClasses.root}>
                <Stack
                    direction={"column"}
                    justifyContent={"center"}
                    spacing={1}
                >
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                    >
                        <Typography variant={"h6"}>Inventory</Typography>
                        <EditModeToggleButton
                            className={classes.button}
                            value={!collapsed}
                            onChange={() =>
                                setCollapsed((prevState) => !prevState)
                            }
                        />
                    </Stack>
                    <Divider />
                    {isFetching ? (
                        <Stack spacing={1}>
                            <Skeleton
                                variant={"rectangular"}
                                height={30}
                                width={"100%"}
                            />
                            <Skeleton
                                variant={"rectangular"}
                                height={30}
                                width={"100%"}
                            />
                        </Stack>
                    ) : (
                        contents
                    )}
                </Stack>
            </Paper>
        );
    }
}

DeliverableDetails.propTypes = {
    deliverables: PropTypes.arrayOf(PropTypes.object),
    taskUUID: PropTypes.string,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
};

DeliverableDetails.defaultProps = {
    deliverables: [],
    taskUUID: "",
    onChange: () => {},
    onDelete: () => {},
};

export default DeliverableDetails;
