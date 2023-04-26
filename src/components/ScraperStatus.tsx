import React from 'react';
import Container from 'react-bootstrap/Container';

interface State {
  loading: boolean;
  pages: string;
  title: string;
  status: string;
  ifPost: boolean;
}

const ScraperStatus: React.FC<State> = (props) => {
  return (
    <Container>
      <div className="card text-center bg-dark">
        <div className="card-header">
          <h5>Client</h5>
          {props.loading ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <div className="text-success">Ready</div>
          )}
        </div>
        <div className="card-body">
          <table className="table table-dark table-bordered">
            <thead>
              <tr>
                <th scope="col">item</th>
                <th scope="col">status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Title</th>
                <td>{props.title}</td>
              </tr>
              <tr>
                <th scope="row">Pages</th>
                <td>{props.pages}</td>
              </tr>
              <tr>
                <th scope="row">status</th>
                <td>{props.status}</td>
              </tr>
              <tr>
                <th scope="row">IfPush</th>
                <td>{props.ifPost ? 'Push' : 'Only Download'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default ScraperStatus;
