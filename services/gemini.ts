export async function generateNailArt(
    userAccessToken: string,
    templateImageUrl: string,
    handImageUrl: string
) {
    // NOTE: In a real "User-Pays" scenario, you use the user's Access Token.
    // However, for the Gemini Pro Vision API specifically, you typically use the API Key
    // but you can map the usage to the user's project if they are the one calling it.

    // For this implementation, we will use the Server API Key but log the user ID for quota tracking.

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${userAccessToken}` // If using OAuth direct call
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: "You are a professional nail artist. Analyze the nail art pattern from the FIRST image (the template) and expertly apply it to the hand shown in the SECOND image. Maintain realistic skin texture and lighting. Do not change the shape of the nails, only the design."
                            },
                            { inline_data: { mime_type: "image/jpeg", data: await imageUrlToBase64(templateImageUrl) } },
                            { inline_data: { mime_type: "image/jpeg", data: await imageUrlToBase64(handImageUrl) } }
                        ]
                    }
                ]
            })
        }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.inline_data?.data) {
        return `data:image/png;base64,${data.candidates[0].content.parts[0].inline_data.data}`;
    }

    throw new Error("Generation failed");
}

// Helper to fetch image and convert to base64 for Gemini
async function imageUrlToBase64(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}