import { EventBus } from '@app/events/event-bus';
import { Events } from '@app/events/events';

/**
 * GA4 measurement ID for app.signalrange.space.
 *
 * THIS IS THE ONE-LINE SWAP POINT: replace the placeholder with the real
 * measurement ID (e.g. 'G-XXXXXXXXXX') and analytics goes live. While the
 * placeholder is in place, nothing is loaded and nothing is sent.
 */
export const GA4_MEASUREMENT_ID: string = 'G-QNLH2DZXEK';

/** Sentinel meaning "not configured yet" — must never equal a real ID. */
const PLACEHOLDER_ID = 'G-PLACEHOLDER';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Standard GA4 gtag.js tagging for the SPA.
 *
 * The app is client-side routed (see Router), so the automatic first
 * page_view is suppressed (`send_page_view: false`) and one page_view is
 * emitted per ROUTE_CHANGED event instead. The initial route also fires
 * ROUTE_CHANGED during Router.init(), so call Analytics.init() BEFORE
 * App.create() and every route (including the first) is counted exactly once.
 */
export class Analytics {
  private static isInitialized_ = false;

  static init(): void {
    if (Analytics.isInitialized_) {
      return;
    }
    if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === PLACEHOLDER_ID) {
      // Measurement ID not configured yet: stay completely dark.
      return;
    }
    Analytics.isInitialized_ = true;

    window.dataLayer = window.dataLayer ?? [];
    // gtag.js requires Arguments objects on the dataLayer, so this must be a
    // plain function using `arguments`, not a rest-args push of an array.
    const gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as (...args: unknown[]) => void;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });

    EventBus.getInstance().on(Events.ROUTE_CHANGED, ({ path }) => {
      gtag('event', 'page_view', {
        page_path: path,
        page_location: globalThis.location.href,
        page_title: document.title,
      });
    });
  }
}
