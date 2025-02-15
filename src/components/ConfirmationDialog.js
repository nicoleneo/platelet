import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import { Stack } from "@mui/material";

function ConfirmationDialog(props) {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {props.dialogTitle}
            </DialogTitle>
            <DialogContent>{props.children}</DialogContent>
            <DialogActions>
                <Stack
                    direction="row"
                    sx={{ width: "100%" }}
                    justifyContent="space-between"
                >
                    {props.hideCancel ? (
                        <div></div>
                    ) : (
                        <Button
                            onClick={() => {
                                props.onCancel();
                                props.onClose();
                            }}
                            autoFocus
                        >
                            Cancel
                        </Button>
                    )}{" "}
                    {!props.hideOk && (
                        <Button
                            onClick={() => {
                                props.onConfirmation();
                                props.onClose();
                            }}
                            autoFocus
                        >
                            OK
                        </Button>
                    )}
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

ConfirmationDialog.propTypes = {
    open: PropTypes.bool,
    onConfirmation: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    dialogTitle: PropTypes.string,
    hideCancel: PropTypes.bool,
    hideOk: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
    open: false,
    dialogTitle: "",
    onConfirmation: () => {},
    onCancel: () => {},
    onClose: () => {},
    hideCancel: false,
    hideOk: false,
};

export default ConfirmationDialog;
