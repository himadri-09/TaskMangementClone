import React from 'react';
import Tasks from './components/Tasks';
import ForgotPassword from './Reg/Forgotpassword';
import RegisterAndLogin from './Reg/RegLogin';


import { 
  createBrowserRouter,
  RouterProvider
 } from 'react-router-dom';

import Home from './Reg/Home';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const router = createBrowserRouter([
  
  {
    path: "/",
    element: <RegisterAndLogin />,
   
  },
  {
    path: "/home",
    element: <Tasks />,
   
  },
  {
    path: "/reset",
    element: < ForgotPassword />,
   
  },
]);


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     < RouterProvider router={router}/>
//   </React.StrictMode>
// );

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider
    router={router}
    // fallbackElement={<BigSpinner />}
  />
);
