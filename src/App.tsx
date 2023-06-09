import React from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import DomComp from './components/DomComp';

interface IMainNav {
  version: string;
}
const MainNav: React.FC<IMainNav> = ({ version }) => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">Manga Eater Client {version}</Navbar.Brand>
      </Container>
    </Navbar>
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <Container>
        <MainNav version="1.0.0" />
        <DomComp />
        <footer className="App-footer">
          {/* content about author */}
          <p>
            Author: <a href="https://github.com/BuntinJP">buntin</a>
          </p>
        </footer>
      </Container>
    </div>
  );
};

export default App;
