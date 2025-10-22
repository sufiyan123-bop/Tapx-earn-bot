// Telegram WebApp initialization script
(function() {
  // Check if Telegram WebApp is available
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Initialize the WebApp
    tg.ready();
    
    // Expand to full height
    tg.expand();
    
    // Set theme colors
    tg.setHeaderColor('#1e293b'); // slate-800
    tg.setBackgroundColor('#0f172a'); // slate-900
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Log WebApp info for debugging
    console.log('Telegram WebApp initialized:', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      user: tg.initDataUnsafe.user,
      startParam: tg.initDataUnsafe.start_param
    });
    
    // Handle theme changes
    tg.onEvent('themeChanged', function() {
      console.log('Theme changed to:', tg.colorScheme);
      // Update CSS custom properties based on theme
      document.documentElement.setAttribute('data-theme', tg.colorScheme);
    });
    
    // Handle viewport changes
    tg.onEvent('viewportChanged', function() {
      console.log('Viewport changed:', {
        height: tg.viewportHeight,
        stableHeight: tg.viewportStableHeight,
        isExpanded: tg.isExpanded
      });
    });
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
    
  } else {
    console.warn('Telegram WebApp not available. Running in browser mode.');
    
    // Mock Telegram WebApp for development
    if (typeof window !== 'undefined' && !window.Telegram) {
      window.Telegram = {
        WebApp: {
          initData: '',
          initDataUnsafe: {
            user: {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'en',
            },
            start_param: null,
            auth_date: Date.now(),
            hash: 'test_hash'
          },
          version: '6.0',
          platform: 'web',
          colorScheme: 'dark',
          themeParams: {
            bg_color: '#0f172a',
            text_color: '#ffffff',
            hint_color: '#64748b',
            link_color: '#3b82f6',
            button_color: '#3b82f6',
            button_text_color: '#ffffff'
          },
          isExpanded: true,
          viewportHeight: window.innerHeight,
          viewportStableHeight: window.innerHeight,
          headerColor: '#1e293b',
          backgroundColor: '#0f172a',
          isClosingConfirmationEnabled: false,
          ready: function() {
            console.log('Mock Telegram WebApp ready');
          },
          expand: function() {
            console.log('Mock Telegram WebApp expand');
          },
          close: function() {
            console.log('Mock Telegram WebApp close');
          },
          MainButton: {
            text: '',
            color: '#3b82f6',
            textColor: '#ffffff',
            isVisible: false,
            isProgressVisible: false,
            isActive: true,
            setText: function(text) { this.text = text; },
            onClick: function(callback) { this._callback = callback; },
            show: function() { this.isVisible = true; },
            hide: function() { this.isVisible = false; },
            enable: function() { this.isActive = true; },
            disable: function() { this.isActive = false; }
          },
          HapticFeedback: {
            impactOccurred: function(style) {
              console.log('Haptic feedback:', style);
            },
            notificationOccurred: function(type) {
              console.log('Notification feedback:', type);
            },
            selectionChanged: function() {
              console.log('Selection changed feedback');
            }
          },
          onEvent: function(event, callback) {
            console.log('Event listener added:', event);
          },
          setHeaderColor: function(color) {
            this.headerColor = color;
          },
          setBackgroundColor: function(color) {
            this.backgroundColor = color;
          },
          enableClosingConfirmation: function() {
            this.isClosingConfirmationEnabled = true;
          }
        }
      };
    }
  }
})();