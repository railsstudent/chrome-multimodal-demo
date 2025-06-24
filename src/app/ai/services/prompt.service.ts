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
    downloadPercentage = signal(100);

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NetworkError': 'The network is not available to download the AI model.',
        'NotAllowedError': 'The session is not allowed to create.',
        'OperationError': 'Operation error occurred when creating the session for the options',
        'QuotaExceededError': 'Prompt API Quota exceeded. Please try again later.',
        'UnknownError': 'Unknown error occurred while using the translator.',
        'TypeError': 'Invalid type and value combination in the multimodal input.',
        'EncodingError': 'Multimodal input (e.g. image or audio) does not support the format or error in decoding the data',
    }

    private async isCreateMonitorCallbackNeeded(options: LanguageModelCreateCoreOptions) {
        const availability = await LanguageModel.availability(options);

        return ['downloadable', 'downloading'].includes(availability);
    }

    async init() {
        const requireMonitor = await this.isCreateMonitorCallbackNeeded(LANGUAGE_MODEL_OPTIONS);
        if (!requireMonitor) {
            this.downloadPercentage.set(100);            
        }
        
        try {
            const session = await LanguageModel.create({
                ...LANGUAGE_MODEL_OPTIONS,
                signal: this.#controller.signal,
                monitor: requireMonitor ? (monitor: CreateMonitor) => 
                    monitor.addEventListener("downloadprogress", (e) => {
                        const percentage = Math.floor(e.loaded * 100);
                        console.log(`Language Model: Downloaded ${percentage}%`);
                        this.downloadPercentage.set(percentage);
                    }) : undefined,
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
        }
    }

    async transcribeAudio(audioBlob: Blob): Promise<string> {
        if (!this.#session()) {
            await this.init();
        }

        if (this.#session()) {
            const session = this.#session() as LanguageModel; 
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
            return responseText;
        } else {
            console.error('Language Model session is not initialized.');
            this.#strError.set('Language Model session is not initialized.');
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
