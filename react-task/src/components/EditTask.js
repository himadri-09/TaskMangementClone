import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase.config';
import { onAuthStateChanged } from "firebase/auth";

const EditTask = ({ task, id }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  const updateTask = async (e) => {
    e.preventDefault();
  
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }
  
      // Ensure that the path in doc() matches your Firestore structure
      const taskDocument = doc(db, 'users', user.uid, 'tasks', id);
      await updateDoc(taskDocument, {
        task: editedTask,
      });
       window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target={`#id${id}`}
      >
        Edit Task
      </button>

      <div
        className="modal fade"
        id={`id${id}`}
        tabIndex="-1"
        aria-labelledby="editLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editLabel">
                Update Task Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form className="d-flex">
                <input
                  type="text"
                  className="form-control"
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                />
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateTask} // Removed the arrow function
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTask;