//import './App.css';
import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "tabler-react/dist/Tabler.css";

import Dashboard from "./Pages/Dashboard.js";
import Login from "./Layouts/LoginPage.react";

function App() {

  return (
    <div className="App">
      <React.StrictMode>
        <Router>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </Router>
      </React.StrictMode>
    </div>
  );
}

export default App;
