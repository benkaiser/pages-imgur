import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      loading: false
    };
  }

  render() {
    const props = this.props;
    return html`
      <div className='center-container'>
        <h1>Tiny Image Upload - Powered by GitHub Pages + GitHub Actions</h1>
        <p>Upload small (${'<'}50kb) images to GitHub Pages</p>
        <button class="primary" onClick=${this.onClickUpload}>Upload Image</button>
        <input accept="image/*" onChange=${this.onUpload} type="file" id="upload" style="display:none" />
        <p>${this.state.status}</p>
        ${ this.state.loading ? html`<div class="spinner primary"></div> ` : ''}
      </div>
    `;
  }

  onClickUpload = () => {
    document.getElementById('upload').click();
  }

  onUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      this.setState({
        status: '',
        loading: false
      });
      return;
    }
    this.setState({
      status: 'Starting upload',
      loading: true
    });
    const base64 = await toBase64(file);
    const filename = uuidv4() + '.' + file.type.replace('image/', '');
    fetch("https://publicactiontrigger.azurewebsites.net/api/dispatches/benkaiser/pages-imgur", {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ event_type: 'Add Image', client_payload: { data: JSON.stringify({ filename, image: base64 }) } })
    }).then((response) => {
      if (response.status === 200 || response.status === 204) {
        this.setState({
          status: 'Upload initiated. Will redirect when available (can take up to 1 minute)',
          loading: true
        });
        this.waitForImage(filename);
      } else {
        this.setState({
          status: 'Upload failed, image may be too big',
          loading: false
        });
      }
    }).catch(() => {
      this.setState({
        status: 'Upload failed, image may be too big',
        loading: false
      });
    })
  }

  waitForImage = (filename) => {
    const location = 'images/' + filename;
    setInterval(() => {
      fetch(location + '?cachebust=' + Math.random()).then((response) => {
        if (response.status === 200) {
          window.location.href = window.location.pathname + location;
        }
      });
    }, 5000);
  }
}


render(html`<${App} />`, document.getElementById('main'));
