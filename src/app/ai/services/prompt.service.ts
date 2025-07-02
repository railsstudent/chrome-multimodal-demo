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

    #chunk = signal('');
    chunk = this.#chunk.asReadonly();

    #isTranscribing = signal(false);
    isTranscribing = this.#isTranscribing.asReadonly();

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

    async transcribeAudioStream(audio: Blob): Promise<void> {
        this.#strError.set(''); // Clear previous error
        this.#chunk.set('');    // clear previous chunk

        if (!this.#session()) {
            console.log('Initialize session.');
            await this.init();
        }

        try {
            const session = this.#session();
            if (session) {
                const stream = await session.promptStreaming(
                    [{
                        role: 'user', content: [
                            {
                                type: 'text', value: 'Translate the audio clip to text:',
                            },
                            {
                                type: 'audio',
                                value: audio,
                            }
                        ] 
                    }], 
                    { signal: this.#controller.signal}
                );

                const self = this;
                const reader = stream.getReader();
                reader.read()
                    .then(function processText({ done, value }: ReadableStreamReadResult<string>): Promise<any> {
                        if (done) {
                            return Promise.resolve();
                        }

                        self.#chunk.update((prevChunk) => prevChunk + value);
                        return reader.read().then(processText);
                    })
                    .finally(() => self.#isTranscribing.set(false));
            } else {
                const errorText = 'The prompt session is not initialized.';
                console.error('The prompt session is not initialized.');
                this.#strError.set(errorText);
            }
        } catch (promptError) {
            this.handleErrors(promptError);
        }
    }

    requestAudioToText(): void {
        this.#isTranscribing.set(true);
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
