import { config } from 'dotenv';
config();

import '@/ai/flows/image-generation-from-prompt.ts';
import '@/ai/flows/audio-generation-from-text.ts';
import '@/ai/flows/text-generation-from-prompt.ts';
import '@/ai/flows/usage-limit-enforcement.ts';