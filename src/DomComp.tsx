import React, { useEffect, useState } from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';

interface RequestBody {
    title: string;
    urls: string[];
}

const simulateNetworkRequest = () => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};

const createURLs = (formatted: string) => {
    const urls: string[] = [];
    const lines = formatted.split('\n');
    lines.forEach((line) => {
        const ary = line.split('"');
        for (let i = 0; i < ary.length; i++) {
            if (
                ary[i].includes('jpg') ||
                ary[i].includes('png') ||
                ary[i].includes('jpeg') ||
                ary[i].includes('webp') ||
                ary[i].includes('gif')
            ) {
                urls.push(ary[i]);
            }
        }
    });
    return urls;
};

function parseDOM() {
    return document.body.innerHTML;
}
const getDomFromClassname = async (classname: string) => {
    console.log('getDomFromClassname was called');
    /* get active tab */
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    /* execuse parseDOM in active tab and get dom */
    let dom = await chrome.scripting.executeScript({
        target: { tabId: tab.id || 0 },
        func: parseDOM,
    });
    let domString = dom[0].result;
    console.log(domString);
    /* from string get a HTMLElement */
    domString = '<html><body>' + domString + '</body></html>';
    const parser = new DOMParser();
    const doc = parser.parseFromString(domString, 'text/html');
    const domElement = doc.getElementsByClassName(classname);
    return domElement;
};

const DomComp: React.FC = () => {
    const [inputs, setInputs] = useState<string>('???');
    const [dom, setDom] = useState<string>('Out of Service');
    const [isLoading, setLoading] = useState(false);
    const [pages, setPages] = useState<string>('0');
    const [title, setTitle] = useState<string>('???');
    const [ready, setReady] = useState<boolean>(false);
    const [urls, setUrls] = useState<string[]>([]);
    const [episode, setEpisode] = useState<string>('???');
    useEffect(() => {
        console.log('useEffect was called');
        chrome.storage.local.get(['classname'], (result) => {
            if (result.classname) {
                setInputs(result.classname);
            }
            console.log('classname is ' + result.classname);
        });
        chrome.storage.local.get(['title'], (result) => {
            if (result.title) {
                setTitle(result.title);
            }
            console.log('title is ' + result.title);
        });
        chrome.storage.local.get(['eposode'], (result) => {
            if (result.eposode) {
                const intEposode = parseInt(result.eposode);
                const nextEposode = intEposode + 1;
                setEpisode(nextEposode.toString());
            }
            console.log('eposode is ' + result.eposode);
        });
    }, []);

    const testviewButton = () => {
        setLoading(true);
        console.log('testviewButton was called');
        getDomFromClassname(inputs).then((dom) => {
            if (dom.length === 0) {
                setDom('not found');
                setReady(false);
                setLoading(false);
                return;
            }
            const formatted = prettier.format(dom[0].innerHTML, {
                parser: 'html',
                plugins: [parserHtml],
            });
            const urls = createURLs(formatted);
            setDom('Loading...');
            setReady(true);
            setPages(urls.length.toString());
            setUrls(urls);
            simulateNetworkRequest().then(() => {
                setLoading(false);
                setDom('URL is scraped.Push Ready');
            });
        });
    };
    const pushManga = () => {
        chrome.storage.local.set(
            {
                classname: inputs,
            },
            () => {
                console.log('classname is set to ' + inputs);
            }
        );
        chrome.storage.local.set(
            {
                title: title,
            },
            () => {
                console.log('title is set to ' + title);
            }
        );
        chrome.storage.local.set(
            {
                eposode: episode,
            },
            () => {
                console.log('eposode is set to ' + episode);
            }
        );
        setLoading(true);
        console.log('pushManga was called');
        const body: RequestBody = {
            title: title + episode,
            urls: urls,
        };
        console.log(body);
        fetch('http://localhost:3000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                console.log('Success:', response);
                setDom('Success');
                setReady(false);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setDom('Error');
                setReady(false);
                setLoading(false);
            });
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
                                onChange={(e) => setInputs(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                漫画が入っているdivのクラス名
                            </Form.Text>
                        </Form.Group>
                        {/*  */}
                        <Form.Group
                            className="mb-3"
                            controlId="formBasicClassname"
                        >
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type=""
                                placeholder={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                漫画のタイトル
                            </Form.Text>
                        </Form.Group>
                        {/*  */}
                        <Form.Group
                            className="mb-3"
                            controlId="formBasicClassname"
                        >
                            <Form.Label>Episodes</Form.Label>
                            <Form.Control
                                type=""
                                placeholder={episode}
                                onChange={(e) => setEpisode(e.target.value)}
                            />
                            <Form.Text className="text-muted">話数</Form.Text>
                        </Form.Group>
                        <Button
                            variant="dark"
                            type="button"
                            disabled={isLoading}
                            onClick={!isLoading ? testviewButton : undefined}
                        >
                            {isLoading ? '待ってろ' : 'TestView'}
                        </Button>
                        {'  '}
                        <Button
                            variant={ready ? 'danger' : 'dark'}
                            type="button"
                            disabled={!ready}
                            onClick={ready ? pushManga : undefined}
                        >
                            {isLoading ? 'Not Ready' : '開始'}
                        </Button>
                    </Form>
                </Col>
                <Col>
                    <Container>
                        <div className="right-page">
                            scraping status
                            <br />
                            Target Classname: {inputs}
                            <br />
                            Page: {pages}
                            <br />
                            Title: {title}
                            <br />
                            {dom}
                        </div>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default DomComp;
