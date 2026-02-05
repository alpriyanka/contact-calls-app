(function ($) {
  'use strict';
  
  console.log('App.js loaded, jQuery available:', typeof $ !== 'undefined');

  // ===========================
  // Storage Management
  // ===========================
  const Storage = {
    CONTACTS_KEY: 'contacts_db',
    CALL_LOGS_KEY: 'call_logs_db',

    getContacts() {
      const data = localStorage.getItem(this.CONTACTS_KEY);
      return data ? JSON.parse(data) : [];
    },

    saveContacts(contacts) {
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    },

    addContact(name, phone) {
      const contacts = this.getContacts();
      const id = Date.now().toString();
      contacts.push({ id, name, phone, createdAt: new Date().toISOString() });
      this.saveContacts(contacts);
      return { id, name, phone };
    },

    deleteContact(id) {
      let contacts = this.getContacts();
      contacts = contacts.filter(c => c.id !== id);
      this.saveContacts(contacts);
    },

    getCallLogs() {
      const data = localStorage.getItem(this.CALL_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    },

    saveCallLogs(logs) {
      localStorage.setItem(this.CALL_LOGS_KEY, JSON.stringify(logs));
    },

    addCallLog(contactId, contactName, duration, type = 'outgoing') {
      const logs = this.getCallLogs();
      logs.unshift({
        id: Date.now().toString(),
        contactId,
        contactName,
        duration,
        type,
        timestamp: new Date().toISOString()
      });
      this.saveCallLogs(logs);
    }
  };

  // ===========================
  // Voice Control
  // ===========================
  const VoiceControl = {
    recognition: null,
    isListening: false,

    init() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
        return;
      }
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;

      this.recognition.onresult = (e) => this.handleResult(e);
      this.recognition.onerror = (e) => console.warn('Voice error:', e.error);
    },

    start() {
      if (!this.recognition) return;
      this.isListening = true;
      this.recognition.start();
    },

    stop() {
      if (!this.recognition) return;
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {}
    },

    handleResult(event) {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .toLowerCase();

      const isInCall = !$('#call-screen').hasClass('hidden');
      const isIncomingCall = !$('#incoming-call-modal').hasClass('hidden');

      if (isInCall) {
        this.handleCallCommands(transcript);
      } else if (isIncomingCall) {
        this.handleIncomingCommands(transcript);
      }
    },

    handleCallCommands(transcript) {
      if (transcript.includes('mute')) {
        App.toggleMute();
      } else if (transcript.includes('speaker')) {
        App.toggleSpeaker();
      } else if (transcript.includes('end') || transcript.includes('hang up')) {
        App.endCall();
      } else if (transcript.includes('volume up')) {
        App.volumeUp();
      } else if (transcript.includes('volume down')) {
        App.volumeDown();
      }
    },

    handleIncomingCommands(transcript) {
      if (transcript.includes('answer') || transcript.includes('accept')) {
        App.acceptCall();
      } else if (transcript.includes('reject') || transcript.includes('decline')) {
        App.rejectCall();
      }
    }
  };

  // ===========================
  // Call Management
  // ===========================
  const CallManager = {
    currentCall: null,
    isMuted: false,
    isSpeakerOn: false,
    callStartTime: null,
    durationInterval: null,

    startCall(contact) {
      this.currentCall = contact;
      this.callStartTime = Date.now();
      this.isMuted = false;
      this.isSpeakerOn = false;
      this.updateUI();
      this.startDurationTimer();
      VoiceControl.start();
    },

    endCall() {
      if (!this.currentCall) return;

      const duration = this.calculateDuration();
      Storage.addCallLog(this.currentCall.id, this.currentCall.name, duration, 'outgoing');

      clearInterval(this.durationInterval);
      this.currentCall = null;
      this.callStartTime = null;
      VoiceControl.stop();
      App.closeCallScreen();
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.updateUI();
    },

    toggleSpeaker() {
      this.isSpeakerOn = !this.isSpeakerOn;
      this.updateUI();
    },

    volumeUp() {
      console.log('Volume up');
    },

    volumeDown() {
      console.log('Volume down');
    },

    calculateDuration() {
      if (!this.callStartTime) return 0;
      return Math.floor((Date.now() - this.callStartTime) / 1000);
    },

    startDurationTimer() {
      this.durationInterval = setInterval(() => {
        this.updateDurationDisplay();
      }, 1000);
    },

    updateDurationDisplay() {
      const seconds = this.calculateDuration();
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      $('#call-duration').text(formatted);
    },

    updateUI() {
      const muteBtn = $('.mute-btn');
      const speakerBtn = $('.speaker-btn');
      muteBtn.toggleClass('active', this.isMuted);
      speakerBtn.toggleClass('active', this.isSpeakerOn);
    }
  };

  // ===========================
  // UI Management
  // ===========================
  const UI = {
    renderContacts() {
      const contacts = Storage.getContacts();
      const callList = $('#call-list');

      if (contacts.length === 0) {
        $('#empty-state').show();
        callList.html('');
        return;
      }

      $('#empty-state').hide();
      const callLogs = Storage.getCallLogs();

      const html = contacts.map(contact => {
        const logs = callLogs.filter(log => log.contactId === contact.id);
        const lastCall = logs[0];
        const callCount = logs.length;

        return `
          <li class="call-card contact-card" data-contact-id="${contact.id}">
            <div class="call-avatar contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
            <div class="call-info contact-info">
              <div class="call-name contact-name">${contact.name} ${callCount > 0 ? `<span class="badge-count">(${callCount})</span>` : ''}</div>
              <div class="call-meta contact-phone">${contact.phone}</div>
              ${lastCall ? `<div class="call-meta">${UI.getCallTypeIcon(lastCall.type)} ${UI.formatCallTime(lastCall.timestamp)}</div>` : ''}
            </div>
            <div class="contact-actions">
              <button type="button" class="call-btn" aria-label="Call">📞</button>
              <button type="button" class="delete-contact-btn" data-contact-id="${contact.id}" aria-label="Delete">🗑️</button>
            </div>
          </li>
        `;
      }).join('');

      callList.html(html);
      this.bindContactEvents();
    },

    renderCallLogs() {
      const logs = Storage.getCallLogs();
      const callList = $('#call-list');

      if (logs.length === 0) {
        $('#empty-state').show();
        callList.html('');
        return;
      }

      $('#empty-state').hide();

      const html = logs.map(log => {
        return `
          <li class="call-card">
            <div class="call-avatar contact-avatar">${log.contactName.charAt(0).toUpperCase()}</div>
            <div class="call-info contact-info">
              <div class="call-name contact-name">${log.contactName}</div>
              <div class="call-meta">${UI.getCallTypeIcon(log.type)} ${UI.formatCallTime(log.timestamp)} · ${UI.formatDuration(log.duration)}</div>
            </div>
            <button type="button" class="call-btn" aria-label="Call">📞</button>
          </li>
        `;
      }).join('');

      callList.html(html);
      this.bindCallLogEvents();
    },

    getCallTypeIcon(type) {
      return type === 'incoming' ? '↙' : '↗';
    },

    formatCallTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      return date.toLocaleDateString();
    },

    formatDuration(seconds) {
      if (seconds < 60) return `${seconds}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    },

    bindContactEvents() {
      $('.contact-card').on('click', function (e) {
        if ($(e.target).hasClass('delete-contact-btn') || $(e.target).hasClass('call-btn')) {
          return;
        }
        const contactId = $(this).data('contact-id');
        const contacts = Storage.getContacts();
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          App.makeCall(contact);
        }
      });

      $('.contact-card .call-btn').on('click', function (e) {
        e.stopPropagation();
        const contactId = $(this).closest('.contact-card').data('contact-id');
        const contacts = Storage.getContacts();
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          App.makeCall(contact);
        }
      });

      $('.delete-contact-btn').on('click', function (e) {
        e.stopPropagation();
        const contactId = $(this).data('contact-id');
        const contacts = Storage.getContacts();
        const contact = contacts.find(c => c.id === contactId);
        if (contact && confirm(`Delete contact "${contact.name}"?`)) {
          Storage.deleteContact(contactId);
          UI.renderContacts();
        }
      });
    },

    bindCallLogEvents() {
      $('.call-card .call-btn').on('click', function (e) {
        e.stopPropagation();
        const name = $(this).closest('.call-card').find('.contact-name').text();
        const contacts = Storage.getContacts();
        const contact = contacts.find(c => c.name === name);
        if (contact) {
          App.makeCall(contact);
        }
      });
    }
  };

  // ===========================
  // Main App
  // ===========================
  const App = {
    init() {
      VoiceControl.init();
      this.setupEventListeners();
      this.renderInitialUI();
    },

    setupEventListeners() {
      // Device toolbar
      $('#device-select').on('change', function () {
        $('#device-frame').attr('data-device', $(this).val());
      });

      $('#fullscreen-btn').on('click', function () {
        $('#device-frame').toggleClass('fullscreen');
        $(this).text($('#device-frame').hasClass('fullscreen') ? 'Exit fullscreen' : 'Fullscreen frame');
      });

      // Hamburger Menu
      $('.menu-btn').on('click', () => this.openSidebar());
      $('.close-sidebar-btn, #sidebar-overlay').on('click', () => this.closeSidebar());

      // Sidebar menu items
      $('.sidebar-item').on('click', function () {
        const menu = $(this).data('menu');
        App.closeSidebar();
        App.handleMenuClick(menu);
      });

      // Voice Demo Button
      $('.voice-demo-btn').on('click', () => this.openVoiceDemo());
      $('#voice-demo-modal .close-btn').on('click', () => this.closeVoiceDemo());
      $('#voice-demo-modal').on('click', (e) => {
        if (e.target.id === 'voice-demo-modal') this.closeVoiceDemo();
      });

      // Tabs
      $('.tab').on('click', function () {
        const tab = $(this).data('tab');
        $('.tab').removeClass('active');
        $(this).addClass('active');
        App.updateContentByTab(tab);
      });

      // Search
      $('.search-input').on('input', function () {
        const q = $(this).val().toLowerCase();
        $('.contact-card').each(function () {
          const text = $(this).find('.contact-name').text().toLowerCase();
          $(this).toggle(text.indexOf(q) !== -1);
        });
      });

      // Add contact button
      $('#create-contact-btn').on('click', () => this.openContactModal());

      // Contact form
      $('#contact-form').on('submit', (e) => {
        e.preventDefault();
        const name = $('#contact-name').val().trim();
        const phone = $('#contact-phone').val().trim();
        if (name && phone) {
          Storage.addContact(name, phone);
          this.closeContactModal();
          UI.renderContacts();
        }
      });

      // Contact modal close
      $('#contact-modal .close-btn').on('click', () => this.closeContactModal());
      $('#contact-modal').on('click', (e) => {
        if (e.target.id === 'contact-modal') this.closeContactModal();
      });

      // Help modal
      $('#help-modal .close-btn').on('click', () => this.closeHelpModal());
      $('#close-help-btn').on('click', () => this.closeHelpModal());
      $('#help-modal').on('click', (e) => {
        if (e.target.id === 'help-modal') this.closeHelpModal();
      });

      // Settings modal
      $('#settings-modal .close-btn').on('click', () => this.closeSettingsModal());
      $('#close-settings-btn').on('click', () => this.closeSettingsModal());
      $('#clear-all-btn').on('click', () => this.clearAllData());
      $('#settings-modal').on('click', (e) => {
        if (e.target.id === 'settings-modal') this.closeSettingsModal();
      });

      // Feedback modal
      $('#feedback-modal .close-btn').on('click', () => this.closeFeedbackModal());
      $('#feedback-form').on('submit', (e) => {
        e.preventDefault();
        this.submitFeedback();
      });
      $('#feedback-modal').on('click', (e) => {
        if (e.target.id === 'feedback-modal') this.closeFeedbackModal();
      });

      // Voice test button
      $('.test-voice-btn').on('click', () => this.testMicrophone());

      // Incoming call modal
      $('#incoming-call-modal .action-accept').on('click', () => this.acceptCall());
      $('#incoming-call-modal .action-reject').on('click', () => this.rejectCall());

      // Call screen
      $('#call-screen .close-call-btn').on('click', () => this.endCall());
      $('#call-screen .mute-btn').on('click', () => CallManager.toggleMute());
      $('#call-screen .speaker-btn').on('click', () => CallManager.toggleSpeaker());
      $('#call-screen .end-btn').on('click', () => this.endCall());
    },

    handleMenuClick(menu) {
      switch (menu) {
        case 'calls-history':
          this.updateContentByTab('all');
          break;
        case 'contacts':
          this.updateContentByTab('contacts');
          break;
        case 'settings':
          this.openSettingsModal();
          break;
        case 'help':
          this.openHelpModal();
          break;
        case 'feedback':
          this.openFeedbackModal();
          break;
      }
    },

    openSidebar() {
      $('#sidebar-menu').addClass('visible').removeClass('hidden');
      $('#sidebar-overlay').addClass('visible').removeClass('hidden');
    },

    closeSidebar() {
      $('#sidebar-menu').removeClass('visible').addClass('hidden');
      $('#sidebar-overlay').removeClass('visible').addClass('hidden');
    },

    openVoiceDemo() {
      $('#voice-demo-modal').removeClass('hidden');
    },

    closeVoiceDemo() {
      $('#voice-demo-modal').addClass('hidden');
    },

    openHelpModal() {
      $('#help-modal').removeClass('hidden');
    },

    closeHelpModal() {
      $('#help-modal').addClass('hidden');
    },

    openSettingsModal() {
      const contacts = Storage.getContacts();
      const logs = Storage.getCallLogs();
      $('#contact-count').text(contacts.length);
      $('#call-count').text(logs.length);
      $('#settings-modal').removeClass('hidden');
    },

    closeSettingsModal() {
      $('#settings-modal').addClass('hidden');
    },

    openFeedbackModal() {
      $('#feedback-modal').removeClass('hidden');
    },

    closeFeedbackModal() {
      $('#feedback-modal').addClass('hidden');
    },

    submitFeedback() {
      const type = $('#feedback-type').val();
      const message = $('#feedback-message').val();
      if (type && message) {
        alert('Thank you for your feedback! 💬');
        $('#feedback-form')[0].reset();
        this.closeFeedbackModal();
      }
    },

    clearAllData() {
      if (confirm('Are you sure you want to delete all contacts and call history? This cannot be undone.')) {
        localStorage.clear();
        alert('All data has been cleared.');
        this.closeSettingsModal();
        this.renderInitialUI();
      }
    },

    testMicrophone() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech Recognition not supported in your browser. Try Chrome, Edge, or Safari.');
        return;
      }
      alert('Microphone test: Say something! Check your browser console for results.');
      const recognition = new SpeechRecognition();
      recognition.onstart = () => console.log('Listening...');
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        console.log('You said:', transcript);
        alert(`You said: "${transcript}"`);
      };
      recognition.start();
    },

    renderInitialUI() {
      const contacts = Storage.getContacts();
      if (contacts.length === 0) {
        $('#empty-state').show();
      } else {
        this.updateContentByTab('all');
      }
    },

    updateContentByTab(tab) {
      switch (tab) {
        case 'contacts':
          UI.renderContacts();
          break;
        case 'all':
        case 'missed':
        default:
          UI.renderCallLogs();
          break;
      }
    },

    openContactModal() {
      $('#contact-modal').removeClass('hidden');
      $('#contact-name').focus();
    },

    closeContactModal() {
      $('#contact-modal').addClass('hidden');
      $('#contact-form')[0].reset();
    },

    makeCall(contact) {
      $('#call-name-display').text(contact.name);
      $('#call-avatar-text').text(contact.name.charAt(0).toUpperCase());
      $('#call-duration').text('00:00');
      $('#call-screen').removeClass('hidden');
      CallManager.startCall(contact);
    },

    closeCallScreen() {
      $('#call-screen').addClass('hidden');
      UI.renderCallLogs();
    },

    acceptCall() {
      $('#incoming-call-modal').addClass('hidden');
    },

    rejectCall() {
      $('#incoming-call-modal').addClass('hidden');
    },

    endCall() {
      CallManager.endCall();
    },

    toggleMute() {
      CallManager.toggleMute();
    },

    toggleSpeaker() {
      CallManager.toggleSpeaker();
    },

    volumeUp() {
      CallManager.volumeUp();
    },

    volumeDown() {
      CallManager.volumeDown();
    }
  };

  // Initialize when DOM is ready
  $(document).ready(() => App.init());

  // Expose for testing
  window.App = App;
  window.Storage = Storage;
  window.VoiceControl = VoiceControl;

})(jQuery);
