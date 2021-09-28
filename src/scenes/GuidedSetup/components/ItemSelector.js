import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {
    addDeliverableRequest, deleteDeliverableRequest,
    getDeliverablesRequest, updateDeliverableRequest,
} from "../../../redux/deliverables/DeliverablesActions";
import {useDispatch, useSelector} from "react-redux"
import {createDeletingSelector, createLoadingSelector, createPostingSelector} from "../../../redux/LoadingSelectors";
import DeliverableCard from "../../../scenes/Deliverables/components/DeliverableCard";
import DeliverablesSkeleton from "../../../scenes/Deliverables/components/DeliverablesSkeleton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import styled from "@material-ui/core/styles/styled";
import Box from "@material-ui/core/Box";
import {Paper} from "@material-ui/core";
import {dialogCardStyles} from "../../Task/styles/DialogCompactStyles";
import IncreaseDecreaseCounter from "../../../components/IncreaseDecreaseCounter";
import {v4 as uuidv4} from 'uuid';
import {SmallCirclePlusButton} from "../../../components/Buttons";
import Typography from "@material-ui/core/Typography";
import {showHide} from "../../../styles/common";
import Link from "@material-ui/core/Link";


const useStyles = makeStyles({
    root: {
        width: "100%",
        maxWidth: 350
    },
    truncate: {
        maxHeight: 410
    }
})

const DeliverableBox = styled(Box)({
    backgroundColor: "rgba(180, 180, 180, 0.1)",
    paddingLeft: 10
});

const EditableDeliverable = props => {
    const deliverable = props.deliverable;
    const postingSelector = createPostingSelector(["ADD_DELIVERABLE"]);
    const isPosting = useSelector(state => postingSelector(state));
    const deletingSelector = createDeletingSelector(["DELETE_DELIVERABLE"]);
    const isDeleting = useSelector(state => deletingSelector(state));
    const dispatch = useDispatch();

    const addCounter = deliverable.count > 0 ?
        <IncreaseDecreaseCounter
            value={deliverable.count || 0}
            disabled={isDeleting}
            onChange={(count) => props.onChange(deliverable, count)}
            onDelete={() => {
                if (deliverable.uuid) {
                    dispatch(deleteDeliverableRequest(deliverable.uuid))
                }
            }}
        /> :
        <SmallCirclePlusButton
            onClick={() => props.onChange(deliverable, 1)}
            disabled={isPosting}
        />

    return (
        <DeliverableBox>
            <DeliverableCard
                compact
                label={deliverable.label || deliverable.type}
                typeID={deliverable.id || deliverable.type_id}
            >
                {addCounter}
            </DeliverableCard>
        </DeliverableBox>
    )
}

export default function ItemSelector(props) {
    const dispatch = useDispatch();
    const availableDeliverables = useSelector(state => state.availableDeliverables.deliverables);
    const deliverablesSorted = useSelector(state => state.deliverablesSorted);
    const loadingSelector = createLoadingSelector(["GET_DELIVERABLES"]);
    const [truncated, setTruncated] = useState(false);
    const isFetching = useSelector(state => loadingSelector(state));
    const classes = useStyles();
    const cardClasses = dialogCardStyles();

    const {show, hide} = useStyles(showHide);

    let emptyDeliverable = {
        task_uuid: props.taskUUID,
        uuid: uuidv4()
    };

    const onAddNewDeliverable = (deliverable) => {
        let newDeliverable = {...emptyDeliverable, count: 1, type_id: deliverable.id, type: deliverable.label};
        dispatch(addDeliverableRequest(newDeliverable));
    };

    const onChange = (deliverable, count) => {
        if (deliverable.uuid) {
            dispatch(updateDeliverableRequest(deliverable.uuid, {count}));
        } else if (deliverable.id) {
            onAddNewDeliverable(deliverable);
        }
    }

    React.useEffect(() => {
        if (Object.values(availableDeliverables).length > 0)
            dispatch(getDeliverablesRequest(props.taskUUID));
    }, [availableDeliverables, props.taskUUID]);


    useEffect(() => setTruncated(availableDeliverables.length > 6), [availableDeliverables]);


    if (isFetching) {
        return <DeliverablesSkeleton/>
    } else {
        let count = 0;
        return (
            <Paper className={
                cardClasses.root
            }>
                <Grid container justify={"space-between"} direction={"column"}>
                    {Object.keys(deliverablesSorted).map(key => {
                        return (
                            <Grid key={key} item>
                                <Grid container
                                      spacing={1}
                                      className={classes.root}
                                      direction={"column"}
                                >
                                    {deliverablesSorted[key].map(deliverable => {
                                        count++;
                                        return (
                                            <Grid item key={deliverable.id || deliverable.uuid}>
                                                {count > 5 && truncated ?
                                                    <></> :
                                                    <EditableDeliverable
                                                        onChange={onChange}
                                                        deliverable={deliverable}/>
                                                }
                                            </Grid>
                                        )
                                    })
                                    }
                                </Grid>
                            </Grid>
                        )
                    })}
                    <Grid item>
                        <Link href="#" onClick={e => {
                            setTruncated(!truncated)
                            e.preventDefault();
                        }} color="inherit">
                            {truncated ? "More..." : "Less..."}
                        </Link>
                        <Typography>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}
