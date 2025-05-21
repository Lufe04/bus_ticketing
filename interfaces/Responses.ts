export interface APIResponse{
    "candidates": [
        {
            "content": {
                "parts": [
                    {
                        "text": "respuesta"
                    }
                ],
                "role": "model"
            },
            "finishReason": "STOP",
            "citationMetadata": {
                "citationSources": [
                    {
                        "startIndex": 3057,
                        "endIndex": 3208
                    },
                    {
                        "startIndex": 3811,
                        "endIndex": 3976
                    },
                    {
                        "startIndex": 4182,
                        "endIndex": 4330,
                        "uri": "https://github.com/santokalayil/ai_course"
                    }
                ]
            },
            "avgLogprobs": -0.26713195411471252
        }
    ],
    "usageMetadata": {
        "promptTokenCount": 4,
        "candidatesTokenCount": 1411,
        "totalTokenCount": 1415,
        "promptTokensDetails": [
            {
                "modality": "TEXT",
                "tokenCount": 4
            }
        ],
        "candidatesTokensDetails": [
            {
                "modality": "TEXT",
                "tokenCount": 1411
            }
        ]
    },
    "modelVersion": "gemini-2.0-flash"
}