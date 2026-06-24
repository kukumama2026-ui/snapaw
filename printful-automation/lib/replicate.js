import Replicate from 'replicate';

const THEME_PROMPTS = {
  rainbow_bridge: 'gentle watercolor portrait of the pet walking across a soft rainbow bridge toward a warm sunrise, peaceful clouds, serene and comforting mood',
  guardian_star: 'tender portrait of the pet resting among soft glowing stars in a deep blue night sky, watching over like a guardian, dreamy watercolor style',
  forever_garden: 'warm portrait of the pet resting in a peaceful sunlit flower garden, soft pastel watercolor, calm and loving atmosphere',
  golden_light: "portrait of the pet bathed in warm golden hour light, soft glowing rim light around the pet's silhouette, gentle and reverent mood, fine art style",
  cherished_moment: 'soft realistic fine art portrait of the pet in a relaxed, joyful pose, warm muted color palette, timeless keepsake painting style',
  gentle_clouds: 'dreamy portrait of the pet resting peacefully on soft clouds above a calm landscape, soft pastel tones, comforting and quiet mood',
};

export async function transformImage(imageUrl, theme) {
  const prompt = THEME_PROMPTS[theme];
  if (!prompt) throw new Error(`Unknown theme: ${theme}`);

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  const output = await replicate.run(process.env.REPLICATE_MODEL_VERSION, {
    input: {
      input_image: imageUrl,
      prompt: `${prompt}, keep the pet's face and markings recognizable, high quality digital painting, no text, no watermark`,
      output_format: 'png',
    },
  });

  // flux-kontext-pro returns a single file output object with a .url() method.
  if (output && typeof output.url === 'function') return output.url();
  return Array.isArray(output) ? output[0] : output;
}

export const SUPPORTED_THEMES = Object.keys(THEME_PROMPTS);
