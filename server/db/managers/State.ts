import {BasicManager} from "../BasicManager";
import {Model} from "../model/State";
import {Types} from "mongoose";

export class State extends BasicManager {
  wire_custom_listeners() {
  }

  get model() {
    return Model;
  }

  get event_name() {
    return 'state';
  }

  private static getStateNameByInitial(stateInitial) {
    switch (stateInitial) {
      case 'AC':
        return 'Acre';
      case 'AL':
        return 'Alagoas';
      case 'AP':
        return 'Amapá';
      case 'AM':
        return 'Amazonas';
      case 'BA':
        return 'Bahia';
      case 'CE':
        return 'Ceará';
      case 'DF':
        return 'Distrito Federal';
      case 'ES':
        return 'Espírito Santo';
      case 'GO':
        return 'Goiás';
      case 'MA':
        return 'Maranhão';
      case 'MT':
        return 'Mato Grosso';
      case 'MS':
        return 'Mato Grosso do Sul';
      case 'MG':
        return 'Minas Gerais';
      case 'PA':
        return 'Pará';
      case 'PB':
        return 'Paraíba';
      case 'PR':
        return 'Paraná';
      case 'PE':
        return 'Pernambuco';
      case 'PI':
        return 'Piauí';
      case 'RJ':
        return 'Rio de Janeiro';
      case 'RN':
        return 'Rio Grande do Norte';
      case 'RS':
        return 'Rio Grande do Sul';
      case 'RO':
        return 'Rond&ohat;nia';
      case 'RR':
        return 'Roraima';
      case 'SC':
        return 'Santa Catarina';
      case 'SP':
        return 'São Paulo';
      case 'SE':
        return 'Sergipe';
      case 'TO':
        return 'Tocantins';
    }
  }

  async beforeCreate(data) {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; ++i) {
        data[i]._id = data[i]._id ? new Types.ObjectId(data[i]._id) : new Types.ObjectId();
        data[i].id = data[i]._id.toString();
        data[i].name = State.getStateNameByInitial(data[i].initial);
      }
    } else {
      data._id = data._id ? new Types.ObjectId(data._id) : new Types.ObjectId();
      data.id = data._id.toString();
      data.name = State.getStateNameByInitial(data.initial);
    }

    return data;
  }

}