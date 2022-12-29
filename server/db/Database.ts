import {ManagerMap} from "../interfaces/ManagerMap";
import {managers} from "./index";
import {Source} from "../events/Source";
import * as Mongoose from "mongoose";
import * as path from "path";
import * as fs from "fs";

export class Database extends Source {
  private _mongoose: any;
  private _managers: ManagerMap;

  constructor (config) {
    super();
    this.mongoose = Mongoose;
    this.mongoose.Promise = Promise;
    this.managers = managers;
    this.wiring();
    this.init(config.mongodb);
  }

  private wiring () {
    this.mongoose.connection.on('error', this.mongooseError.bind(this));
  }

  private set mongoose (mongoose) {
    this._mongoose = mongoose;
  }

  private get mongoose () {
    return this._mongoose;
  }

  private set managers (managers) {
    this._managers = managers;
  }

  private get managers () {
    return this._managers;
  }

  private mongooseError (error, value) {
    return console.error('error', error, value);
  }

  /**
   *
   * @param config
   * @returns {Promise<void>}
   *
   * Inicia o banco de dados e verifica se tem que apagar o bando e criar um novo.
   */

  async init(config) {
    try {
      await this.mongoose.connect(`mongodb://${config.host}/${config.name}`, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      if (config.erase_db) {
        await this.popularBanco(config.fixture);
        console.warn('aqui no database');
      }
      this.hub.send(this, 'banco.ready', {success: true, error: false});
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  /**
   *
   * @param fixture
   * @returns {Promise<void>}
   *
   * Se o banco precisa ser apagado, essa funcção apaga e cria um novo.
   */

  async popularBanco(fixture): Promise<void> {
    await this.mongoose.connection.db.dropDatabase(); // mudar comando dropDatabase
    let dir_path = path.resolve(fixture);
    let files = fs.readdirSync(dir_path);
    let promises = [];
    while (files.length > 0) {
      let file = require(path.join(dir_path, files.shift()));
      promises.push(this.hub.send(this, "db." + file.model + ".create", {
        success: file.data,
        error: null
      }).promise);
    }
    await Promise.all(promises);
    promises = [];
    for (let idx in this.managers) {
      if (this.managers.hasOwnProperty(idx)) {
        promises.push(this.managers[idx].model.ensureIndexes());
      }
    }

    await Promise.all(promises);
  };

  /**
   *
   * @returns {Promise<void>}
   *
   * Destroi o banco de dados.
   */
  async destroy() {
    try {
      await this.mongoose.connection.close();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  getManager(msg) {
    if (msg.source === this.id) return;

    let manager = msg.data.success;
    this.hub.send(this, 'db.getManager', this.managers[manager], msg.id);
  }
}