import { Injectable} from '@angular/core';
import { Product } from '../models/product';
import { Observable,ReplaySubject, of} from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import {  map,  switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { firestore } from 'firebase/app'

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartRef: AngularFirestoreDocument;
  public cart$: Observable<firebase.firestore.DocumentData>;
  private cartTotal = new ReplaySubject<Number>(1);
  private cartSize = new ReplaySubject<Number>(1);
  private cart = new ReplaySubject<any>(1);

  get displayCart() {

    this.cart$.subscribe( products => {
      let converted = this.convertCart(products)
      this.cart.next(converted)
    });

    return this.cart.asObservable();
  }

  get total(): Observable<Number> {

    this.cart$.pipe( 
      map( product => this.quantifyPrice( product ) ),
      map( totals => this.reducer( totals ) ))
      .subscribe( val => 
      this.cartTotal.next(val) );

    return this.cartTotal.asObservable();
  }

  get size(): Observable<Number> {

    this.cart$.pipe( 
      map( product => this.quantifySize(product) ),
      map( totals => this.reducer(totals) ))
      .subscribe( val => 
      this.cartSize.next(val));

    return this.cartSize.asObservable();
  }

 
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private fireAuth: AngularFireAuth
  ) { 
    this.cart$ = this.fireAuth.authState.pipe(
       switchMap( user => {
        if ( user ){
          this.cartRef = db.doc<Product>(`carts/${user.uid}`);
          return this.cart$ = this.cartRef.valueChanges();
        } else {
          this.cartSize.unsubscribe
          this.cartTotal.unsubscribe
          return of(null)
        }
       }))
  }


  createInventoryArray( inventory ): Number[]{
    let inventoryArray: Number[]= [];

    for(let i = 1; i < inventory + 1; i++){
      inventoryArray.push(i);
    }
    return inventoryArray;
  }

  addToCart( product: Product, quantity: number){
    let productToAdd = {
      [product.sku] : {
        main: product.main,
        sku: product.sku,
        title: product.title,
        type: product.type,
        quantity: quantity,
        parent: product.parent,
        price: product.price,
        inventory: product.inventory
      }
    }

    this.cartRef.set( productToAdd, { merge: true } )
      .catch( err => {
      console.log(err);
    });
  }

  async removeCartItem( product ){
    //  find sku and remove
    this.cartRef.update({
      [product.sku] : firestore.FieldValue.delete()
    });

  }

  filterResults( filters: string[] , results: Product[] ){
    const newResults = [];

    for( let i = 0; i < results.length; i++){
      if( filters.filter( term => results[i].categories.includes(term)) ){
        newResults.push( results[i] )
      } 
    }

    return newResults;
  }

  // Calculation methods 

  private quantifyPrice( product ){
    return Object.keys(product).map( key => product[key].price * product[key].quantity );
  }

  private quantifySize( product ){
    return Object.keys(product).map( key => product[key].quantity );
  }

  private reducer( totals ){
    return totals.reduce( ( a , b) => a + b, 0);
  }

  private convertCart( obj ){
    let keys = Object.keys(obj);
    let newObj = [];

    for( let prop of keys){
      newObj.push(obj[prop])
    }

    return newObj
  }
  
  }
  

