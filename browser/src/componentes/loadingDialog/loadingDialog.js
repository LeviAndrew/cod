import Basic from '../../utils/BasicComponents';

class LoadingDialog extends Basic {
  constructor(){
    super('errorDialog');
    this.data = {
      message: '',
      active: false
    };
    this.listeners = {};
    this.methods = {
      'openDialog': this.openDialog.bind(this),
      'closeDialog': this.closeDialog.bind(this),
    };
    this.wiring();
  }
  openDialog() {
    this.data.active = true;
  }
  closeDialog() {
    this.data.message = '';
    this.data.active = false;
  }
}
export default new LoadingDialog().$vue;