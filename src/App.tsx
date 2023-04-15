import React, { useEffect, useState } from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

import DomComp from './DomComp';

interface IMainNav {
    version: string;
}
const MainNav: React.FC<IMainNav> = ({ version }) => {
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">
                    Manga Eater Client {version}
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
};

const App: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    useEffect(() => {
        const queryInfo = { active: true, lastFocusedWindow: true };
        chrome.tabs &&
            chrome.tabs.query(queryInfo, (tabs) => {
                const url = tabs[0].url;
                setUrl(url || 'unknown');
            });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <p>URL:</p>
                <p>{url}</p>
            </header>
            <Container>
                <MainNav version="0.0.1" />
                <DomComp />
            </Container>
            <footer className="App-footer">
                {/* content about author */}
                <p>
                    Author: <a href="https://github.com/BuntinJP">buntin</a>
                </p>
            </footer>
        </div>
    );
};

export default App;
