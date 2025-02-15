import React from "react";
import "../index.css";
import { Route, Switch, useLocation } from "react-router-dom";
import Dashboard from "../scenes/Dashboard/Dashboard";
import VehicleList from "../scenes/VehiclesList";
import UsersList from "../scenes/UsersList";
import UserDetail from "../scenes/UserDetail/UserDetail";
import VehicleDetail from "../scenes/VehicleDetail/VehicleDetail";
import NotFound from "../ErrorComponents/NotFound";
import LocationsList from "../scenes/LocationsList";
import LocationDetail from "../scenes/LocationDetail/LocationDetail";
import StatisticsDashboard from "../scenes/Statistics/StatisticsDashboard";
import { useDispatch } from "react-redux";
import { setMenuIndex } from "../redux/Actions";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import AdminAddUser from "../scenes/AdminControl/Components/AdminAddUser";
import AdminAddVehicle from "../scenes/AdminControl/Components/AdminAddVehicle";
import AdminAddLocation from "../scenes/AdminControl/Components/AdminAddLocation";
import AdminAddDeliverableType from "../scenes/AdminControl/Components/AdminAddDeliverableType";
import AdminAddRiderResponsibility from "../scenes/AdminControl/Components/AdminAddRiderResponsibility";
import TaskDialogCompact from "../scenes/Task/TaskDialogCompact";

function MainWindowContainer(props) {
    const styles = makeStyles((theme) => ({
        root: {
            paddingTop: 10,
            paddingBottom: 10,
            [theme.breakpoints.down("md")]: {
                paddingTop: 5,
            },
        },
    }));
    const classes = styles();
    return (
        <Container maxWidth={"lg"} disableGutters className={classes.root}>
            {props.children}
        </Container>
    );
}

export default function MainWindow(_props) {
    let location = useLocation();
    const dispatch = useDispatch();
    let background = location.state && location.state.background;

    // whenever returning an item, set the MenuIndex to update the mobile view drawer menu
    return (
        <MainWindowContainer>
            <main>
                <Switch location={background || location}>
                    <Route
                        exact
                        path="/"
                        render={(props) => {
                            dispatch(setMenuIndex("dashboard"));
                            return <Dashboard {...props} />;
                        }}
                    />
                    <Route
                        path="/vehicles"
                        render={(props) => {
                            dispatch(setMenuIndex("vehicles"));
                            return <VehicleList {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/vehicle/:vehicle_uuid_b62"
                        render={(props) => {
                            dispatch(setMenuIndex("vehicles"));
                            return <VehicleDetail {...props} />;
                        }}
                    />
                    <Route
                        path="/locations"
                        render={(props) => {
                            dispatch(setMenuIndex("locations"));
                            return <LocationsList {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/location/:location_uuid_b62"
                        render={(props) => {
                            dispatch(setMenuIndex("locations"));
                            return <LocationDetail {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/users"
                        render={(props) => {
                            dispatch(setMenuIndex("users"));
                            return <UsersList {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/admin/add-user"
                        render={(props) => {
                            dispatch(setMenuIndex("admin"));
                            return <AdminAddUser {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/admin/add-vehicle"
                        render={(props) => {
                            dispatch(setMenuIndex("admin"));
                            return <AdminAddVehicle {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/admin/add-responsibility"
                        render={(props) => {
                            dispatch(setMenuIndex("admin"));
                            return <AdminAddRiderResponsibility {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/admin/add-location"
                        render={(props) => {
                            dispatch(setMenuIndex("admin"));
                            return <AdminAddLocation {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/admin/add-deliverable"
                        render={(props) => {
                            dispatch(setMenuIndex("admin"));
                            return <AdminAddDeliverableType {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/user/:user_uuid_b62"
                        render={(props) => {
                            dispatch(setMenuIndex("users"));
                            return <UserDetail {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/statistics"
                        render={(props) => {
                            dispatch(setMenuIndex("statistics"));
                            return <StatisticsDashboard {...props} />;
                        }}
                    />
                    <Route
                        exact
                        path="/task/:task_uuid_b62"
                        render={(props) => {
                            dispatch(setMenuIndex("dashboard"));
                            return <TaskDialogCompact {...props} />;
                        }}
                    />
                    <Route component={NotFound} />
                </Switch>
                {background && (
                    <Route
                        path="/task/:task_uuid_b62"
                        children={<TaskDialogCompact />}
                    />
                )}
            </main>
        </MainWindowContainer>
    );
}
