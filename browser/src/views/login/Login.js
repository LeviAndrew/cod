import Basic from '../../utils/BasicComponents';

class Login extends Basic{
  constructor(){
    super('Login');
    this.components = {};
    this.listeners = {
      'retorno_login': this.retorno_login.bind(this),
    };
    this.methods = {
      'login': this.login.bind(this)
    };
    this.data = {
      user: {
        email: '',
        password: ''
      },
      validate_login: false,
      rules : {
        user_not_found: () => !this.data.validate_email || 'Usuário não cadastrado',
        incorrect_password: () => !this.data.validate_senha || 'Senha incorreta'
      }
    };

    this.watch = {
      validate_email: function () {
        if(this.validate_email){
          this.rules.user_not_found = () => 'Usuário não cadastrado';
        }
      }
    };
    this.wiring();
  }

  retorno_login(msg){
    if(msg.source !== this) return;
    if(!msg.datas.success){
      return this.data.validate_login = true;
    }
    this.send_to_browser('user_logged', msg.datas.data);
  }

  login(){
   this.data.validate_login = false;
    this.send_to_server('logar', this.data.user, 'retorno_login');
  }
}
export default new Login().$vue;