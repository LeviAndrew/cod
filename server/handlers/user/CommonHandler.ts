import {BasicHandler} from "../BasicHandler";
import {Types} from "mongoose";
import {UpdateObject} from "../util/UpdateObject";
import {QueryObject} from "../util/QueryObject";
import * as fs from "fs"
import * as path from "path"

export class CommonHandler extends BasicHandler {

  logout() {
    return {
      success: true,
      data: null,
    }
  }

  /**
   * Ajusta o retorno do update de pesquisas do usuario.
   *
   * @param {{data: any; updates: any}} data
   */
  private adjustData(data: { data: any, updates: any }) {
    let indexedData = {};
    for (let i = 0; i < data.data.length; i++) {
      indexedData[data.data[i].id] = data.data[i];
    }
    for (let i = 0; i < data.updates.length; i++) {
      if (data.updates[i].data.success) {
        indexedData[data.updates[i].data.success[0].id].status = data.updates[i].data.success[0].status;
      }
    }
  }

  /**
   * Cria as promises para fazer atualização na hora de salvar a pesquisa.
   *
   * @param searches
   * @returns {any[]}
   */
  private getSearchesUpdatePromises(searches): any[] {
    let ret = [];
    for (let i = 0; i < searches.length; i++) {
      ret.push(
        this.emit_to_server('db.search.update', new UpdateObject(
          searches[i].id,
          {
            especOne: searches[i].especOne,
            especTwo: searches[i].especTwo,
            status: 'Init',
            price: Number(searches[i].price),
            searchChecked: searches[i].searchChecked,
            promotion: !!searches[i].promotion,
            barCode: searches[i].barCode,
            position: `${searches[i].latitude}, ${searches[i].longitude}`,
            itemIndex: searches[i].itemIndex
          }
        ))
      )
    }
    return ret;
  }

  private getSearchesUpdateOrderPromises(searches): any[] {
    let ret = [];
    for (let i = 0; i < searches.length; i++) {
      ret.push(
        this.emit_to_server('db.search.update', new UpdateObject(
          searches[i].id,
          {
            itemIndex: searches[i].itemIndex
          }
        ))
      )
    }
    return ret;
  }

  /**
   * Retorna todas as pesquisas que não estão fechadas do usuario.
   *
   * @param userId
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async getSearches(userId) {
    let searchRet: any = await this.getSearch({
      user: new Types.ObjectId(userId.auth),
      status: {
        $ne: "Closed",
      }
    });
    return this.returnHandler({
      model: 'search',
      data: searchRet.data,
    });
  }

  /**
   * Retorna todas as pesquisas do usuario, na fonte passada por parametro, que não estão fechadas.
   *
   * @param userId
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async getSearchesBySource(userId, data) {
    let searchRet = await this.getSearch({
      user: new Types.ObjectId(userId.auth),
      source: new Types.ObjectId(userId.data.sourceId),
      status: {
        $ne: "Closed",
      }
    });
    return this.returnHandler({
      model: 'search',
      data: searchRet.data,
    });
  }

  public async readSearchesByProductCode(userId, data) {
    let ret = await this.getSearchesByProductCode(userId, data);
    return this.returnHandler({
      model: 'search',
      data: ret.data,
    });
  }

  /**
   * Salva as pesquisas do usuario.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async userSearchesSave(data) {
    if (!data.data.searches || !data.data.searches.length) {
      return await this.returnHandler({
        model: 'search',
        data: {
          error: 'hasNotSearch'
        }
      });
    }
    let updates = await Promise.all(this.getSearchesUpdatePromises(data.data.searches));
    this.adjustData({data: data.data.searches, updates});
    return this.returnHandler(
      {
        model: 'search',
        data: {
          success: data.data
        },
      }
    );
  }

  public async saveNewOrder(data) {
    if (!data.searches || !data.searches.length) {
      return await this.returnHandler({
        model: 'search',
        data: {
          error: 'hasNotSearch'
        }
      });
    }
    let updates = await Promise.all(this.getSearchesUpdateOrderPromises(data.searches));
    this.adjustData({data: data.searches, updates});
    return this.returnHandler(
      {
        model: 'search',
        data: {
          success: data
        },
      }
    );
  }

  /**
   * Fecha todas as pesquisas preenchidas pelo usuario e fica disponivel apenas para o adm editar na tabela de critica.
   *
   * @param userId
   * @returns {Promise<null>}
   */
  public async userSearchesSend(userId) {
    let query = {
      user: userId.auth,
      status: {
        $ne: "Closed",
      }
    };
    let ret = await this.emit_to_server('db.search.close', query);
    if (ret.data.success === null) {
      return await this.returnHandler(
        {
          model: 'search',
          data: {error: ret.data.error.message || ret.data.error}
        }
      );
    }
    return await this.returnHandler(
      {
        model: 'search',
        data: ret.data
      }
    );
  }

