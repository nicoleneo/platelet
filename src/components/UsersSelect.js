import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Downshift from "downshift";
import makeStyles from "@mui/styles/makeStyles";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import { useSelector } from "react-redux";

function renderInput(inputProps) {
    const { InputProps, classes, ref, ...other } = inputProps;

    return (
        <TextField
            InputProps={{
                inputRef: ref,
                classes: {
                    root: classes.inputRoot,
                    input: classes.inputInput,
                },
                ...InputProps,
            }}
            {...other}
        />
    );
}

renderInput.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.object.isRequired,
    InputProps: PropTypes.object,
};

function renderSuggestion(suggestionProps) {
    const { suggestion, index, itemProps, highlightedIndex, selectedItem } =
        suggestionProps;
    const isHighlighted = highlightedIndex === index;
    const isSelected = (selectedItem || "").indexOf(suggestion.label) > -1;

    return (
        <MenuItem
            {...itemProps}
            key={suggestion.uuid}
            value={suggestion.uuid}
            selected={isHighlighted}
            component="div"
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
        >
            {suggestion.label}
        </MenuItem>
    );
}

renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.oneOfType([
        PropTypes.oneOf([null]),
        PropTypes.number,
    ]).isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    itemProps: PropTypes.object.isRequired,
    selectedItem: PropTypes.string.isRequired,
    suggestion: PropTypes.shape({
        label: PropTypes.string.isRequired,
    }).isRequired,
};

function getSuggestions(suggestions, value, { showEmpty = false } = {}) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0 && !showEmpty
        ? []
        : suggestions.filter((suggestion) => {
              const keep =
                  count < 5 &&
                  suggestion.label.slice(0, inputLength).toLowerCase() ===
                      inputValue;

              if (keep) {
                  count += 1;
              }

              return keep;
          });
}

function UsersSelect(props) {
    let classes = makeStyles((theme) => ({
        root: {
            flexGrow: 1,
            height: 250,
        },
        container: {
            flexGrow: 1,
            position: "relative",
        },
        paper: {
            position: "absolute",
            zIndex: 1,
            marginTop: theme.spacing(1),
            left: 0,
            right: 0,
        },
        inputRoot: {
            flexWrap: "wrap",
        },
        inputInput: {
            width: "auto",
            flexGrow: 1,
        },
        divider: {
            height: theme.spacing(2),
        },
    }));
    const userSuggestions = useSelector((state) => state.users.users);
    const [filteredUserSuggestions, setFilteredUserSuggestions] = useState([]);
    useEffect(() => {
        let reorderedUsers;
        // put vehicle assigned users at the top
        if (props.vehicleAssignedUsersFirst) {
            const vehicleUsers = Object.values(userSuggestions).filter(
                (item) => item.assigned_vehicles.length !== 0
            );
            const noVehicleUsers = Object.values(userSuggestions).filter(
                (item) => item.assigned_vehicles.length === 0
            );
            reorderedUsers = vehicleUsers.concat(noVehicleUsers);
        } else {
            reorderedUsers = Object.values(userSuggestions);
        }
        // if specific roles are requested, filter out the other roles
        const filterRoles = props.roles
            ? reorderedUsers.filter((user) =>
                  props.roles.some((r) => user.roles.includes(r))
              )
            : reorderedUsers;
        const filterExclude = props.excludeList
            ? filterRoles.filter(
                  (user) => !props.excludeList.includes(user.uuid)
              )
            : filterRoles;
        // check there is a display name and ignore anything in the exclude list
        const mappedUsers = filterExclude.map((user) => ({
            label: user.display_name,
            uuid: user.uuid,
        }));

        setFilteredUserSuggestions(mappedUsers);
    }, [userSuggestions]);

    function onSelect(selectedItem) {
        let result = Object.values(userSuggestions).filter(
            (rider) => rider.display_name === selectedItem
        );
        if (result.length === 1) {
            let rider = {
                name: result[0]["name"],
                display_name: result[0]["display_name"],
                patch: result[0]["patch"],
                vehicle: result[0]["vehicle"],
                uuid: result[0]["uuid"],
                patch_id: result[0]["patch_id"],
                profile_picture_thumbnail_url:
                    result[0]["profile_picture_thumbnail_url"],
            };
            props.onSelect(rider);
        } else {
            props.onSelect(undefined);
        }
    }

    return (
        <div>
            <Downshift id="downshift-options" onSelect={onSelect}>
                {({
                    clearSelection,
                    getInputProps,
                    getItemProps,
                    getLabelProps,
                    getMenuProps,
                    highlightedIndex,
                    inputValue,
                    isOpen,
                    openMenu,
                    selectedItem,
                }) => {
                    const {
                        onSelect,
                        onBlur,
                        onChange,
                        onFocus,
                        ...inputProps
                    } = getInputProps({
                        onChange: (event) => {
                            if (event.target.value === "") {
                                clearSelection();
                            }
                        },
                        onFocus: openMenu,
                        placeholder: "Type to search users",
                    });

                    return (
                        <div className={classes.container}>
                            {renderInput({
                                fullWidth: true,
                                classes,
                                label: props.label ? props.label : "users",
                                InputLabelProps: getLabelProps({
                                    shrink: true,
                                }),
                                InputProps: {
                                    onBlur,
                                    onChange,
                                    onFocus,
                                    onSelect,
                                },
                                inputProps,
                            })}

                            <div {...getMenuProps()}>
                                {isOpen ? (
                                    <Paper className={classes.paper} square>
                                        {getSuggestions(
                                            filteredUserSuggestions,
                                            inputValue,
                                            { showEmpty: true }
                                        ).map((suggestion, index) =>
                                            renderSuggestion({
                                                suggestion,
                                                index,
                                                itemProps: getItemProps({
                                                    item: suggestion.label,
                                                }),
                                                highlightedIndex,
                                                selectedItem,
                                            })
                                        )}
                                    </Paper>
                                ) : null}
                            </div>
                        </div>
                    );
                }}
            </Downshift>
        </div>
    );
}

export default UsersSelect;
