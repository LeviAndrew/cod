import Basic from '../../utils/BasicComponents';

class DialogImportReview extends Basic {
  constructor() {
    super('DialogImportReview');
    this.components = {};
    this.methods = {
      'open': this.open.bind(this),
      'clear': this.clear.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'importReview': this.importReview.bind(this),
      'selectDocument': this.selectDocument.bind(this),
    };
    this.listeners = {
      'returnImportReview': this.returnImportReview.bind(this),
    };
    this.data = {
      valid: true,
      disabled2: false,
      disabled: true,
      dialog: false,
      loading: false,
      regionId: '',
      base64: '',
      fileName: '',
      year: '',
      month: '',
      persistent: false
    };
    this.watch = {
      regionId: this.enableButton.bind(this),
      base64: this.enableButton.bind(this),
      fileName: this.enableButton.bind(this),
      year: this.enableButton.bind(this),
      month: this.enableButton.bind(this),
    };
    this.wiring();
    this.onReady = [];
  }

  // Função para resetar forms
  clear() {
    this._instance.$refs.form.reset()
  }

  enableButton() {
    this.data.disabled = !(this.data.fileName && this.data.month && this.data.year && this.data.regionId);
  }

  open(data) {
    this.data.regionId = data;
    this.data.dialog = true;
  }

  closeDialog() {
    this.data.dialog = false;
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

  readDate() {
    let data = {
      regionId: this.data.regionId
    };
    this.send_to_server('read_review_date', data, 'returnReadDate');
  }

  readSearch() {
    let data = {
      regionId: this.data.regionId,
      year: this.data.year,
      month: this.data.month
    };
    this.send_to_server('read_all_searches_to_review', data, 'returnReadSearch');
  }

  returnImportReview() {
    this.readSearch();
    this.readDate();
    this.clear();
    this.data.dialog = false;
    this.data.disabled2 = false;
    this.data.persistent = false;
    this.data.loading = false;
    this.data.base64 = '';
    this.data.fileName = '';
  }

  importReview() {
    if (!this.data.regionId ||
      !this.data.base64 ||
      !this.data.year ||
      !this.data.month) {
    } else {
      this.send_to_server('import_review', {
        year: this.data.year,
        month: this.data.month,
        regionId: this.data.regionId,
        document: this.data.base64,
      }, 'returnImportReview');
    }
    this.data.loading = true;
    this.data.disabled2 = true;
    this.data.persistent = true;
  }

  selectDocument() {
    this.$instance.$refs.importReview.onchange = event => {
      let file = event.target.files[0];
      this.data.fileName = file.name;
      this.to_base_64_promise(file)
        .then((ret) => {
          this.data.base64 = ret;
        })
        .catch((error) => {
          console.log(error);
        })
    };
    this.$instance.$refs.importReview.click();
  }

  to_base_64_promise(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((success, fail) => {
      reader.onload = () => {
        const base = 'base64,';
        let ret = reader.result.slice(reader.result.indexOf(base) + base.length, reader.result.length);
        success(ret);
      };
      reader.onerror = (error) => {
        fail(error);
      };
    })
  }

}

export default new DialogImportReview().$vue;