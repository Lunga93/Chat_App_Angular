import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, Firestore, DocumentData, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDU4LuIqEN90omIf642TTuBqgb6UAJ01OI",
  authDomain: "angular-chat-app-9f721.firebaseapp.com",
  projectId: "angular-chat-app-9f721",
  storageBucket: "angular-chat-app-9f721.appspot.com",
  messagingSenderId: "760339020470",
  appId: "1:760339020470:web:7ad1c00da8f69a1f3fc417",
  measurementId: "G-PRMSYFBWJS"
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
      const newMessages = snapshot.docs.map(doc => doc.data()['text']).reverse();
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
      timestamp: serverTimestamp(),
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