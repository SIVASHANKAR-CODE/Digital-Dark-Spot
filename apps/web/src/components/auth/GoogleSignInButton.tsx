import React, { useEffect, useRef, useState } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  isLoading = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');

  useEffect(() => {
    // Read client ID from Vite environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setGoogleClientId(clientId);

    if (!clientId) return;

    // Function to initialize Google Identity Services
    const initGis = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential: string }) => {
              if (response.credential) {
                onSuccess(response.credential);
              } else {
                onError('Google authentication completed without receiving credentials.');
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            const availableWidth = containerRef.current.clientWidth || 360;
            const buttonWidth = Math.min(Math.max(availableWidth, 240), 400);

            window.google.accounts.id.renderButton(containerRef.current, {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonWidth,
            });
            setGisLoaded(true);
          }
        } catch (err: any) {
          console.warn('[GIS] Initialization warning:', err);
        }
      }
    };

    // Check if script is already present
    if (window.google?.accounts?.id) {
      initGis();
    } else {
      // Poll briefly for GIS script load
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGis();
        }
      }, 200);

      const timeout = setTimeout(() => clearInterval(interval), 6000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [onSuccess, onError]);

  const handleCustomClick = () => {
    if (disabled || isLoading) return;

    if (!googleClientId) {
      onError(
        'Google Client ID is not configured yet. Set VITE_GOOGLE_CLIENT_ID in your environment (.env).'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            console.log('[GIS] Prompt skipped or not displayed:', notification.getNotDisplayedReason?.());
          }
        });
      } catch (err: any) {
        onError(err.message || 'Unable to open Google sign-in dialog.');
      }
    } else {
      onError('Google Identity Services is loading. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Official GIS Button Container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center min-h-[44px] ${gisLoaded && !isLoading ? 'block' : 'hidden'}`}
      />

      {/* Fallback button when GIS is loading, not loaded yet, or client ID is missing */}
      {(!gisLoaded || isLoading) && (
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={disabled || isLoading}
          className="w-full relative flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin" />
          ) : (
            <>
              {/* Authentic Google 4-Color 'G' Logo */}
              <svg
                className="w-5 h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span className="truncate">Continue with Google</span>
            </>
          )}
        </button>
      )}

      {!googleClientId && (
        <p className="mt-1.5 text-[11px] text-slate-400 text-center font-normal">
          Google Cloud Client ID can be configured in <code className="font-mono text-slate-600">.env</code>
        </p>
      )}
    </div>
  );
}

