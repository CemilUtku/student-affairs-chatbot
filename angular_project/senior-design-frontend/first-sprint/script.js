const sendChatBtn = document.querySelector(".chat-input span");
const chatInput = document.querySelector(".chat-input textarea");
const chatbox = document.querySelector(".chatbox");
const faqItems = document.querySelectorAll(".faq-item");
const darkModeToggle = document.querySelector(".dark-mode-toggle");

let userMessage;
let isRateLimited = false;

const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const predefinedResponses = {
  "Ders programlarını nereden görüntüleyebilirim?":
    "OBS’de ders programı görüntüleme ekranından ulaşabilirsiniz.",
  "OBS/EYS’ye nasıl girilir?":
    "Öğrenci Bilgi Sistemi (OBS) giriş bilgileriniz ile Eğitim Yönetim Sistemi (EYS) giriş bilgileriniz aynıdır. Giriş için kullanıcı adınız öğrenci numaranızdır. Sisteme ilk kez giriş yaparken obs.acibadem.edu.tr/oibs/std/login.aspx adresinden şifre sıfırla yaparak yeni bir şifre oluşturabilirsiniz. OBS’ye giriş yaptıktan sonra aynı bilgilerle EYS’ye giriş yapamıyorsanız egitim.teknolojileri@acibadem.edu.tr adresine mail gönderebilirsiniz.",
  "Okul kimlik kartımı kaybettim, ne yapabilirim?":
    "Konu hakkında oryantasyonda da bilgi verilmiştir. Dolaplarla, öğrenci kimlik kartları ile Kart Merkezi (A blok giriş) ilgilenmektedir,  kartmerkezi@acibadem.edu.tr adresine e-posta atabilirsiniz.",
  "Sınav tarihleri nerede ve ne zaman açıklanacak?":
    "Okulun web sitesi > Öğrenci > Öğrenci İşleri > Akademik Takvim",
  "Dönem başlangıç ve bitiş tarihleri nedir?":
    "Dönem başlangıç ve bitiş tarihleri akademik takvimde yer almaktadır.",
  "Okulun önünden geçen otobüs hatları nelerdir?":
    "Kadıköy rıhtımdan 19K, 19Y, 19V, 19S, 19T, 14A. Üsküdar’dan 11T, 320A otobüslerini kullanarak ‘Acıbadem Üniversitesi’ durağında inip ACU’ya ulaşım kolayca sağlanmaktadır.",
};

const showRateLimitPopup = () => {
  let popup = document.querySelector(".rate-limit-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "rate-limit-popup";
    popup.textContent =
      "Lütfen yeni bir mesaj göndermeden önce birkaç saniye bekleyin";
    document.body.appendChild(popup);
  }

  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
};
/* 
const createQuickReplies = () => {
  const quickReplyContainer = document.createElement("div");
  quickReplyContainer.classList.add("quick-reply");

  const yesButton = document.createElement("button");
  yesButton.textContent = "Evet";
  yesButton.addEventListener("click", () => {
    quickReplyContainer.remove();
    sendQuickReply("Evet");
  });

  const noButton = document.createElement("button");
  noButton.textContent = "Hayır";
  noButton.addEventListener("click", () => {
    quickReplyContainer.remove();
    sendQuickReply("Hayır");
  });

  quickReplyContainer.appendChild(yesButton);
  quickReplyContainer.appendChild(noButton);

  chatbox.appendChild(quickReplyContainer);
  chatbox.scrollTop = chatbox.scrollHeight;
};

const sendQuickReply = (response) => {
  sendMessage(response);
}; */

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);

  const timestamp = `<small style="display: block; font-size: 0.75rem; color: #888; 
  margin-top: 5px;">${getTimestamp()}</small>`;

  let chatContent =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span>
                    <img src="logo-transparent.png" alt="Chatbot Logo" style="width: 32px; height: 32px;">
                    </span><p>${message}</p>${timestamp}`;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

const sendMessage = (message) => {
  if (!message) return;
  chatbox.appendChild(createChatLi(message, "outgoing"));

  const typingMessage = createChatLi(
    "Düşünüyorum<span class='dots'></span>",
    "incoming"
  );
  chatbox.appendChild(typingMessage);
  chatbox.scrollTop = chatbox.scrollHeight;

  const dots = typingMessage.querySelector(".dots");
  let dotCount = 0;
  const typingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    dots.innerHTML = ".".repeat(dotCount);
  }, 500);

  setTimeout(() => {
    clearInterval(typingInterval);
    typingMessage.remove();
    const botMessage = predefinedResponses[message] || "İşte Cevabım!";
    chatbox.appendChild(createChatLi(botMessage, "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;

    // createQuickReplies();
  }, 2000);
};

const handleChat = () => {
  if (isRateLimited) {
    showRateLimitPopup();
    return;
  }

  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  sendMessage(userMessage);

  chatInput.value = "";

  isRateLimited = true;
  setTimeout(() => {
    isRateLimited = false;
  }, 2000);
};

sendChatBtn.addEventListener("click", handleChat);

faqItems.forEach((item) => {
  item.addEventListener("click", () => {
    const faqMessage = item.textContent.trim();
    sendMessage(faqMessage);
  });
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (isRateLimited) {
      showRateLimitPopup();
      return;
    }

    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    sendMessage(userMessage);
    chatInput.value = "";

    isRateLimited = true;
    setTimeout(() => {
      isRateLimited = false;
    }, 2000);
  }
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "☀️";
  } else {
    darkModeToggle.textContent = "🌙";
  }
});
