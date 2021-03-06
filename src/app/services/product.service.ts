import { Injectable } from '@angular/core';
import { AngularFirestore} from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  searchFilter

  constructor( 
    public db: AngularFirestore 
    ){ 
  }

  getProducts(){
   return this.db.collection('products')
              .valueChanges()
  }   

  getProductBySku( sku ){
    return this.db.collection('products',
                ref => ref.where( 'sku', '==', sku ).limit(1) )
  }

  retrieveFilters(){
    return this.db.collection('filters').doc('product-filters')
               .valueChanges()
  }

  filter(  product, filter: String[]){
    if(filter.length == 0)
      return true

    for(let i = 0; i < filter.length; i++){
      if(product.searchable.includes(filter[i]))
        return true
    }

  }
  
}
