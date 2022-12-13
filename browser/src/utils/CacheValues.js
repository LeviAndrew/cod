class CacheValues {
  constructor(){
    this._store = {};
    this.insertData('user', {type: false});
  }
  insertData(index, data){
    console.log('insert', index, data);
    this._store[index] = data;
  }
  getData(index){
    if(this._store.hasOwnProperty(index)) return this._store[index];
    console.error('Unknown data');
  }
  removeData(index){
    if(this._store.hasOwnProperty(index)) return delete this._store[index];
    console.error('Unknown data');
  }
  updateData(index, data){
    if(!this._store.hasOwnProperty(index)) return 'Unknown data';
    for (let attr in data){
      if (data.hasOwnProperty(attr)){
        this._store[index][attr] = data[attr];
      }
    }
  }
}
export default new CacheValues();