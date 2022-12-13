import EventEmitter2 from 'eventemitter2';
import io from 'socket.io-client';
const config = require('./configs/SIOM.json');
class SIOMLab{
  constructor(){
    this.socket = io;
    this.emiter = config.eventEmitter2;
    this.messages_queue = {};

    if(this.socket){
      this.wiring();
    }
  }

  set socket(io){
    this._socket = io(config.server.address+config.server.port);
  }

  get socket(){
    return this._socket;
  }

  set emiter(configs){
    this._emiter = new EventEmitter2(configs);
  }

  get emiter(){
    return this._emiter;
  }

  set messages_queue(messages_queue){
    this._messages_queue = messages_queue;
  }

  get messages_queue(){
    return this._messages_queue;
  }

  set listeners(listeners){
    this._listeners = listeners;
  }

  get listeners(){
    return this._listeners;
  }

  on(event, callback){
    this.emiter.on(event, callback);
  }

  on_socket(evento, callback){
    this.socket.on(evento, callback);
  }

  remove_socket_listener(evento, callback){
    this.socket.removeListener(evento, callback);
  }

  send_to_browser(evento, msg){
    this.emiter.emit(evento, msg);
  }

  remove_listener(evento, callback){
    this.emiter.removeListener(evento, callback);
  }

  message_to_send(msg){
    this.messages_queue[msg.id] = msg;
    return msg.to_server();
  }

  send_to_server(msg){
    let msg_to_server = this.message_to_send(msg);
    this.socket.emit(msg_to_server.evento, msg_to_server);
  }

  receive_from_server(msg){
    let msg_retorno = this.messages_queue[msg.id];
    delete this.messages_queue[msg.id];
    msg_retorno.datas = msg.datas;
    this.send_to_browser(msg_retorno.evento_retorno, msg_retorno);
  }

  windowOpen(path){
    window.open(`http://${config.server.address}${config.server.port}${path}`, '_blank')
  }

  wiring(){
    this.socket.on('retorno', this.receive_from_server.bind(this));
  }
}

export default new SIOMLab();