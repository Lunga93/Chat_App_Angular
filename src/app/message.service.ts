import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, Firestore, DocumentData } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private socket: Socket;
  private db: Firestore;
  private messages: string[] = [];
  private messagesSubject = new BehaviorSubject<string[]>([]);
  private auth = getAuth();

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.socket = io('http://localhost:3000');

    this.initializeSocketListeners();
    this.initializeFirestoreListeners();
  }

  private initializeSocketListeners() {
    this.socket.on('new-message', (message: string) => {
      this.addMessageToList(message);
    });
  }

  private initializeFirestoreListeners() {
    const messagesRef = collection(this.db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => doc.data().text).reverse();
      this.messages = newMessages;
      this.messagesSubject.next(this.messages);
    });
  }

  getMessages(): Observable<string[]> {
    return this.messagesSubject.asObservable();
  }

  addMessage(message: string): void {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const messageData = {
      text: message,
      timestamp: new Date(),
      userId: user.uid
    };

    this.socket.emit('new-message', messageData);

    const messagesRef = collection(this.db, 'messages');
    addDoc(messagesRef, messageData).catch(error => console.error('Error adding document to Firestore:', error));

    this.addMessageToList(message);
  }

  private addMessageToList(message: string) {
    this.messages.push(message);
    this.messagesSubject.next(this.messages);
  }
}