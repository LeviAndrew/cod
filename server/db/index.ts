import {User} from "./managers/User";
import {Admin} from './managers/Admin';
import {City} from './managers/City';
import {Grouper} from './managers/Grouper';
import {Neighborhood} from './managers/Neighborhood';
import {Product} from './managers/Product';
import {CalculatedProduct} from './managers/CalculatedProduct';
import {ProductBasket} from './managers/ProductBasket';
import {ProductSearch} from './managers/ProductSearch';
import {Region} from './managers/Region';
import {Report} from './managers/Report';
import {Researcher} from './managers/Researcher';
import {Review} from './managers/Review';
import {Search} from './managers/Search';
import {State} from './managers/State';
import {Source} from './managers/Source';
import {ManagerMap} from "../interfaces/ManagerMap";

/**
 * Inicia todos os managers.
 */
let managers: ManagerMap = {
  "user": new User(),
  "admin": new Admin(),
  "city": new City(),
  "grouper": new Grouper(),
  "neighborhood": new Neighborhood(),
  "product": new Product(),
  "calculatedProduct": new CalculatedProduct(),
  "productbasket": new ProductBasket(),
  "productsearch": new ProductSearch(),
  "region": new Region(),
  "report": new Report(),
  "researcher": new Researcher(),
  "review": new Review(),
  "search": new Search(),
  "state": new State(),
  "source": new Source(),
};

// async function f(managers) {
//   let pesquisador = await managers.researcher.read({query: {email: "anajuliasgrb@gmail.com"}});
//   let review = await managers.review.read({query: {year: 2018, month: 9}, select: 'searches', populate: [{path: 'searches'}]});
//   let searchesId = [];
//   for(let i = 0; i < review[0].searches.length; i++){
//     for(let j = 0; j < review[0].searches[i].searches.length; j++){
//       searchesId.push(review[0].searches[i].searches[j].toString());
//     }
//   }
//   let searches = await managers.search.read({query: {_id: {$in: searchesId}, user: pesquisador[0].id}, select: 'price previousSearch id', populate: [{path: 'previousSearch', select: 'price id'}]});
//   let toUpdate = [];
//   for(let i = 0; i < searches.length; i++){
//     if(searches[i].previousSearch.price && searches[i].previousSearch.price % 1 === 0){
//       searches[i].previousSearch.price = searches[i].previousSearch.price /100;
//       searches[i].price = searches[i].price / 100;
//       toUpdate.push(searches[i].previousSearch);
//       delete searches[i].previousSearch;
//       toUpdate.push(searches[i]);
//     }
//   }
//   let promises = [];
//   for(let i = 0; i < toUpdate.length; i++){
//     promises.push(managers.search.update({_id: toUpdate[i].id, update: {$set: {price: toUpdate[i].price}}}));
//   }
//   let ret = await Promise.all(promises);
//   return null;
// }

// f(managers).then(()=>{}).catch((e)=>{console.log('error', e)});

export {managers};