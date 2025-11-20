import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked {
  title = 'second-sprint-angular';

  chatInput: string = '';
  chatboxMessages: { message: string; type: 'incoming' | 'outgoing'; timestamp?: string }[] = [];
  isRateLimited: boolean = false;
  showPopup: boolean = false;

  @ViewChild('chatboxRef') chatboxRef!: ElementRef;

  constructor(private http: HttpClient) {}

  getTimestamp(): string {
    const now = new Date();
    return now.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  sendMessage(message: string) {
    if (!message || this.isRateLimited) {
      if (this.isRateLimited) {
        this.showPopup = true;
        setTimeout(() => this.showPopup = false, 2000);
      }
      return;
    }

    this.isRateLimited = true;
    setTimeout(() => this.isRateLimited = false, 2000);

    const timestamp = this.getTimestamp();

    // User message
    this.chatboxMessages.push({
      message: message,
      type: 'outgoing',
      timestamp
    });

    // "Düşünüyorum..." animation
    let dotCount = 0;
    let typingMessage = 'Düşünüyorum';
    const typingEntry = {
      message: typingMessage,
      type: 'incoming' as const
    };
    this.chatboxMessages.push(typingEntry);

    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      typingEntry.message = 'Düşünüyorum' + '.'.repeat(dotCount);
    }, 500);

    // Send request to FastAPI backend
    this.http.get<any>('http://localhost:8000/chat-response', {
      params: { user_input: message }
    }).subscribe({
      next: (response) => {
        clearInterval(interval);
        const index = this.chatboxMessages.indexOf(typingEntry);
        if (index !== -1) {
          this.chatboxMessages.splice(index, 1);
        }
        this.chatboxMessages.push({
          message: response.response || 'Bir hata oluştu.',
          type: 'incoming',
          timestamp: this.getTimestamp()
        });
      },
      error: (error) => {
        clearInterval(interval);
        const index = this.chatboxMessages.indexOf(typingEntry);
        if (index !== -1) {
          this.chatboxMessages.splice(index, 1);
        }
        this.chatboxMessages.push({
          message: 'Sunucuya bağlanılamadı.',
          type: 'incoming',
          timestamp: this.getTimestamp()
        });
      }
    });
  }

  handleSendClick() {
    if (this.isRateLimited) {
      this.showPopup = true;
      setTimeout(() => this.showPopup = false, 2000);
      return;
    }
    this.sendMessage(this.chatInput.trim());
    this.chatInput = '';
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendClick();
    }
  }

  isDarkMode: boolean = false;
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  scrollToBottom(): void {
    try {
      this.chatboxRef.nativeElement.scrollTop = this.chatboxRef.nativeElement.scrollHeight;
    } catch (err) {}
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
}