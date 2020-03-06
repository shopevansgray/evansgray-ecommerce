import { Component, OnInit, Output, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoginModalService } from 'src/app/services/login-modal.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() toggleLoginFrom: boolean;
  size: Observable<Number>;
  toggleModal: boolean;
  clearImg: boolean = false;
  
  constructor( 
        private auth: AuthService,
        public modal: LoginModalService,
        private cartService: CartService,
        public router: Router,
        private fireAuth: AngularFireAuth
        ) { 
      }

  ngOnInit() {
    this.modal.toggleModal.subscribe( bool => this.toggleModal = bool ); 
    this.fireAuth.authState.subscribe( user => {
      if(user){
        this.size = this.cartService.size
      }
    })
  }

   
    firstName( displayName: string ) : string{
      let name = displayName.split(' ')
      return name.length > 0 ? name[0] : displayName;
    }

    openModal(){
      this.modal.toggleModal.emit(true)
    }

    close(){
      this.modal.toggleModal.emit(false)
    }

    toggleImg(){
      this.clearImg = !this.clearImg;
    }

}
