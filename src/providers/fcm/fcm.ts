import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class FcmProvider {

  constructor(private platform: Platform,
              public firebaseNative:Firebase,
              public http: HttpClient) {
    console.log('Hello FcmProvider Provider');
  }

  // Get permission from the user
  async getToken() {
    let token;

    if (this.platform.is('android')) {
      token = await this.firebaseNative.getToken()
    }

    if (this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    }

    // Post the token to your node server
    this.http.post("http://<ip_address_of_node_server>:3000/store", token)
      .subscribe(data => {
        console.log(JSON.stringify(data));
      }, error => {
        console.log("err");
        console.log(JSON.stringify(error));
      });
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen()
  }
}
