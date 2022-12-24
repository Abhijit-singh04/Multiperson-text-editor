// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import TextEditor from './component/TextEditor';
import {
  BrowserRouter as Router,
  Switch,
  Routes,
  Route,
  Redirect,
} from "react-router-dom";
import Home from './component/Home';

function App() {
  return (

    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/documents/:id' element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
