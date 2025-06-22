export const LANGUAGE_MODEL_OPTIONS: LanguageModelCreateCoreOptions = {
    expectedInputs: [
        { type: "text", languages: ['en'] },
        { type: "audio", languages: ['en'] },
    ],
    expectedOutputs: [
        { type: 'text', languages: ['en'] }
    ]
}
