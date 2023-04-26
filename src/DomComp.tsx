import './App.css';
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ScraperStatus from './ScraperStatus';
interface RequestBody {
  title: string;
  urls?: string[];
  url?: string;
}

const DomComp: React.FC = () => {
  const [status, setStatus] = useState<string>('Out of Service');
  const [isLoading, setLoading] = useState(false); //loading
  const [title, setTitle] = useState<string>(''); //title of manga
  const [ready, setReady] = useState<boolean>(true); //readiable of push button
  const [pages, setPages] = useState<string>('?'); //ページ数
  const [channel, setChannel] = useState<string>('未取得'); //discordチャンネル名
  const [body, setBody] = useState<RequestBody>({ title: '' }); //body of request
  useEffect(() => {
    console.log('useEffect was called');
    fetchChannelName().then((name) => {
      setChannel(name);
    });
    getReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfoOfActiveTab = async () => {
    console.log('getInfoOfActiveTab was called');
    /* get active tab */
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    /* execuse parseDOM in active tab and get status */
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
  const getReady = async () => {
    setLoading(true);
    console.log('pushMangaForced was called');
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
    setBody(body);
    setLoading(false);
  };
  const pushManga = async () => {
    setLoading(true);
    console.log('pushManga was called');
    const pushBody = body;
    console.log(pushBody);
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
        setStatus('Success');
        setReady(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setStatus('Error');
        setReady(true);
        setLoading(false);
      });
  };
  const pushMangaForced = async () => {
    setLoading(true);
    console.log('pushMangaForced was called');
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
        setStatus('Success');
        setReady(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setStatus('Error');
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
            <Form.Group className="mb-3" controlId="formBasicClassname">
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
            <Button
              variant="primary"
              type="button"
              disabled={!ready}
              onClick={ready ? pushManga : undefined}
            >
              {isLoading ? 'Loading...' : 'Push'}
            </Button>
            {'  '}
            <Button
              variant={ready ? 'danger' : 'dark'}
              type="button"
              disabled={false}
              onClick={pushMangaForced}
            >
              強制開始
            </Button>
          </Form>
        </Col>
        <Col>
          <ScraperStatus
            loading={isLoading}
            pages={pages}
            title={title}
            status={status}
            channel={channel}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default DomComp;
