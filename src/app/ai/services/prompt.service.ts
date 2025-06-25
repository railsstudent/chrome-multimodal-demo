import { Injectable, OnDestroy, signal } from '@angular/core';
import { LANGUAGE_MODEL_OPTIONS } from '../constants/language-model-options.constant';

@Injectable({
  providedIn: 'root'
})
export class PromptService implements OnDestroy  {
    #controller = new AbortController();
    #strError = signal('');
    error = this.#strError.asReadonly();
    #session = signal<LanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NetworkError': 'The network is not available to download the AI model.',
        'NotAllowedError': 'The session is not allowed to create.',
        'OperationError': 'Operation error occurred when creating the session for the options',
        'QuotaExceededError': 'Prompt API Quota exceeded. Please try again later.',
        'UnknownError': 'Unknown error occurred while using the session.',
        'TypeError': 'Invalid type and value combination in the multimodal input.',
        'EncodingError': 'Multimodal input (e.g. image or audio) does not support the format or error in decoding the data',
    }

    async init() {
        try {
            const session = await LanguageModel.create({
                ...LANGUAGE_MODEL_OPTIONS,
                signal: this.#controller.signal,
                monitor: (monitor: CreateMonitor) => 
                    monitor.addEventListener("downloadprogress", (e) => {
                        const percentage = Math.floor(e.loaded * 100);
                        console.log(`Language Model: Downloaded ${percentage}%`);
                    }),
                initialPrompts: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that can transcribe the audio file.'
                    },
                ]
            });

            this.#session.set(session);
        } catch (error) {
            this.handleErrors(error);
            this.#session.set(undefined); // Reset session on error
        }
    }

    async transcribeAudio(audioBlob: Blob): Promise<string> {
        this.#strError.set(''); // Clear previous error

        if (!this.#session()) {
            console.log('Initialize session.');
            await this.init();
        }

        try {
            const session = this.#session();
            if (session) {
                const responseText = await session.prompt(
                    [{
                        role: 'user', content: [
                            {
                                type: 'text', value: 'Translate the audio clip to text:',
                            },
                            {
                                type: 'audio',
                                value: audioBlob,
                            }
                        ] 
                    }]);
                console.log('Transcription result:', responseText);
                return responseText;
            } else {
                const errorText = 'The prompt session is not initialized.';
                console.error('The prompt session is not initialized.');
                this.#strError.set(errorText);
                return '';
            }
        } catch (promptError) {
            this.handleErrors(promptError);
            return '';
        }
    }

    private handleErrors(promptError: unknown) {
        if (promptError instanceof DOMException) {
            const error = this.errors[promptError.name];
            if (error) {
                console.error(error);
                this.#strError.set(error);
            }
        } else if (promptError instanceof Error && promptError.message) {
            console.error(promptError.message);
            this.#strError.set(promptError.message);
        } else {
            console.error(promptError);
            this.#strError.set(this.errors['UnknownError']);
        }
    }

    ngOnDestroy(): void {
        this.#controller.abort();
        this.#session.set(undefined);
    }
}
