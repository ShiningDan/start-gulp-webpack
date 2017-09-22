import { h, render, Component } from 'preact';

import App from '../src/components/app/app.jsx';

class Index extends Component {

  render() {
    return (
      <div>
      <App />
      </div>
    );
  }
}

render(<Index />, document.getElementById('container'))