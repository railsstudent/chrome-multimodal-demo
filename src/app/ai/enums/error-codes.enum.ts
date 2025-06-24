export enum ERROR_CODES {
    LANGUAGE_MODEL_UNAVAILABLE = 'The language model is not available. Please check your configuration in chrome://flags/#optimization-guide-on-device-model.',
    NO_PROMPT_API = 'The Prompt API is not supported. Please check your configuration in chrome://flags/#prompt-api-for-gemini-nano.',
    NO_PROMPT_API_WITH_MULTIMODAL_INPUT = 'The Prompt API with multimodal input is not supported. Please check your configuration in chrome://flags/#prompt-api-for-gemini-nano-multimodal-input.',
    NO_WRITER_API = "The Writer API is not supported. Please check your configuration in chrome://flags/#writer-api-for-gemini-nano.",
    WRITER_MODEL_UNAVAILABLE = "The writer model is not available. Please check your configuration in chrome://flags/#optimization-guide-on-device-model.",
 }
 