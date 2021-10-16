import _ from "lodash";

export function filterTasks(tasks, search) {
    if (!search) {
        return null;
    } else {
        debugger;
        const searchTerms = search.toLowerCase().split(" ").filter(Boolean);
        //const searchTerm = search.toLowerCase();
        const results = [];
        for (const searchTerm of searchTerms) {
            debugger;
            let filteredResult = [];
            for (const groupList of Object.values(tasks)) {
                debugger;
                const filtered = Object.values(groupList)
                    .filter((task) => {
                        if (
                            task.assigned_riders_display_string
                                ? task.assigned_riders_display_string
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.responsibility
                                ? task.patch.toLowerCase().includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.reference
                                ? task.reference
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.priority
                                ? task.priority
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.dropOffLocation && task.dropOffLocation.line1
                                ? task.dropOffLocation.line1
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.pickUpLocation && task.pickUpLocation.line1
                                ? task.pickUpLocation.line1
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.pickUpLocation && task.pickUpLocation.ward
                                ? task.pickUpLocation.ward
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        } else if (
                            task.dropOffLocation && task.dropOffLocation.ward
                                ? task.dropOffLocation.ward
                                      .toLowerCase()
                                      .includes(searchTerm)
                                : false
                        ) {
                            return true;
                        }
                        return false;
                    })
                    .map((t) => t.id);
                if (filtered.length !== 0)
                    filteredResult = [...filteredResult, ...filtered];
            }
            results.push(filteredResult);
        }
        const result = _.intersection(...results);
        return result;
    }
}
