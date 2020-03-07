import { Injectable, Output, EventEmitter } from '@angular/core';
import { Product } from '../models/product';
import { Observable, BehaviorSubject, ReplaySubject, of, from } from 'rxjs';
import { CartProduct } from '../models/cartProduct';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { take, map, pluck, reduce, switchMap, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { firestore } from 'firebase/app'
import { convertPropertyBinding } from '@angular/compiler/src/compiler_util/expression_converter';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartRef: AngularFirestoreDocument;
  public cart$: Observable<firebase.firestore.DocumentData>;
  private cartTotal = new ReplaySubject<Number>(1);
  private cartSize = new ReplaySubject<Number>(1);
  private cart = new ReplaySubject<any>(1);
  // cartTotal;

  get displayCart() {

    this.cart$.subscribe( products => {
      let converted = this.convertCart(products)
      console.log(converted)
      this.cart.next(converted)
    });

    return this.cart.asObservable();
  }

  get total(): Observable<Number> {

    this.cart$.pipe( 
      map( product => 
        Object.keys(product).map( key => product[key].price * product[key].quantity ) ),
      map( totals => 
        totals.reduce( ( a , b) => a + b, 0) ))
      .subscribe( val => 
      this.cartTotal.next(val));

    return this.cartTotal.asObservable();
    
  }

  get size(): Observable<Number> {

    this.cart$.pipe( 
      map( product => 
        Object.keys(product).map( key => product[key].quantity ) ),
      map( totals => 
        totals.reduce( ( a , b) => a + b, 0) ))
      .subscribe( val => 
      this.cartSize.next(val));

    return this.cartSize.asObservable();
  }

 
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private fireAuth: AngularFireAuth
  ) { 
    this.fireAuth.authState.subscribe( user => console.log(user))
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

  private convertCart( obj ){
    let keys = Object.keys(obj);
    let newObj = [];

    for( let prop of keys){
      newObj.push(obj[prop])
    }

    return newObj
  }

  createInventoryArray( inventory ): Number[]{
    let inventoryArray: Number[]= [];

    for(let i = 1; i < inventory + 1; i++){
      inventoryArray.push(i)
    }
    return inventoryArray
  }

  addToCart( product: Product, quantity: number){
    let productToAdd = {
      [product.sku] : {
        sku: product.sku,
        title: product.title,
        type: product.type,
        quantity: quantity,
        parent: product.parent,
        price: product.price
      }
    }

    this.cartRef.set( productToAdd, { merge: true } )
      .catch( err => {
      console.log(err)
    })
  }

  async removeCartItem( product ){
    //  find sku and remove
    this.cartRef.update({
      [product.sku] : firestore.FieldValue.delete()
    })

  }

  //   )
  // }

  // addProductToCart(product: Product, total: number){
  //   const{ amount, parent, type, title } = product
  //   const cartProduct = { amount, parent, type, title }
    
  //   for(let i = 0; i < total; i++){
  //   this.storage.push(cartProduct);

  //   localStorage.setItem(
  //       'products',
  //       JSON.stringify(this.storage)
  //     );
  //   }
  // }

  // getProductsFromCart(){
  //   return JSON.parse(localStorage.getItem('products'));

  // }

  // removeAllProductsFromCart(){
  //   this.storage = [];
  //   localStorage.clear;

  // }

  // removeProductFromCart(product: Product){
  //   let storage = JSON.parse( localStorage.getItem( 'products' ));

  //   let removed = storage.filter( product.sku != product.sku );
    
  //   let updated = JSON.stringify( removed );
  //   localStorage.setItem( 'products', updated )

  //   }

    // Update cart count

  }
  

