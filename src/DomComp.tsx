import React, { useEffect, useState } from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';

interface RequestBody {
    title: string;
    urls?: string[];
    url?: string;
}

const DomComp: React.FC = () => {
    const [dom, setDom] = useState<string>('Out of Service');
    const [isLoading, setLoading] = useState(false); //loading
    const [title, setTitle] = useState<string>(''); //title of manga
    const [ready, setReady] = useState<boolean>(true); //readiable of push button
    const [pages, setPages] = useState<string>('?'); //ページ数
    const [channel, setChannel] = useState<string>('未取得'); //discordチャンネル名
    useEffect(() => {
        console.log('useEffect was called');
        fetchChannelName().then((name) => {
            setChannel(name);
        });
    }, [title]);

    const getInfoOfActiveTab = async () => {
        console.log('getInfoOfActiveTab was called');
        /* get active tab */
        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        /* execuse parseDOM in active tab and get dom */
        let info = await chrome.scripting.executeScript({
            target: { tabId: tab.id || 0 },
            func: () => {
                //get url
                const url = document.URL;
                const title = document.title;
                const className = 'card-wrap';
                const classCount = document.getElementsByClassName(className);
                let urls = [];
                for (let i = 0; i < classCount.length; i++) {
                    const img = classCount[i].getElementsByTagName('img');
                    const src = img[0].getAttribute('data-src') || '';
                    urls.push(src);
                }
                const count: number = classCount.length;
                return { title, count, url, urls };
            },
        });
        const result = info[0].result;
        return result;
    };
    const pushManga = async () => {
        setLoading(true);
        console.log('pushManga was called');
        const result = await getInfoOfActiveTab();
        const scrapedTitle = result.title
            .replace(' – Raw 【第', '(')
            .replace('話】', ')')
            .replace(/ /g, '');
        setTitle(scrapedTitle);
        setPages(result.count.toString());
        const body: RequestBody = {
            title: scrapedTitle,
            url: result.url,
            urls: result.urls || undefined,
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
                const bodyString = response.body;
                console.log('Success:', bodyString || 'no Signal');
                setDom('Success');
                setReady(true);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setDom('Error');
                setReady(true);
                setLoading(false);
            });
    };
    const fetchChannelName = async () => {
        const name = await fetch('http://localhost:3000/channel');
        const t = await name.text();
        return t;
    };
    // JSX
    return (
        <Container fluid="true">
            <Row>
                <Col>
                    <Form>
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
                                漫画のタイトル(未入力で自動取得)
                            </Form.Text>
                        </Form.Group>
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
                            <h3>scraping status</h3>
                            <h5>Page: {pages}</h5>
                            <h5>Title: {title}</h5>
                            <h4>{dom}</h4>
                            <h4>チャンネル名：{channel}</h4>
                        </div>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default DomComp;