  /**
   * Retorna todas as fontes onde esse pesquisador precisa pesquisar.
   *
   * @param userId
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async sourceReadOfResearcher(userId) {
    let ret = await this.emit_to_server('db.source.read', new QueryObject(
      {
        researchers: userId.auth,
      },
      "name code id address.street address.number urlImage"
    ));
    return await this.returnHandler({
      model: 'source',
      data: ret.data,
    });
  }

  public async getUserPath(userId) {
    let ret = await this.emit_to_server('db.user.read', new QueryObject(
      userId,
      "id"
    ));
    if (!ret.data.success || ret.data.error) return await this.returnHandler({
      model: 'user',
      data: {error: 'invalidUser'}
    });
    let source = await path.resolve(`resources/images/`);
    return await this.returnHandler({
      model: 'user',
      data: {success: source},
    });
  }

  public async saveImagePath(extName, userId) {
    let time = new Date().getTime();
    let ret = await this.emit_to_server('db.user.update', new UpdateObject(
      userId,
      {
        profile: `/images/${userId}${extName}?${time}`
      }
    ));
    return await this.returnHandler({
      model: 'user',
      data: ret.data,
    });
  }

  /**
   * Faz a validação dos dados que o usuario pode alterar nele mesmo.
   *
   * @param data
   * @returns {{name?: string; surname?: string; email?: string; password?: string; phoneNumber?: string}}
   */
  private beforeChangeInfos(data) {
    let ret: { name?: string, surname?: string, email?: string, password?: string, phoneNumber?: string } = {};
    if (data.name) ret.name = data.name;
    if (data.surname) ret.surname = data.surname;
    if (data.email) ret.email = data.email;
    if (data.password) ret.password = data.password;
    if (data.phoneNumber) ret.phoneNumber = data.phoneNumber;
    return ret;
  }

  /**
   * Faz o update das informações do usuario.
   *
   * @param userId
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async userChangeInfos(userId, data) {
    data = this.beforeChangeInfos(userId.data);
    let ret = await this.emit_to_server('db.user.update', new UpdateObject(
      userId.auth,
      data,
      {
        new: true,
        runValidators: true,
        fields: {
          name: 1,
          surname: 1,
          email: 1,
          phoneNumber: 1,
          id: 1,
        }
      }
    ));
    return await this.returnHandler({
      model: 'user',
      data: ret.data,
    });
  }

  public async especChangeSearches(data: especChange ) {
    let required = this.attributeValidator([
      "auth", "data", [
        "id"
      ]
    ], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    try {
      let ret = await this.emit_to_server('db.search.update', new UpdateObject(
        data.data.id,
        {
          especOne: data.data.especOne,
          especTwo: data.data.especTwo
        }
      ));
      return await this.returnHandler({
        model: 'search',
        data: ret.data,
      });
    } catch (e) {
      return await this.returnHandler({
        model: 'search',
        data: {error: e.message || e},
      });
    }    
  }

}

export default new CommonHandler();

interface especChange {
  data: {
    id: string,
    especOne: string,
    especTwo: string,
  }
}