import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  runTransaction,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import EditTask from "./EditTask";
import { db, auth } from "../services/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const Tasks = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [createTask, setCreateTask] = useState("");
  const [checked, setChecked] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // New state for modal visibility
  const modalRef = useRef(null);
  const updateTasksState = (newTasks) => {
    setTasks(newTasks);
    setChecked(newTasks);
  };

  const collectionRef = user
    ? collection(db, "users", user.uid, "tasks")
    : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [shouldFetchTasks, setShouldFetchTasks] = useState(true);

  const fetchTasks = async () => {
    try {
      if (user && collectionRef) {
        const q = query(collectionRef, orderBy("timestamp"));
        const tasksSnapshot = await getDocs(q);

        const tasksData = tasksSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTasks(tasksData);
        setChecked(tasksData);
        setShouldFetchTasks(false);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (shouldFetchTasks) {
      fetchTasks();
    }
  }, [shouldFetchTasks, user, collectionRef]);

  const submitTask = async (e) => {
    e.preventDefault();
  
    try {
      if (user && collectionRef) {
        setSubmitting(true);
        const userTasksRef = collection(db, "users", user.uid, "tasks");
        const taskData = {
          task: createTask,
          isChecked: false,
          timestamp: serverTimestamp(),
        };
  
        await setDoc(doc(userTasksRef), taskData);
        setCreateTask("");
  
        // Fetch the updated tasks again
       const updatedTasksSnapshot = await getDocs(collectionRef);
      const updatedTasksData = updatedTasksSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
           // Use the callback to update tasks and checked state
      updateTasksState(updatedTasksData);
  
        // Manually close the modal using the ref
        modalRef.current.style.display = "none";
        document.body.classList.remove("modal-open"); // Remove modal-open class from body
  
        const modalBackdrop = document.querySelector(".modal-backdrop");
        modalBackdrop.parentNode.removeChild(modalBackdrop); // Remove modal backdrop
  
      } else {
        console.log("User not authenticated or collectionRef is null");
      }
    } catch (err) {
      console.error("Error submitting task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Add a useEffect hook to handle modal state change
  useEffect(() => {
    if (!submitting) {
      setModalOpen(false);
    }
  }, [submitting]);

  // Delete Handler
  const deleteTask = async (id) => {
    try {
      if (collectionRef) {
        const confirmed = window.confirm("Are you sure you want to delete this task?");
        if (confirmed) {
          const documentRef = doc(collectionRef, id);
          await deleteDoc(documentRef);
  
          // Remove the deleted task from the state
          const newTasks = tasks.filter((task) => task.id !== id);
          updateTasksState(newTasks);
        }
      } else {
        console.error("Collection reference is null");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };
  
  // Checkbox Handler
  const checkHandler = async (event, task) => {
    setChecked((state) => {
      const indexToUpdate = state.findIndex(
        (checkBox) => checkBox.id.toString() === event.target.name
      );
      let newState = state.slice();
      newState.splice(indexToUpdate, 1, {
        ...state[indexToUpdate],
        isChecked: !state[indexToUpdate].isChecked,
      });
      setTasks(newState);
      return newState;
    });

    // Persisting the checked value
    try {
      const docRef = doc(collectionRef, event.target.name);
      await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(docRef);
        if (!taskDoc.exists()) {
          throw "Document does not exist!";
        }
        const newValue = !taskDoc.data().isChecked;
        transaction.update(docRef, { isChecked: newValue });
      });
      console.log("Transaction successfully committed!");
    } catch (error) {
      console.log("Transaction failed: ", error);
    }
  };

  const navigate = useNavigate();

  const handleClick = () => {
    signOut(auth).then((val) => {
      console.log(val, "val");
      navigate("/");
    });
  };

  console.log("tasks", tasks);

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <button onClick={handleClick}>Sign Out</button>
            <div className="card card-white">
              <div className="card-body">
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#addModal"
                  type="button"
                  className="btn btn-info"
                >
                  Add Task
                </button>

                {user ? (
                  tasks.length > 0 ? (
                    tasks.map(({ task, isChecked, id, timestamp }) => (
                      <div className="todo-list" key={id}>
                        <div className="todo-item">
                          <hr />
                          <span
                            className={`${isChecked === true ? "done" : ""}`}
                          >
                            <div className="checker">
                              <span className="">
                                <input
                                  type="checkbox"
                                  defaultChecked={isChecked}
                                  onChange={(event) =>
                                    checkHandler(event, task)
                                  }
                                  name={id}
                                />
                              </span>
                            </div>
                            &nbsp;{task}
                            <br />
                            <i>
                              {timestamp && timestamp.seconds
                                ? new Date(
                                    timestamp.seconds * 1000
                                  ).toLocaleString()
                                : "Timestamp not available"}
                            </i>
                          </span>
                          <span className=" float-end mx-3">
                            <EditTask task={task} id={id} />
                          </span>
                          <button
                            type="button"
                            className="btn btn-danger float-end"
                            onClick={() => deleteTask(id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No task found</p>
                  )
                ) : (
                  <p>Authenticate First</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`modal fade${modalOpen ? " show" : ""}`}
        id="addModal"
        tabIndex="-1"
        aria-labelledby="addModalLabel"
        aria-hidden={!modalOpen}
        style={{ display: modalOpen ? "block" : "none" }}
        ref={modalRef}
      >
        <div className="modal-dialog">
          <form onSubmit={submitTask} id="createTaskInput">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addModalLabel">
                  Add Task
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a Task"
                  onChange={(e) => setCreateTask(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                {/* <button className="btn btn-secondary">Close</button> */}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!collectionRef || submitting}
                >
                  {submitting ? "Creating Task..." : "Create Task"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Tasks;
