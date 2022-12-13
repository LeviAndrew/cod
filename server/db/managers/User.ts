import {BasicManager} from "../BasicManager";
import {Model} from "../model/User";

export class User extends BasicManager {
  wire_custom_listeners() {
    this.hub.on("db." + this.event_name + ".login", this.login.bind(this));
  }

  /**
   * Verifica se o usuario existe no banco de dados.
   * Se não existe, enviar um erro informando isso.
   * Se existe, verifica se a senha enviada bate com a registrada no banco de dados.
   * Se a senha não bate, retorna um erro informando isso.
   * Se a senha bate, seta o atributo logged para true e retorna os dados do usuario logado.
   * @param msg
   * @returns {Promise<void>}
   */
  async login(msg) {
    if (msg.source_id === this.id) return;
    let user = msg.data.success;
    let query = {
      email: user.email,
      removed: false,
    };
    let select = 'email id name surname password type phoneNumber profile';
    let ret = await this.model.find(query)
      .select(select)
      .exec();
    if (ret.length === 1) {
      let userret: any = ret[0].toJSON();
      if (userret.password != user.password) {
        return this.answer(msg.id, "login", null, "wrongPassword");
      }
      let ret_user_update: any = await this.model.findByIdAndUpdate(userret.id, {'logged': true});
      if (ret_user_update) {
        delete userret.password;
        return this.answer(msg.id, 'login', userret, null);
      } else {
        this.answer(msg.id, "login", null, "cantLogin");
      }
    } else {
      this.answer(msg.id, "login", null, "userNotFound");
    }
  }

  async afterCreate(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].toJSON();
      delete data[i].createdAt;
      delete data[i].password;
      delete data[i].removed;
      delete data[i].updatedAt;
    }
    return data;
  }

  /**
   * Faz as modificações/operações necessárias no retorno do read
   *
   * @param data
   */
  async afterRead(data) {
    if(Array.isArray(data)){
      for (let i = 0; i < data.length; ++i) {
        delete data[i].password;
        delete data[i]._id;
      }
    } else {
      delete data.password;
      delete data._id;
    }
    return data;
  }

  async afterUpdate(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].toJSON();
      delete data[i].password;
    }

    return data;
  }

  get model() {
    return Model;
  }

  get event_name() {
    return 'user';
  }
}