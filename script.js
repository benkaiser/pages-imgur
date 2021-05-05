import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
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
    this.state = {};
  }

  render() {
    const props = this.props;
    return html`
      <div className='center-container'>
        <h1>Image Upload - Powered by GitHub Pages + GitHub Actions</h1>
        <p>Paste image anywhere or click button to upload</p>
        <button class="primary" onClick=${this.onClickUpload}>Upload Image</button>
        <input accept="image/*" onChange=${this.onUpload} type="file" id="upload" style="display:none" />
      </div>
    `;
  }

  onClickUpload = () => {
    document.getElementById('upload').click();
  }

  onUpload = async (event) => {
    const file = event.target.files[0];
    const base64 = await toBase64(file);
    const filename = uuidv4() + '.' + file.type.replace('image/', '');
    console.log(filename);
  }
}


render(html`<${App} />`, document.getElementById('main'));
