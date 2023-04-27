import '../App.css';
import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import ScraperStatus from './ScraperStatus';
import ChannelCard from './ChannelCard';
import ToggleButton from 'react-bootstrap/ToggleButton';

interface RequestBody {
  title: string;
  urls?: string[];
  url?: string;
  ifPush?: boolean;
}

const titleParser = (title: string) => {
  const pushableTitle = title
    //all - to ー
    .replace('-', 'ー')
    .replace(' – Raw 【第', '-')
    .replace('話】', '')
    .replace(/ /g, '');
  return pushableTitle;
};

const DomComp: React.FC = () => {
  const [status, setStatus] = useState<string>('Out of Service');
  const [isLoading, setLoading] = useState(false); //default is false
  const [title, setTitle] = useState<string>(''); //title of manga
  const [ready, setReady] = useState<boolean>(true); //readiable of push button
  const [pages, setPages] = useState<string>('?'); //ページ数
  const [body, setBody] = useState<RequestBody>({ title: '' }); //body of request
  const [ifP, setIfP] = useState<boolean>(false); //if push
  useEffect(() => {
    console.log('useEffect was called');
    reLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ifP]);

  const reLoad = () => {
    console.log('reLoad was called');
    getReady();
  };

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
    console.log('getReady was called');
    const result = await getInfoOfActiveTab();
    const scrapedTitle = titleParser(result.title);
    setTitle(scrapedTitle);
    setPages(result.count.toString());
    const body: RequestBody = {
      title: scrapedTitle,
      url: result.url,
      urls: result.urls || undefined,
      ifPush: ifP,
    };
    setBody(body);
    setLoading(false);
  };
  const pushManga = async () => {
    setLoading(true);
    console.log(body);
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
    const scrapedTitle = titleParser(result.title);
    setTitle(scrapedTitle);
    setPages(result.count.toString());
    const body: RequestBody = {
      title: scrapedTitle,
      url: result.url,
      urls: result.urls || undefined,
      ifPush: ifP,
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
  // JSX
  return (
    <Container fluid="true">
      <Row>
        <Col>
          <ChannelCard setLoading={setLoading} />
          {/* some space */}
          <br />
          <br />
          <Form>
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
            {'  '}
            <button className="btn btn-primary" type="button" onClick={reLoad}>
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {'  '}Reload
                </>
              ) : (
                'Reload'
              )}
            </button>
            <br />
            <br />
            <ToggleButton
              className="mb-2"
              id="toggle-check"
              type="checkbox"
              variant="outline-primary"
              checked={ifP}
              value="1"
              onChange={(e) => {
                console.log(`checked = ${e.currentTarget.checked}`);
                setIfP(e.currentTarget.checked);
              }}
            >
              {ifP ? 'Discordにポスト' : 'DLのみ'}
            </ToggleButton>
          </Form>
        </Col>
        <Col>
          <ScraperStatus
            loading={isLoading}
            pages={pages}
            title={title}
            status={status}
            ifPost={ifP}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default DomComp;
