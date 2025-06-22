import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getBrowserName, getChromVersion, getFirefoxVersion } from './utils/user-agent-data';

@Component({
  selector: 'app-user-agent',
  standalone: true,
  template: `
    <div>
      <h3>User Agent</h3>
      <p>
        <span class="label">Browser Name: </span>{{ userAgent }}
      </p>
      @if (chromeVersion > 0) {
        <p>
          <span class="label">Chrome Version: </span>{{ chromeVersion }}
        </p>
      } @else if (firefoxVersion > 0) {
        <p>
          <span class="label">Firefox Version: </span>{{ firefoxVersion }}
        </p>
      }
    </div>
    <hr />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAgentComponent {
  userAgent = getBrowserName()
  chromeVersion = getChromVersion();
  firefoxVersion = getFirefoxVersion();
}
