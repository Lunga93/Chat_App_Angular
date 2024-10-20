import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../message.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('messageAnimation', [
      transition('void => new', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonAnimation', [
      transition(':active', [
        style({ transform: 'scale(0.95)' }),
        animate('100ms', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ChatComponent implements OnInit {
  messages: string[] = [];
  newMessage: string = '';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messageService.getMessages().subscribe((messages: string[]) => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messageService.addMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  scrollToBottom() {
    const scrollContainer = document.querySelector('.messages');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
}