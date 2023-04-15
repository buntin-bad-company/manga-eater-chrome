import React, { useEffect, useState } from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';

interface IMainNav {
    version: string;
}
const MainNav: React.FC<IMainNav> = ({ version }) => {
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">
                    {/* <img
                        alt=""
                        src="/logo.svg"
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '} */}
                    Manga Eater Client {version}
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
};
const simulateNetworkRequest = () => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
};

const getDomFromId = (id: string) => {
    const dom = document.getElementById(id);
    return dom;
};

const getDomFromClassname = (classname: string) => {
    const dom = document.getElementsByClassName(classname);
    return dom;
};

const DomComp: React.FC = () => {
    //input state
    const [inputs, setInputs] = useState<string>('???');
    const [dom, setDom] = useState<HTMLElement | null>(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        console.log('useEffect was called');
        if (isLoading) {
            simulateNetworkRequest().then(() => {
                setLoading(false);
            });
        }
    }, [isLoading]);

    const handleClick = () => {
        setLoading(true);
        console.log('HandleClick was called');
        const dom = getDomFromClassname(inputs);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs(e.target.value);
    };
    // JSX
    return (
        /* react boostrap split containers */
        <Container fluid="true">
            <Row>
                <Col>
                    <Form>
                        <Form.Group
                            className="mb-3"
                            controlId="formBasicClassname"
                        >
                            <Form.Label>ClassName</Form.Label>
                            <Form.Control
                                type=""
                                placeholder={inputs}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="formBasicCheckbox"
                        ></Form.Group>
                        <Button
                            variant="dark"
                            type="button"
                            disabled={isLoading}
                            onClick={!isLoading ? handleClick : undefined}
                        >
                            {isLoading ? '待ってろ' : 'GO!!'}
                        </Button>
                    </Form>
                </Col>
                <Col>
                    <div id="dom-id">HTML element What class is {inputs}</div>
                    <br />
                    {/* print dom in string */}
                </Col>
            </Row>
        </Container>
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
