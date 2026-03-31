// FROM: https://github.com/ltouroumov/intcyoacreator/blob/main/src/stores/main.js
// Reference requirements evaluation for the v1 (MeanDelay) format
// Here be Dragons
// =====
// Used everywhere in the application,
const checkRequireds = (state) => (object) => {
  if (typeof object.requireds !== 'undefined') {
    // If the object has requireds that have yet to be selected.
    // Needs to run trough all the requireds
    for (var i = 0; i < object.requireds.length; i++) {
      // Used to see if any of the requirements
      let requiredHasRequireds = false;
      // Checks if the requirement itself has requirements.
      if (typeof object.requireds[i].requireds !== 'undefined') {
        if (this.checkRequireds(object.requireds[i])) {
          requiredHasRequireds = true;
        }
      } else {
        requiredHasRequireds = true;
      }

      if (requiredHasRequireds) {
        // This happens when the object is of the type that will set HAS-requirement
        if (object.requireds[i].required) {
          // Is NOT in the array, is of type 'id'.
          if (
            !state.app.activated.includes(object.requireds[i].reqId) &&
            object.requireds[i].type == 'id'
          ) {
            return false;
            // If the type of required is'Points'
          } else if (object.requireds[i].type == 'points') {
            if (typeof object.requireds[i].operator == 'undefined') {
              // Needs to run trough all the requireds
              for (let o = 0; o < state.app.pointTypes.length; o++) {
                // Is in the array and is of requiredf type 'points'.
                if (object.requireds[i].reqId == state.app.pointTypes[o].id) {
                  // If there is more points than the
                  if (
                    object.requireds[i].reqPoints >
                    state.app.pointTypes[o].startingSum
                  ) {
                    return false;
                  }
                }
              }
            } else {
              /*
          pointReqOperators: [
            { text: "+ More than", value: "1" },
            { text: "+= More or equal", value: "2" },
            { text: "= Equal to", value: "3" },
            { text: "-= Less or equal", value: "4" },
            { text: "- Less han", value: "5" }
          ],
          */
              // Needs to run trough all the requireds
              for (let o = 0; o < state.app.pointTypes.length; o++) {
                // Is in the array and is of requiredf type 'points'.
                if (object.requireds[i].reqId == state.app.pointTypes[o].id) {
                  // If reqPoints is a number and not a string
                  if (!isNaN(parseInt(object.requireds[i].reqPoints))) {
                    // Is there more points than required?
                    if (
                      object.requireds[i].operator == 1 &&
                      object.requireds[i].reqPoints >=
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there more or equal points to required?
                    } else if (
                      object.requireds[i].operator == 2 &&
                      object.requireds[i].reqPoints >
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there THIS many points?
                    } else if (
                      object.requireds[i].operator == 3 &&
                      parseInt(object.requireds[i].reqPoints) !==
                        parseInt(state.app.pointTypes[o].startingSum)
                    ) {
                      return false;
                      // Is there less or equal points to required?
                    } else if (
                      object.requireds[i].operator == 4 &&
                      object.requireds[i].reqPoints <
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there less points than required?
                    } else if (
                      object.requireds[i].operator == 5 &&
                      object.requireds[i].reqPoints <=
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                    }
                  } else {
                    for (let d = 0; d < state.app.pointTypes.length; d++) {
                      if (
                        object.requireds[i].startingSum ==
                        state.app.pointTypes[d].id
                      ) {
                        // Is there more points than required?
                        if (
                          object.requireds[i].operator == 1 &&
                          state.app.pointTypes[o].startingSum >=
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there more or equal points to required?
                        } else if (
                          object.requireds[i].operator == 2 &&
                          state.app.pointTypes[o].startingSum >
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there THIS many points?
                        } else if (
                          object.requireds[i].operator == 3 &&
                          parseInt(state.app.pointTypes[o].startingSum) !==
                            parseInt(state.app.pointTypes[d].startingSum)
                        ) {
                          return false;
                          // Is there less or equal points to required?
                        } else if (
                          object.requireds[i].operator == 4 &&
                          state.app.pointTypes[o].startingSum <
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there less points than required?
                        } else if (
                          object.requireds[i].operator == 5 &&
                          state.app.pointTypes[o].startingSum <=
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                        }
                      }
                    }
                  }
                }
              }
            }
          } else if (object.requireds[i].type == 'or') {
            let check = false;

            for (let o = 0; o < object.requireds[i].orRequired.length; o++) {
              if (
                state.app.activated.includes(
                  object.requireds[i].orRequired[o].req,
                ) &&
                object.requireds[i].orRequired[o].req != ''
              ) {
                check = true;
              }
            }
            // Checks if one of the requireds is selected.
            if (!check) return false;
          } else if (object.requireds[i].type == 'pointCompare') {
            let pointtypeA, pointtypeB;

            for (let o = 0; o < state.app.pointTypes.length; o++) {
              // Is in the array and is of requiredf type 'points'.
              if (object.requireds[i].reqId == state.app.pointTypes[o].id) {
                // If there is more points than the
                pointtypeA = state.app.pointTypes[o].startingSum;
              }
            }

            for (let j = 0; j < state.app.pointTypes.length; j++) {
              // Is in the array and is of requiredf type 'points'.
              if (object.requireds[i].reqId1 == state.app.pointTypes[j].id) {
                // If there is more points than the
                pointtypeB = state.app.pointTypes[j].startingSum;
              }
            }

            /*
          pointReqOperators: [
            { text: "+ More than", value: "1" },
            { text: "+= More or equal", value: "3" },
            { text: "= Equal to", value: "2" },
            { text: "-= Less or equal", value: "4" },
            { text: "- Less han", value: "5" }
          ],
          */

            if (pointtypeA <= pointtypeB && object.requireds[i].operator == 1) {
              return false;
            } else if (
              pointtypeA != pointtypeB &&
              object.requireds[i].operator == 2
            ) {
              return false;
            } else if (
              pointtypeA < pointtypeB &&
              object.requireds[i].operator == 3
            ) {
              return false;
            }

            // Checks if one of the requireds is selected.
          }
        }
        // This happens when the object is of the type that will set NOT-requirement
        if (!object.requireds[i].required) {
          // Is in the array, is of type 'id'.
          if (
            state.app.activated.includes(object.requireds[i].reqId) &&
            object.requireds[i].type == 'id'
          ) {
            return false;
            // If the type of reqyired is'Points'
          } else if (object.requireds[i].type == 'points') {
            if (typeof object.requireds[i].operator == 'undefined') {
              // Needs to run trough all the requireds
              for (let o = 0; o < state.app.pointTypes.length; o++) {
                // Is in the array and is of requiredf type 'points'.
                if (object.requireds[i].reqId == state.app.pointTypes[o].id) {
                  // If there is more points than the
                  if (
                    object.requireds[i].reqPoints <=
                    state.app.pointTypes[o].startingSum
                  ) {
                    return false;
                  }
                }
              }
            } else {
              // Needs to run trough all the requireds
              for (let o = 0; o < state.app.pointTypes.length; o++) {
                // Is in the array and is of requiredf type 'points'.
                if (object.requireds[i].reqId == state.app.pointTypes[o].id) {
                  // If reqPoints is a number and not a string.
                  if (!isNaN(parseInt(object.requireds[i].reqPoints))) {
                    // Is there more points than required?
                    if (
                      object.requireds[i].operator == 1 &&
                      object.requireds[i].reqPoints >=
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there more or equal points to required?
                    } else if (
                      object.requireds[i].operator == 2 &&
                      object.requireds[i].reqPoints >
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there THIS many points?
                    } else if (
                      object.requireds[i].operator == 3 &&
                      parseInt(object.requireds[i].reqPoints) !==
                        parseInt(state.app.pointTypes[o].startingSum)
                    ) {
                      return false;
                      // Is there less or equal points to required?
                    } else if (
                      object.requireds[i].operator == 4 &&
                      object.requireds[i].reqPoints <
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                      // Is there less points than required?
                    } else if (
                      object.requireds[i].operator == 5 &&
                      object.requireds[i].reqPoints <=
                        state.app.pointTypes[o].startingSum
                    ) {
                      return false;
                    }
                  } else {
                    for (let d = 0; d < state.app.pointTypes.length; d++) {
                      if (
                        object.requireds[i].reqPoints ==
                        state.app.pointTypes[d].id
                      ) {
                        // Is there more points than required?
                        if (
                          object.requireds[i].operator == 1 &&
                          state.app.pointTypes[o].startingSum >=
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there more or equal points to required?
                        } else if (
                          object.requireds[i].operator == 2 &&
                          state.app.pointTypes[o].startingSum >
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there THIS many points?
                        } else if (
                          object.requireds[i].operator == 3 &&
                          parseInt(state.app.pointTypes[o].startingSum) !==
                            parseInt(state.app.pointTypes[d].startingSum)
                        ) {
                          return false;
                          // Is there less or equal points to required?
                        } else if (
                          object.requireds[i].operator == 4 &&
                          state.app.pointTypes[o].startingSum <
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                          // Is there less points than required?
                        } else if (
                          object.requireds[i].operator == 5 &&
                          state.app.pointTypes[o].startingSum <=
                            state.app.pointTypes[d].startingSum
                        ) {
                          return false;
                        }
                      }
                    }
                  }
                }
              }
            }
          } else if (object.requireds[i].type == 'or') {
            let check = false;
            for (let o = 0; o < object.requireds[i].orRequired.length; o++) {
              if (
                !state.app.activated.includes(
                  object.requireds[i].orRequired[o].req,
                ) &&
                object.requireds[i].orRequired[o].req != ''
              ) {
                check = true;
              }
            }
            // Checks if one of the requireds is selected.
            if (!check) return false;
          }
        }
      }
    }
  }
  return true;
};
