import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  template: `
    <div>
      <p>Explainer: <a [href]="explainer" target="_blank">{{ explainer }}</a>
      <p>You will need Version {{ minimumVersion }} or above.</p>
      <h3 class="text-2xl">Setup</h3>
      <ol class="list-decimal ml-[1rem]">
          @for (step of steps(); track $index) {
            <li class="leading-[1.5rem]">{{ step }}</li>
          }
      </ol>
    </div>
    <hr />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {
  explainer = 'https://github.com/webmachinelearning/prompt-api';
  minimumVersion = '136'

  steps = signal([
    'Open new tab, go to chrome://flags/#prompt-api-for-gemini-nano',
    'Select Enabled.',
    'Go to chrome://flags/#prompt-api-for-gemini-nano-multimodal-input',
    'Select Enabled.',
    'Go to chrome://flags/#writer-api-for-gemini-nano',
    'Select Enabled.',
    'Relaunch Chrome',
  ]);
}
